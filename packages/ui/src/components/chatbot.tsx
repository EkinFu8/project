import { Bot, Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatHistory } from "./chatbot/history";
import { ASSISTANT_TOOLS, DEFAULT_MODEL } from "./chatbot/knowledge";
import { ChatMessages } from "./chatbot/messages";
import { buildGreeting, buildSystemPrompt } from "./chatbot/prompt";
import { styles } from "./chatbot/styles";
import { ChatTitle } from "./chatbot/title";
import type { ChatMessage, ChatRole, CMSChatbotProps } from "./chatbot/types";

function resizeTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
}

function Launcher({ onSubmitQuestion }: { onSubmitQuestion?: (question: string) => void }) {
  const [value, setValue] = useState("");

  function submit() {
    const question = value.trim();
    if (!question) return;
    setValue("");
    onSubmitQuestion?.(question);
  }

  return (
    <div style={styles.launcherRoot}>
      <div style={styles.launcher}>
        <div style={styles.launcherIcon}>
          <Bot size={17} aria-hidden="true" />
        </div>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="Ask Gompei..."
          style={styles.launcherInput}
          aria-label="Ask Gompei"
        />
        <button type="button" onClick={submit} style={styles.launcherButton} aria-label="Ask">
          <Send size={15} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Groq streaming helper (OpenAI-compatible)
// Calls /openai/v1/chat/completions with stream=true and invokes onToken with
// the accumulated text as each server-sent event arrives.
// Sign up for a free API key at console.groq.com
// Recommended model: "llama-3.3-70b-versatile"
// ---------------------------------------------------------------------------
async function streamGroqMessage({
  apiKey,
  modelId,
  systemPrompt,
  messages,
  onToken,
}: {
  apiKey: string;
  modelId: string;
  systemPrompt: string;
  messages: { role: ChatRole; content: string }[];
  onToken: (accumulated: string) => void;
}): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: 1024,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error ${response.status}: ${error}`);
  }

  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") break;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          accumulated += delta;
          onToken(accumulated);
        }
      } catch {
        // Ignore malformed SSE lines
      }
    }
  }

  return accumulated;
}

// ---------------------------------------------------------------------------
// Main chatbot component
// ---------------------------------------------------------------------------
export default function CMSChatbot({
  context,
  initialPrompt,
  initialMessages,
  history = [],
  activeConversationId,
  mode = "launcher",
  // DEFAULT_MODEL should now be a Groq model ID, e.g. "llama-3.3-70b-versatile"
  modelId = DEFAULT_MODEL,
  apiKey = "", // <-- pass your Groq API key via this prop (console.groq.com)
  onDeleteConversation,
  onNavigate,
  onNewConversation,
  onPersistMessage,
  onRunSiteAction,
  onSelectConversation,
  onSubmitQuestion,
}: CMSChatbotProps & { apiKey?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => initialMessages ?? []);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialPromptSentRef = useRef(false);
  const nextId = useRef(0);

  const systemPrompt = useMemo(
    () => buildSystemPrompt({ context, tools: ASSISTANT_TOOLS }),
    [context],
  );

  // Mark the component as ready on mount.
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Reset the prompt-sent flag whenever the conversation changes.
  useEffect(() => {
    initialPromptSentRef.current = false;
  }, [activeConversationId]);

  // Set messages once initialMessages resolves for the active conversation.
  // Shows the greeting for brand-new empty conversations.
  // Depends on both activeConversationId and initialMessages so it re-runs
  // when the query resolves after a conversation switch.
  useEffect(() => {
    if (initialMessages === undefined) return; // query still loading — wait
    setMessages(
      initialMessages.length > 0
        ? initialMessages
        : [
            {
              id: `local-${nextId.current++}`,
              role: "assistant" as ChatRole,
              content: buildGreeting(context),
            },
          ],
    );
  }, [activeConversationId, initialMessages]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync persisted messages within the same conversation (e.g. optimistic
  // local IDs replaced by server IDs after a save). Only grows the list so
  // it never clobbers a mid-conversation state.
  useEffect(() => {
    if (!initialMessages) return;
    setMessages((current) => {
      if (current.length > initialMessages.length) return current;
      return initialMessages;
    });
  }, [initialMessages]);

  const appendMessage = useCallback((role: ChatRole, content: string) => {
    const message: ChatMessage = { id: `local-${nextId.current}`, role, content };
    nextId.current += 1;
    setMessages((current) => [...current, message]);
    return message;
  }, []);

  const updateMessage = useCallback((id: string | number, content: string) => {
    setMessages((current) =>
      current.map((message) => (message.id === id ? { ...message, content } : message)),
    );
  }, []);

  const replaceMessage = useCallback((id: string | number, persistedMessage?: ChatMessage) => {
    if (!persistedMessage) return;
    setMessages((current) =>
      current.map((message) => (message.id === id ? persistedMessage : message)),
    );
  }, []);

  const persistMessage = useCallback(
    async (message: { role: ChatRole; content: string }) => {
      return onPersistMessage?.(message);
    },
    [onPersistMessage],
  );

  const sendMessage = useCallback(
    async (overrideText?: string) => {
      const text = (overrideText ?? input).trim();
      if (!text || !isReady) return;

      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";

      const userMessage = appendMessage("user", text);
      const assistantMessage = appendMessage("assistant", "");
      setIsTyping(true);

      const persistUserMessage = persistMessage({ role: "user", content: userMessage.content })
        .then((persistedMessage) => {
          replaceMessage(userMessage.id, persistedMessage);
          return persistedMessage;
        })
        .catch((error) => console.error("Gompei user message persist error:", error));

      const siteActionResult = await onRunSiteAction?.({ prompt: text });
      if (siteActionResult) {
        setIsTyping(false);
        updateMessage(assistantMessage.id, siteActionResult);
        await persistUserMessage;
        const persistedMessage = await persistMessage({
          role: "assistant",
          content: siteActionResult,
        });
        replaceMessage(assistantMessage.id, persistedMessage);
        return;
      }

      try {
        let finalContent = "";
        await streamGroqMessage({
          apiKey,
          modelId,
          systemPrompt,
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage.content },
          ],
          onToken: (accumulated) => {
            finalContent = accumulated;
            setIsTyping(false);
            updateMessage(assistantMessage.id, accumulated);
          },
        });

        if (finalContent.trim()) {
          await persistUserMessage;
          const persistedMessage = await persistMessage({
            role: "assistant",
            content: finalContent,
          });
          replaceMessage(assistantMessage.id, persistedMessage);
        }
      } catch (error) {
        console.error("Gompei chat error:", error);
        updateMessage(
          assistantMessage.id,
          "I could not finish that response. Give me a moment, then try again.",
        );
      } finally {
        setIsTyping(false);
      }
    },
    [
      apiKey,
      appendMessage,
      input,
      isReady,
      messages,
      modelId,
      onRunSiteAction,
      persistMessage,
      replaceMessage,
      systemPrompt,
      updateMessage,
    ],
  );

  // Fire the initial prompt once the component is ready and the conversation
  // query has resolved — prevents sending before messages are initialised.
  useEffect(() => {
    const question = initialPrompt?.trim();
    if (!question || !isReady || initialPromptSentRef.current) return;
    if (initialMessages === undefined) return; // wait for query to resolve
    initialPromptSentRef.current = true;
    void sendMessage(question);
  }, [initialPrompt, initialMessages, isReady, sendMessage]);

  function handleTextareaChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(event.target.value);
    resizeTextarea(event.target);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  if (mode === "launcher") {
    return <Launcher onSubmitQuestion={onSubmitQuestion} />;
  }

  const isDisabled = !isReady || isTyping;

  return (
    <section style={styles.pageRoot}>
      {/* status/progress bar is no longer needed — model loads instantly */}
      <ChatTitle progress={100} status="ready" />

      <div style={styles.pageWorkspace}>
        <ChatHistory
          activeConversationId={activeConversationId}
          history={history}
          onDeleteConversation={onDeleteConversation}
          onNewConversation={onNewConversation}
          onSelectConversation={onSelectConversation}
        />

        <main style={styles.chatPanel}>
          <ChatMessages
            availableActions={context.actions ?? []}
            contextUserName={context.user.name}
            isTyping={isTyping}
            messages={messages}
            onNavigate={onNavigate}
          />

          <div style={styles.pageInputRow}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              disabled={isDisabled}
              placeholder="Ask Gompei anything about iBank..."
              rows={1}
              style={{ ...styles.pageTextarea, opacity: isDisabled ? 0.45 : 1 }}
            />
            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={isDisabled}
              style={{ ...styles.sendButton, opacity: isDisabled ? 0.35 : 1 }}
              aria-label="Send message"
            >
              <Send size={16} aria-hidden="true" />
            </button>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.42} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
      `}</style>
    </section>
  );
}

import { Bot, ExternalLink, Minus, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatHistory } from "./chatbot/history";
import { ASSISTANT_TOOLS, DEFAULT_MODEL } from "./chatbot/knowledge";
import { ChatMessages } from "./chatbot/messages";
import { buildGreeting, buildSystemPrompt } from "./chatbot/prompt";
import { styles } from "./chatbot/styles";
import { ChatTitle } from "./chatbot/title";
import type { ChatMessage, ChatRole, CMSChatbotProps } from "./chatbot/types";

type LauncherView = "collapsed" | "compact" | "expanded";

function resizeTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
}

function LauncherKeyframes() {
  return (
    <style>{`
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.42} }
      @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
      @keyframes chatMessageEnter {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes launcherBubbleEnter {
        from { opacity: 0; transform: scale(0.6) translateY(8px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes launcherPillEnter {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes launcherPanelEnter {
        from { opacity: 0; transform: translateY(12px) scale(0.96); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
    `}</style>
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
  suggestions = [],
  activeConversationId,
  mode = "launcher",
  // DEFAULT_MODEL should now be a Groq model ID, e.g. "llama-3.3-70b-versatile"
  modelId = DEFAULT_MODEL,
  apiKey = "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",
  onBeforeRespond,
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
  const [launcherView, setLauncherView] = useState<LauncherView>("compact");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pillInputRef = useRef<HTMLInputElement>(null);
  const initialPromptSentRef = useRef(false);
  const lastSyncedConvoIdRef = useRef(activeConversationId);
  const nextId = useRef(0);

  // The system prompt is rebuilt fresh inside sendMessage from contextRef so
  // it reflects any snapshot updates that landed during onBeforeRespond.
  // sendMessage's closure would otherwise capture a stale systemPrompt.
  const contextRef = useRef(context);
  contextRef.current = context;

  // Mark the component as ready on mount.
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Broadcast how much extra vertical space the launcher needs above the
  // pill's footprint so other floating UI (e.g. the document-review notice)
  // can lift itself by exactly the same amount the launcher grows. This
  // preserves the gap above the launcher across compact↔expanded so the
  // movement looks natural rather than overshooting.
  useEffect(() => {
    if (mode !== "launcher") return;
    const root = document.documentElement;
    // Panel = 560px, pill ≈ 46px. Lift by the difference so the gap above
    // the launcher stays constant.
    const clearance = launcherView === "expanded" ? "514px" : "0px";
    root.style.setProperty("--gompei-launcher-clearance", clearance);
    return () => {
      root.style.removeProperty("--gompei-launcher-clearance");
    };
  }, [launcherView, mode]);

  // Reset the prompt-sent flag when the active conversation changes so a
  // fresh quick-chat session can auto-send its initial prompt.
  // biome-ignore lint/correctness/useExhaustiveDependencies: ref reset must run when activeConversationId switches
  useEffect(() => {
    initialPromptSentRef.current = false;
  }, [activeConversationId]);

  // Sync messages with the active conversation. Shows the greeting for
  // brand-new empty conversations. Preserves local state when it has more
  // messages than the server within the SAME conversation (mid-stream or
  // pending persistence) so an in-flight refetch never clobbers an
  // optimistic message. Force-replaces on conversation switches so the
  // sidebar's pick always wins.
  useEffect(() => {
    if (initialMessages === undefined) return;
    const isConvoSwitch = lastSyncedConvoIdRef.current !== activeConversationId;
    lastSyncedConvoIdRef.current = activeConversationId;
    setMessages((current) => {
      if (!isConvoSwitch && current.length > initialMessages.length) return current;
      return initialMessages.length > 0
        ? initialMessages
        : [
            {
              id: `local-${nextId.current++}`,
              role: "assistant" as ChatRole,
              content: buildGreeting(context),
            },
          ];
    });
  }, [activeConversationId, context, initialMessages]);

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
        // Refresh the parent's snapshot queries so the system prompt the
        // model sees reflects whatever the user just did (in this chat or
        // anywhere else in the app). Then rebuild the prompt from the
        // up-to-date context — sendMessage's closure has the stale one.
        if (onBeforeRespond) {
          await onBeforeRespond();
          // Yield one frame so React commits the re-render triggered by
          // any query invalidations before we read contextRef.
          await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
        }
        const freshSystemPrompt = buildSystemPrompt({
          context: contextRef.current,
          tools: ASSISTANT_TOOLS,
        });

        let finalContent = "";
        await streamGroqMessage({
          apiKey,
          modelId,
          systemPrompt: freshSystemPrompt,
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
      onBeforeRespond,
      onRunSiteAction,
      persistMessage,
      replaceMessage,
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

  const isDisabled = !isReady || isTyping;

  if (mode === "launcher") {
    function handlePillSubmit() {
      const question = input.trim();
      if (!question) {
        setLauncherView("expanded");
        requestAnimationFrame(() => textareaRef.current?.focus());
        return;
      }
      setLauncherView("expanded");
      // sendMessage reads from `input`; pass the question explicitly and
      // clear it inside sendMessage so the panel textarea opens empty.
      void sendMessage(question);
      onSubmitQuestion?.(question);
    }

    function expandToPanel() {
      setLauncherView("expanded");
      requestAnimationFrame(() => textareaRef.current?.focus());
    }

    function collapseToBubble() {
      setLauncherView("collapsed");
    }

    function minimizeToPill() {
      setLauncherView("compact");
      requestAnimationFrame(() => pillInputRef.current?.focus());
    }

    function openInFullPage() {
      const target = activeConversationId ? `/gompei?chat=${activeConversationId}` : "/gompei";
      onNavigate?.(target);
    }

    if (launcherView === "collapsed") {
      return (
        <div style={styles.launcherRoot}>
          <button
            type="button"
            onClick={expandToPanel}
            style={styles.launcherBubble}
            aria-label="Open Gompei chat"
            onMouseEnter={(event) => {
              event.currentTarget.style.transform = "scale(1.06)";
              event.currentTarget.style.boxShadow =
                "0 22px 52px rgba(22,71,52,0.40), 0 6px 18px rgba(15,23,42,0.22)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = "scale(1)";
              event.currentTarget.style.boxShadow =
                "0 16px 40px rgba(22,71,52,0.32), 0 4px 14px rgba(15,23,42,0.18)";
            }}
          >
            <Bot size={26} aria-hidden="true" />
          </button>
          <LauncherKeyframes />
        </div>
      );
    }

    const pill = (
      <div style={styles.launcher}>
        <button
          type="button"
          onClick={expandToPanel}
          style={{ ...styles.launcherIcon, cursor: "pointer", border: 0 }}
          aria-label="Expand Gompei chat"
          title="Open chat panel"
        >
          <Bot size={17} aria-hidden="true" />
        </button>
        <input
          ref={pillInputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handlePillSubmit();
            }
          }}
          placeholder="Ask Gompei..."
          style={styles.launcherInput}
          aria-label="Ask Gompei"
        />
        <button
          type="button"
          onClick={collapseToBubble}
          style={styles.launcherPillControl}
          aria-label="Hide Gompei"
          title="Hide"
          onMouseEnter={(event) => {
            event.currentTarget.style.background = "var(--color-muted)";
            event.currentTarget.style.color = "var(--color-foreground)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = "transparent";
            event.currentTarget.style.color = "var(--color-muted-foreground)";
          }}
        >
          <X size={15} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={handlePillSubmit}
          style={styles.launcherButton}
          aria-label="Ask"
        >
          <Send size={15} aria-hidden="true" />
        </button>
      </div>
    );

    if (launcherView === "compact") {
      return (
        <div style={styles.launcherRoot}>
          {pill}
          <LauncherKeyframes />
        </div>
      );
    }

    // Expanded panel
    const showSuggestions =
      suggestions.length > 0 && !messages.some((m) => m.role === "user") && !isTyping;

    return (
      <div style={styles.launcherRoot}>
        <div style={styles.launcherPanel}>
          <header style={styles.launcherPanelHeader}>
            <div style={styles.launcherPanelAvatar}>
              <Bot size={18} aria-hidden="true" />
            </div>
            <div style={styles.launcherPanelTitleWrap}>
              <h2 style={styles.launcherPanelTitle}>Gompei</h2>
              <div style={styles.launcherPanelStatus}>
                <span style={styles.launcherPanelStatusDot} />
                <span>{isTyping ? "Thinking…" : "Online"}</span>
              </div>
            </div>
            <div style={styles.launcherPanelControls}>
              <button
                type="button"
                onClick={openInFullPage}
                style={styles.launcherPanelControl}
                aria-label="Open in full page"
                title="Open in full page"
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = "var(--color-muted)";
                  event.currentTarget.style.color = "var(--color-foreground)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = "transparent";
                  event.currentTarget.style.color = "var(--color-muted-foreground)";
                }}
              >
                <ExternalLink size={15} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={minimizeToPill}
                style={styles.launcherPanelControl}
                aria-label="Minimize to pill"
                title="Minimize"
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = "var(--color-muted)";
                  event.currentTarget.style.color = "var(--color-foreground)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = "transparent";
                  event.currentTarget.style.color = "var(--color-muted-foreground)";
                }}
              >
                <Minus size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={collapseToBubble}
                style={styles.launcherPanelControl}
                aria-label="Close chat"
                title="Close"
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = "var(--color-muted)";
                  event.currentTarget.style.color = "var(--color-foreground)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = "transparent";
                  event.currentTarget.style.color = "var(--color-muted-foreground)";
                }}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          </header>

          <div style={styles.launcherPanelMessages}>
            <ChatMessages
              availableActions={context.actions ?? []}
              contextUserName={context.user.name}
              isTyping={isTyping}
              messages={messages}
              onNavigate={onNavigate}
            />
          </div>

          {showSuggestions ? (
            <div style={styles.launcherPanelSuggestions}>
              <p style={styles.launcherPanelSuggestionLabel}>Try one of these</p>
              {suggestions.slice(0, 3).map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => void sendMessage(s.prompt)}
                  disabled={isDisabled}
                  style={{
                    ...styles.launcherPanelSuggestion,
                    opacity: isDisabled ? 0.5 : 1,
                  }}
                  onMouseEnter={(event) => {
                    if (isDisabled) return;
                    event.currentTarget.style.background = "rgba(22,71,52,0.06)";
                    event.currentTarget.style.borderColor = "rgba(22,71,52,0.30)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = "var(--color-card)";
                    event.currentTarget.style.borderColor = "var(--color-border)";
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          ) : null}

          <div style={styles.launcherPanelInputRow}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              disabled={isDisabled}
              placeholder="Ask Gompei anything…"
              rows={1}
              style={{ ...styles.launcherPanelTextarea, opacity: isDisabled ? 0.55 : 1 }}
            />
            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={isDisabled || !input.trim()}
              style={{
                ...styles.launcherPanelSendButton,
                opacity: isDisabled || !input.trim() ? 0.4 : 1,
              }}
              aria-label="Send message"
            >
              <Send size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
        <LauncherKeyframes />
      </div>
    );
  }

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

          {suggestions.length > 0 && !messages.some((m) => m.role === "user") && !isTyping ? (
            <div style={styles.suggestionsRow}>
              <p style={styles.suggestionLabel}>Try one of these</p>
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => void sendMessage(s.prompt)}
                  disabled={isDisabled}
                  style={{
                    ...styles.actionButton,
                    ...styles.primaryActionButton,
                    opacity: isDisabled ? 0.4 : 1,
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          ) : null}

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

      <LauncherKeyframes />
    </section>
  );
}

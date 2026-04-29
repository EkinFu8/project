import type * as webllm from "@mlc-ai/web-llm";
import { Bot, ExternalLink, Send, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ASSISTANT_TOOLS, DEFAULT_MODEL } from "./chatbot/knowledge";
import { buildGreeting, buildSystemPrompt } from "./chatbot/prompt";
import { statusColor, statusLabel } from "./chatbot/status";
import { styles } from "./chatbot/styles";
import type { AssistantAction, ChatMessage, ChatRole, CMSChatbotProps } from "./chatbot/types";
import { useWebLlmAssistant } from "./chatbot/use-web-llm-assistant";

type ParsedMessage = {
  blocks: MessageBlock[];
};

type MessageBlock =
  | { type: "markdown"; content: string }
  | { type: "actions"; actions: AssistantAction[] };

const ACTION_PATTERN = /^ACTION:\s*(\/[^\s|]*)\s*\|\s*(.+)$/i;
const LOOSE_ACTION_PATTERN = /^[-*]?\s*Action:\s*`?\s*(\/[^`|]+?)\s*\|\s*([^`]+?)\s*`?\.?$/i;

function resizeTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
}

function parseActionLine(line: string): AssistantAction | null {
  const trimmed = line.trim();
  const match = trimmed.match(ACTION_PATTERN) ?? trimmed.match(LOOSE_ACTION_PATTERN);
  const to = match?.[1]?.trim();
  const label = match?.[2]?.trim();
  if (!to || !label) return null;
  return { to, label, tone: "primary" };
}

function parseAssistantMessage(content: string): ParsedMessage {
  const blocks: MessageBlock[] = [];
  const lines = content.split("\n");
  const textLines: string[] = [];

  function flushText() {
    const content = textLines.join("\n").trim();
    if (content) {
      blocks.push({ type: "markdown", content });
    }
    textLines.length = 0;
  }

  for (const line of lines) {
    const action = parseActionLine(line);
    if (action) {
      flushText();
      blocks.push({ type: "actions", actions: [action] });
      continue;
    }
    textLines.push(line);
  }

  flushText();
  return { blocks };
}

function actionAllowed(action: AssistantAction, allActions: AssistantAction[]) {
  return allActions.some((candidate) => candidate.to === action.to);
}

function actionKey(action: AssistantAction) {
  return `${action.to}:${action.label}`;
}

function inferActionsFromText(text: string, availableActions: AssistantAction[]) {
  const lower = text.toLowerCase();
  const keywordByRoute: Record<string, string[]> = {
    "/dashboard": ["dashboard", "metrics", "audit"],
    "/notifications": ["notifications", "notification", "reminders"],
    "/hero/content": ["content library", "content", "documents", "search"],
    "/hero/content/new": ["new content", "create content", "upload"],
    "/users": ["users", "user management", "accounts"],
    "/tags": ["tags", "meta tags"],
    "/employees": ["coworkers", "employees", "directory"],
    "/help": ["help"],
  };

  return availableActions.filter((action) => {
    const keywords = keywordByRoute[action.to] ?? [];
    return keywords.some((keyword) => lower.includes(keyword));
  });
}

function mergeActions(actions: AssistantAction[], inferred: AssistantAction[]) {
  const seen = new Set(actions.map((action) => action.to));
  return [
    ...actions,
    ...inferred.filter((action) => {
      if (seen.has(action.to)) return false;
      seen.add(action.to);
      return true;
    }),
  ];
}

function renderInlineMarkdown(text: string) {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match = pattern.exec(text);

  while (match !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(<strong key={`${match.index}-${token}`}>{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(
        <code key={`${match.index}-${token}`} style={styles.inlineCode}>
          {token.slice(1, -1)}
        </code>,
      );
    }
    lastIndex = match.index + token.length;
    match = pattern.exec(text);
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const nodes: ReactNode[] = [];
  let listItems: { ordered: boolean; text: string }[] = [];

  function flushList() {
    if (listItems.length === 0) return;
    const ordered = listItems[0]?.ordered ?? false;
    const ListTag = ordered ? "ol" : "ul";
    nodes.push(
      <ListTag
        key={`list-${nodes.length}`}
        style={ordered ? styles.orderedList : styles.unorderedList}
      >
        {listItems.map((item) => (
          <li
            key={`${item.ordered ? "ordered" : "unordered"}-${item.text}`}
            style={styles.listItem}
          >
            {renderInlineMarkdown(item.text)}
          </li>
        ))}
      </ListTag>,
    );
    listItems = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading?.[2]) {
      flushList();
      nodes.push(
        <div key={`heading-${nodes.length}`} style={styles.markdownHeading}>
          {renderInlineMarkdown(heading[2])}
        </div>,
      );
      continue;
    }

    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);
    if (ordered?.[1]) {
      listItems.push({ ordered: true, text: ordered[1] });
      continue;
    }

    const unordered = trimmed.match(/^[-*]\s+(.+)$/);
    if (unordered?.[1]) {
      listItems.push({ ordered: false, text: unordered[1] });
      continue;
    }

    flushList();
    nodes.push(
      <p key={`paragraph-${nodes.length}`} style={styles.markdownParagraph}>
        {renderInlineMarkdown(trimmed)}
      </p>,
    );
  }

  flushList();
  return nodes;
}

function SuggestedActionButton({
  action,
  onNavigate,
}: {
  action: AssistantAction;
  onNavigate?: (to: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onNavigate?.(action.to)}
      style={{
        ...styles.actionButton,
        ...(action.tone === "primary" ? styles.primaryActionButton : null),
      }}
    >
      <span>{action.label}</span>
      <ExternalLink size={13} aria-hidden="true" />
    </button>
  );
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

export default function CMSChatbot({
  context,
  initialPrompt,
  mode = "launcher",
  modelId = DEFAULT_MODEL,
  onNavigate,
  onSubmitQuestion,
}: CMSChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialPromptSentRef = useRef(false);
  const nextId = useRef(0);

  const availableActions = useMemo(() => context.actions ?? [], [context.actions]);
  const systemPrompt = useMemo(
    () => buildSystemPrompt({ context, tools: ASSISTANT_TOOLS }),
    [context],
  );

  const appendMessage = useCallback((role: ChatRole, content: string) => {
    const message: ChatMessage = { id: nextId.current, role, content };
    nextId.current += 1;
    setMessages((current) => [...current, message]);
    return message;
  }, []);

  const updateMessage = useCallback((id: number, content: string) => {
    setMessages((current) =>
      current.map((message) => (message.id === id ? { ...message, content } : message)),
    );
  }, []);

  const handleReady = useCallback(() => {
    setMessages((current) => {
      if (current.length > 0 || initialPrompt?.trim()) {
        return current;
      }

      const greeting: ChatMessage = {
        id: nextId.current,
        role: "assistant",
        content: buildGreeting(context),
      };
      nextId.current += 1;
      return [greeting];
    });
  }, [context, initialPrompt]);

  const { complete, hasGpu, progress, status } = useWebLlmAssistant({
    enabled: mode === "page",
    modelId,
    onReady: handleReady,
  });

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  });

  const sendMessage = useCallback(
    async (overrideText?: string) => {
      const text = (overrideText ?? input).trim();
      if (!text || status !== "ready") {
        return;
      }

      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      const userMessage = appendMessage("user", text);
      const assistantMessage = appendMessage("assistant", "");
      setIsTyping(true);

      const chatMessages: webllm.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        ...messages.map((message) => ({ role: message.role, content: message.content })),
        { role: "user", content: userMessage.content },
      ];

      try {
        await complete({
          messages: chatMessages,
          onToken: (content) => {
            setIsTyping(false);
            updateMessage(assistantMessage.id, content);
          },
        });
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
    [appendMessage, complete, input, messages, status, systemPrompt, updateMessage],
  );

  useEffect(() => {
    const question = initialPrompt?.trim();
    if (!question || status !== "ready" || initialPromptSentRef.current) {
      return;
    }

    initialPromptSentRef.current = true;
    void sendMessage(question);
  }, [initialPrompt, sendMessage, status]);

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

  const isDisabled = status !== "ready";

  return (
    <section style={styles.pageRoot}>
      <div style={styles.pageShell}>
        <header style={styles.pageHeader}>
          <div style={styles.pageAvatar}>
            <Bot size={22} aria-hidden="true" />
          </div>
          <div>
            <h1 style={styles.pageTitle}>Gompei</h1>
            <p style={styles.pageSubtitle}>
              Ask about this workspace, documents, notifications, and what to do next.
            </p>
          </div>
          <div
            aria-label={statusLabel(status, progress)}
            role="status"
            style={{
              ...styles.statusDot,
              background: statusColor(status),
              animation:
                status === "loading" || status === "generating"
                  ? "pulse 1s ease-in-out infinite"
                  : "none",
            }}
          />
        </header>

        {!hasGpu ? (
          <div style={styles.gpuWarning}>
            Gompei needs WebGPU locally. Use Chrome 113+ or Edge 113+ for chat.
          </div>
        ) : null}

        {status === "loading" ? (
          <div style={styles.loadPane}>
            <div style={styles.loadHeader}>
              <Sparkles size={15} aria-hidden="true" />
              <span>Preparing Gompei</span>
            </div>
            <div style={styles.progressTrack}>
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: "#164734",
                  borderRadius: 999,
                  transition: "width 0.3s",
                }}
              />
            </div>
            <div style={styles.progressLabel}>{progress}%</div>
          </div>
        ) : null}

        <div ref={messagesRef} style={styles.pageMessages}>
          {messages.map((message) => {
            const parsed =
              message.role === "assistant"
                ? parseAssistantMessage(message.content)
                : { blocks: [{ type: "markdown", content: message.content }] as MessageBlock[] };
            const markdownText = parsed.blocks
              .filter((block) => block.type === "markdown")
              .map((block) => block.content)
              .join("\n");
            const hasExplicitActions = parsed.blocks.some((block) => block.type === "actions");
            const inferredActions =
              message.role === "assistant" && !hasExplicitActions
                ? inferActionsFromText(markdownText, availableActions)
                : [];

            return (
              <div
                key={message.id}
                style={{
                  ...styles.messageGroup,
                  alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                  alignItems: message.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div style={styles.messageAuthor}>
                  {message.role === "user" ? context.user.name : "Gompei"}
                </div>
                <div
                  style={{
                    ...styles.messageBubble,
                    ...(message.role === "user" ? styles.userBubble : styles.assistantBubble),
                  }}
                >
                  {parsed.blocks.length > 0
                    ? parsed.blocks.map((block) => {
                        if (block.type === "actions") {
                          const actions = block.actions.filter((action) =>
                            actionAllowed(action, availableActions),
                          );
                          if (actions.length === 0) return null;
                          return (
                            <div
                              key={`actions-${actions.map(actionKey).join("-")}`}
                              style={styles.inlineActions}
                            >
                              {actions.map((action) => (
                                <SuggestedActionButton
                                  key={actionKey(action)}
                                  action={action}
                                  onNavigate={onNavigate}
                                />
                              ))}
                            </div>
                          );
                        }

                        return (
                          <div key={`markdown-${block.content}`} style={styles.markdownBlock}>
                            {renderMarkdown(block.content)}
                          </div>
                        );
                      })
                    : message.role === "assistant" && isTyping
                      ? "Thinking"
                      : ""}
                </div>
                {inferredActions.length > 0 ? (
                  <div style={styles.messageActions}>
                    {mergeActions([], inferredActions).map((action) => (
                      <SuggestedActionButton
                        key={actionKey(action)}
                        action={action}
                        onNavigate={onNavigate}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}

          {isTyping ? (
            <div style={styles.typingRow}>
              {[0, 0.15, 0.3].map((delay) => (
                <div
                  key={delay}
                  style={{
                    ...styles.typingDot,
                    animation: `bounce 1s ease-in-out ${delay}s infinite`,
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>

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
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.42} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
      `}</style>
    </section>
  );
}

import type * as webllm from "@mlc-ai/web-llm";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ASSISTANT_TOOLS, CLASS_PROJECT_DISCLOSURE, DEFAULT_MODEL } from "./chatbot/knowledge";
import { buildGreeting, buildSystemPrompt } from "./chatbot/prompt";
import { statusColor, statusLabel } from "./chatbot/status";
import { styles } from "./chatbot/styles";
import type { ChatMessage, ChatRole, CMSChatbotProps } from "./chatbot/types";
import { useWebLlmAssistant } from "./chatbot/use-web-llm-assistant";

function AssistantIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

function ToggleIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden="true">
      {open ? (
        <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
      ) : (
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
      )}
    </svg>
  );
}

function resizeTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
}

export default function CMSChatbot({ context, modelId = DEFAULT_MODEL }: CMSChatbotProps) {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nextId = useRef(0);

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
      if (current.length > 0) {
        return current;
      }

      const greeting: ChatMessage = {
        id: nextId.current,
        role: "assistant",
        content: `${buildGreeting(context)} ${CLASS_PROJECT_DISCLOSURE}`,
      };
      nextId.current += 1;
      return [greeting];
    });
  }, [context]);

  const { complete, hasGpu, progress, status } = useWebLlmAssistant({
    enabled: hasOpened,
    modelId,
    onReady: handleReady,
  });

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  });

  const sendMessage = useCallback(async () => {
    const text = input.trim();
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
      console.error("Chat error:", error);
      updateMessage(
        assistantMessage.id,
        "I could not complete that response. Try again after the local model is ready.",
      );
    } finally {
      setIsTyping(false);
    }
  }, [appendMessage, complete, input, messages, status, systemPrompt, updateMessage]);

  function handleTextareaChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(event.target.value);
    resizeTextarea(event.target);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function handleToggle() {
    setHasOpened(true);
    setOpen((current) => !current);
  }

  const isDisabled = status !== "ready";

  return (
    <div style={styles.root}>
      {open && (
        <div style={styles.panel}>
          <div style={styles.header}>
            <div style={styles.avatar}>
              <AssistantIcon />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>iBank Assistant</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 1 }}>
                {statusLabel(status, progress)}
              </div>
            </div>
            <div
              aria-label={statusLabel(status, progress)}
              role="status"
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: statusColor(status),
                flexShrink: 0,
                animation:
                  status === "loading" || status === "generating"
                    ? "pulse 1s ease-in-out infinite"
                    : "none",
              }}
            />
          </div>

          {!hasGpu && (
            <div style={styles.gpuWarning}>
              The local assistant needs WebGPU. Use Chrome 113+ or Edge 113+ to run it in this
              browser.
            </div>
          )}

          {status === "loading" && (
            <div style={styles.loadPane}>
              <p style={{ fontSize: 13, color: "#666", margin: 0, lineHeight: 1.5 }}>
                Preparing the local model. You can keep using the app while it loads.
              </p>
              <div style={styles.progressTrack}>
                <div
                  style={{
                    height: "100%",
                    width: `${progress}%`,
                    background: "#111",
                    borderRadius: 2,
                    transition: "width 0.3s",
                  }}
                />
              </div>
              <div style={{ fontSize: 12, color: "#888", textAlign: "right" }}>{progress}%</div>
            </div>
          )}

          <div ref={messagesRef} style={styles.messages}>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  maxWidth: "86%",
                  alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                  alignItems: message.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div style={{ fontSize: 11, color: "#999", marginBottom: 4, padding: "0 2px" }}>
                  {message.role === "user" ? context.user.name : "iBank Assistant"}
                </div>
                <div
                  style={{
                    padding: "9px 13px",
                    borderRadius: 14,
                    borderBottomRightRadius: message.role === "user" ? 4 : 14,
                    borderBottomLeftRadius: message.role === "assistant" ? 4 : 14,
                    fontSize: 13.5,
                    lineHeight: 1.55,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    background: message.role === "user" ? "#111" : "#f4f4f2",
                    color: message.role === "user" ? "#fff" : "#111",
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 0" }}>
                {[0, 0.15, 0.3].map((delay) => (
                  <div
                    key={delay}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#bbb",
                      animation: `bounce 1s ease-in-out ${delay}s infinite`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div style={styles.inputRow}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              disabled={isDisabled}
              placeholder="Ask about workflows or permissions..."
              rows={1}
              style={{ ...styles.textarea, opacity: isDisabled ? 0.4 : 1 }}
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={isDisabled}
              style={{ ...styles.sendButton, opacity: isDisabled ? 0.35 : 1 }}
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        style={styles.fab}
        onClick={handleToggle}
        title={open ? "Close assistant" : "Open assistant"}
        aria-label={open ? "Close assistant" : "Open assistant"}
      >
        <ToggleIcon open={open} />
      </button>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
      `}</style>
    </div>
  );
}

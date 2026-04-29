import { useState, useEffect, useRef, useCallback } from "react";
import * as webllm from "@mlc-ai/web-llm";
import appGuide from "../assets/chatbotContext.txt?raw";

// ── Types ────────────────────────────────────────────────────────────────────

type Status = "loading" | "ready" | "generating" | "error";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

interface CMSContext {
  user: {
    name: string;
    role: string;
  };
}

interface CMSChatbotProps {
  context: CMSContext;
  modelId?: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_MODEL = "Phi-3.5-mini-instruct-q4f16_1-MLC";

// ── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 12,
    fontFamily: "system-ui, sans-serif",
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 1000,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "#111",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.15s",
    flexShrink: 0,
  },
  panel: {
    width: 370,
    border: "0.5px solid rgba(0,0,0,0.15)",
    borderRadius: 12,
    overflow: "hidden",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  header: {
    padding: "14px 16px 12px",
    borderBottom: "0.5px solid rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#fff",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  loadPane: {
    padding: "16px 20px",
    borderBottom: "0.5px solid rgba(0,0,0,0.08)",
    background: "#f9f9f8",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  progressTrack: {
    height: 4,
    background: "rgba(0,0,0,0.08)",
    borderRadius: 2,
    overflow: "hidden",
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    maxHeight: 420,
    minHeight: 0,
  },
  inputRow: {
    padding: "10px 12px",
    borderTop: "0.5px solid rgba(0,0,0,0.08)",
    display: "flex",
    gap: 8,
    alignItems: "flex-end",
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "#111",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "opacity 0.15s, transform 0.12s",
  },
  gpuWarning: {
    margin: "12px 16px 0",
    padding: "10px 13px",
    background: "#FFF8E6",
    color: "#92600A",
    borderRadius: 8,
    fontSize: 12.5,
    lineHeight: 1.5,
  },
};

// ── Status dot color ─────────────────────────────────────────────────────────

function statusColor(status: Status): string {
  switch (status) {
    case "loading":
      return "#EF9F27";
    case "ready":
      return "#1D9E75";
    case "generating":
      return "#378ADD";
    case "error":
      return "#E24B4A";
  }
}

function statusLabel(status: Status, progress: number): string {
  switch (status) {
    case "loading":
      return `Loading model… ${progress}%`;
    case "ready":
      return "Ready";
    case "generating":
      return "Thinking…";
    case "error":
      return "Error";
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function CMSChatbot({ context, modelId = DEFAULT_MODEL }: CMSChatbotProps) {
  const [open, setOpen] = useState(true);
  const [status, setStatus] = useState<Status>("loading");
  const [progress, setProgress] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasGpu, setHasGpu] = useState(true);

  const engineRef = useRef<webllm.MLCEngineInterface | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nextId = useRef(0);

  // ── Scroll to bottom on new messages ──────────────────────────────────────

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // ── Initialize WebLLM engine ───────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!(navigator as Navigator & { gpu?: unknown }).gpu) {
        setHasGpu(false);
        setStatus("error");
        return;
      }

      try {
        const engine = await webllm.CreateMLCEngine(modelId, {
          initProgressCallback: ({ progress: p }) => {
            if (!cancelled) setProgress(Math.round(p * 100));
          },
        });
        if (cancelled) {
          engine.unload();
          return;
        }
        engineRef.current = engine;
        setStatus("ready");
        setProgress(100);
        addMessage(
          "assistant",
          `Hi ${context.user.name}! I'm here to help you navigate iBank. What can I help you with? [DISCLAIMER: This website has been created for WPI's CS 3733 Software Engineering as a class project and is not in use by Hanover Insurance.]`,
        );
      } catch (err) {
        if (!cancelled) {
          console.error("WebLLM init error:", err);
          setStatus("error");
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [modelId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ────────────────────────────────────────────────────────────────

  function addMessage(role: "user" | "assistant", content: string): Message {
    const msg: Message = { id: nextId.current++, role, content };
    setMessages((prev) => [...prev, msg]);
    return msg;
  }

  function updateLastMessage(content: string) {
    setMessages((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last) updated[updated.length - 1] = { ...last, content };
      return updated;
    });
  }

  function buildSystemPrompt(): string {
    return `You are a helpful support assistant built into a content management system (ibank).
Current user: ${context.user.name} (role: ${context.user.role})
Help the user navigate ibank, find features, and understand how things work. Keep responses to one paragraph and be practical.
Rules:
- Keep responses to 1-3 sentences unless a step-by-step is strictly necessary
- Never guess — if something isn't in the app guide, say "I'm not sure, check with your admin"
- Do not make up features, pages, or workflows that aren't listed below
${appGuide ? `\n## App guide\n${appGuide}` : ""}\``;
  }

  // ── Send message ──────────────────────────────────────────────────────────

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || status !== "ready" || !engineRef.current) return;

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    addMessage("user", text);
    setIsTyping(true);
    setStatus("generating");

    const chatMessages: webllm.ChatCompletionMessageParam[] = [
      { role: "system", content: buildSystemPrompt() },
      ...messages.map(
        (m) => ({ role: m.role, content: m.content }) as webllm.ChatCompletionMessageParam,
      ),
      { role: "user", content: text },
    ];

    try {
      const stream = await engineRef.current.chat.completions.create({
        messages: chatMessages,
        stream: true,
      });

      setIsTyping(false);
      addMessage("assistant", "");

      let accumulated = "";
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content ?? "";
        accumulated += delta;
        updateLastMessage(accumulated);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setIsTyping(false);
      addMessage("assistant", "Something went wrong. Please try again.");
    }

    setStatus("ready");
  }, [input, status, messages, context]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Textarea auto-resize ──────────────────────────────────────────────────

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const isDisabled = status !== "ready";

  return (
    <div style={styles.root}>
      {/* Chat panel */}
      {open && (
        <div style={styles.panel}>
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.avatar}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Content Assistant</div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 1 }}>
                {statusLabel(status, progress)}
              </div>
            </div>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%,",
                background: statusColor(status),
                flexShrink: 0,
                animation:
                  status === "loading" || status === "generating"
                    ? "pulse 1s ease-in-out infinite"
                    : "none",
              }}
            />
          </div>

          {/* No GPU warning */}
          {!hasGpu && (
            <div style={styles.gpuWarning}>
              Your browser doesn't support WebGPU. The AI assistant requires Chrome 113+ or Edge
              113+.
            </div>
          )}

          {/* Load progress */}
          {status === "loading" && (
            <div style={styles.loadPane}>
              <p style={{ fontSize: 13, color: "#666", margin: 0, lineHeight: 1.5 }}>
                Setting up your AI assistant. Keep working while it loads.
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

          {/* Messages */}
          <div ref={messagesRef} style={styles.messages}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  maxWidth: "86%",
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div style={{ fontSize: 11, color: "#999", marginBottom: 4, padding: "0 2px" }}>
                  {msg.role === "user" ? context.user.name : "AI Assistant"}
                </div>
                <div
                  style={{
                    padding: "9px 13px",
                    borderRadius: 14,
                    borderBottomRightRadius: msg.role === "user" ? 4 : 14,
                    borderBottomLeftRadius: msg.role === "assistant" ? 4 : 14,
                    fontSize: 13.5,
                    lineHeight: 1.55,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    background: msg.role === "user" ? "#111" : "#f4f4f2",
                    color: msg.role === "user" ? "#fff" : "#111",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 0" }}>
                {[0, 0.15, 0.3].map((delay, i) => (
                  <div
                    key={i}
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

          {/* Input row */}
          <div style={styles.inputRow}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              disabled={isDisabled}
              placeholder="Ask how to do something…"
              rows={1}
              style={{
                flex: 1,
                resize: "none",
                border: "0.5px solid rgba(0,0,0,0.15)",
                borderRadius: 8,
                padding: "8px 11px",
                fontSize: 13.5,
                fontFamily: "inherit",
                background: "#fff",
                color: "#111",
                lineHeight: 1.5,
                minHeight: 36,
                maxHeight: 100,
                outline: "none",
                opacity: isDisabled ? 0.4 : 1,
              }}
            />
            <button
              onClick={sendMessage}
              disabled={isDisabled}
              style={{ ...styles.sendBtn, opacity: isDisabled ? 0.35 : 1 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* FAB toggle */}
      <button style={styles.fab} onClick={() => setOpen((o) => !o)} title="Toggle AI assistant">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          {open ? (
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          ) : (
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          )}
        </svg>
      </button>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
      `}</style>
    </div>
  );
}

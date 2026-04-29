import { Bot } from "lucide-react";
import { statusColor, statusLabel } from "./status";
import { styles } from "./styles";
import type { AssistantStatus } from "./types";

interface ChatTitleProps {
  progress: number;
  status: AssistantStatus;
}

export function ChatTitle({ progress, status }: ChatTitleProps) {
  return (
    <header style={styles.pageTitleBar}>
      <div style={styles.pageAvatar}>
        <Bot size={18} aria-hidden="true" />
      </div>
      <div style={styles.chatHeaderText}>
        <h1 style={styles.pageTitle}>Gompei</h1>
        <p style={styles.pageSubtitle}>Ask about this workspace or what to do next.</p>
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
  );
}

import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { styles } from "./styles";
import type { ChatHistoryItem } from "./types";

interface ChatHistoryProps {
  activeConversationId?: string | null;
  history: ChatHistoryItem[];
  onDeleteConversation?: (id: string) => void;
  onNewConversation?: () => void;
  onSelectConversation?: (id: string) => void;
}

export function ChatHistory({
  activeConversationId,
  history,
  onDeleteConversation,
  onNewConversation,
  onSelectConversation,
}: ChatHistoryProps) {
  return (
    <aside style={styles.historyRail}>
      <div style={styles.historyHeader}>
        <span>History</span>
        <button
          type="button"
          onClick={onNewConversation}
          style={styles.iconButton}
          aria-label="New Gompei chat"
        >
          <Plus size={14} aria-hidden="true" />
        </button>
      </div>
      <div style={styles.historyList}>
        {history.length === 0 ? (
          <div style={styles.emptyHistory}>No saved chats yet.</div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              style={{
                ...styles.historyItemWrap,
                ...(item.id === activeConversationId ? styles.activeHistoryItemWrap : null),
              }}
            >
              <button
                type="button"
                onClick={() => onSelectConversation?.(item.id)}
                style={styles.historyItem}
              >
                <MessageSquare size={14} aria-hidden="true" />
                <span style={styles.historyText}>
                  <span style={styles.historyTitle}>{item.title}</span>
                  {item.preview ? <span style={styles.historyPreview}>{item.preview}</span> : null}
                </span>
                {item.unread ? <span style={styles.unreadDot} aria-hidden="true" /> : null}
              </button>
              <button
                type="button"
                onClick={() => onDeleteConversation?.(item.id)}
                style={styles.deleteHistoryButton}
                aria-label={`Delete ${item.title}`}
              >
                <Trash2 size={13} aria-hidden="true" />
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

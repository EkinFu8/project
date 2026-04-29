import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { styles } from "./styles";
import type { AssistantAction, ChatMessage } from "./types";

type MessageBlock =
  | { type: "markdown"; content: string }
  | { type: "actions"; actions: AssistantAction[] };

const ACTION_PATTERN = /^ACTION:\s*(\/[^\s|]*)\s*\|\s*(.+)$/i;
const LOOSE_ACTION_PATTERN = /^[-*]?\s*Action:\s*`?\s*(\/[^`|]+?)\s*\|\s*([^`]+?)\s*`?\.?$/i;

function parseActionLine(line: string): AssistantAction | null {
  const trimmed = line.trim();
  const match = trimmed.match(ACTION_PATTERN) ?? trimmed.match(LOOSE_ACTION_PATTERN);
  const to = match?.[1]?.trim();
  const label = match?.[2]?.trim();
  if (!to || !label) return null;
  return { to, label, tone: "primary" };
}

function parseAssistantMessage(content: string) {
  const blocks: MessageBlock[] = [];
  const lines = content.split("\n");
  const textLines: string[] = [];

  function flushText() {
    const content = textLines.join("\n").trim();
    if (content) blocks.push({ type: "markdown", content });
    textLines.length = 0;
  }

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      flushText();
      continue;
    }

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
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));

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

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
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

interface ChatMessagesProps {
  availableActions: AssistantAction[];
  contextUserName: string;
  isTyping: boolean;
  messages: ChatMessage[];
  onNavigate?: (to: string) => void;
}

export function ChatMessages({
  availableActions,
  contextUserName,
  isTyping,
  messages,
  onNavigate,
}: ChatMessagesProps) {
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = messagesRef.current;
    if (!element) return;

    const frame = window.requestAnimationFrame(() => {
      element.scrollTop = element.scrollHeight;
    });

    return () => window.cancelAnimationFrame(frame);
  });

  return (
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
              {message.role === "user" ? contextUserName : "Gompei"}
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
  );
}

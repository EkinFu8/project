import { cn } from "@myapp/ui/lib/utils";
import { Bookmark, BookmarkCheck, MailOpen, MailX, Trash2, X } from "lucide-react";

interface SelectionToolbarProps {
  count: number;
  totalCount: number;
  allRead: boolean;
  allPinned: boolean;
  onMarkRead: () => void;
  onMarkUnread: () => void;
  onPin: () => void;
  onUnpin: () => void;
  onDelete: () => void;
  onClear: () => void;
  onSelectAll: () => void;
  isLoading: boolean;
}

export function SelectionToolbar({
  count,
  totalCount,
  allRead,
  allPinned,
  onMarkRead,
  onMarkUnread,
  onPin,
  onUnpin,
  onDelete,
  onClear,
  onSelectAll,
  isLoading,
}: SelectionToolbarProps) {
  return (
    <div
      className={cn(
        "animate-fade-in-down flex flex-col gap-1.5 border-b border-border bg-hanover-green/5 px-3 py-2.5",
        isLoading && "pointer-events-none opacity-60",
      )}
    >
      {/* Row 1 — selection status */}
      <div className="flex items-center gap-2 text-xs">
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear selection"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <span className="font-semibold text-foreground">{count} selected</span>

        {count < totalCount && (
          <button
            type="button"
            onClick={onSelectAll}
            className="ml-auto font-medium text-hanover-green underline-offset-2 hover:underline"
          >
            Select all {totalCount}
          </button>
        )}
      </div>

      {/* Row 2 — actions. Delete pushed right to separate the destructive action. */}
      <div className="flex items-center gap-1">
        <ToolbarButton onClick={onMarkRead} label="Mark read" disabled={allRead}>
          <MailOpen className="h-3.5 w-3.5" />
        </ToolbarButton>

        <ToolbarButton onClick={onMarkUnread} label="Mark unread" disabled={!allRead}>
          <MailX className="h-3.5 w-3.5" />
        </ToolbarButton>

        {allPinned ? (
          <ToolbarButton onClick={onUnpin} label="Unpin">
            <BookmarkCheck className="h-3.5 w-3.5 text-hanover-green" />
          </ToolbarButton>
        ) : (
          <ToolbarButton onClick={onPin} label="Pin">
            <Bookmark className="h-3.5 w-3.5" />
          </ToolbarButton>
        )}

        <ToolbarButton
          onClick={onDelete}
          label="Delete"
          className="ml-auto text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  label,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "flex h-7 shrink-0 items-center gap-1.5 rounded px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

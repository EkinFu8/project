import { HelpPopover } from "@myapp/ui/components/help-popover";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  label: ReactNode;
  open: boolean;
  onToggle: () => void;
  helpTitle: string;
  children: ReactNode;
};

export function FilterSectionHeader({ label, open, onToggle, helpTitle, children }: Props) {
  return (
    <div className="mb-2 flex items-center gap-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="group flex min-w-0 flex-1 items-center justify-between rounded-md px-1.5 py-1 text-left text-[13px] font-semibold text-foreground transition-colors hover:bg-muted/60"
      >
        <span className="min-w-0 tracking-tight">{label}</span>
        <ChevronDown
          className={`ml-2 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
          aria-hidden
        />
      </button>
      <HelpPopover title={helpTitle} side="right" align="start" contentClassName="w-64">
        {children}
      </HelpPopover>
    </div>
  );
}

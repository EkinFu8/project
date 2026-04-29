import { CircleHelp } from "lucide-react";
import { Popover } from "radix-ui";
import type * as React from "react";

import { cn } from "../lib/utils";

type HelpPopoverProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  side?: React.ComponentProps<typeof Popover.Content>["side"];
  align?: React.ComponentProps<typeof Popover.Content>["align"];
  sideOffset?: number;
  "aria-label"?: string;
};

function HelpPopover({
  title,
  children,
  className,
  contentClassName,
  side = "top",
  align = "center",
  sideOffset = 8,
  "aria-label": ariaLabel,
}: HelpPopoverProps) {
  return (
    <Popover.Root>
      <Popover.Trigger
        type="button"
        aria-label={ariaLabel ?? `${title} help`}
        className={cn(
          "inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
          className,
        )}
      >
        <CircleHelp aria-hidden="true" className="size-4" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            "z-50 max-w-[calc(100vw-2rem)] rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-md outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1",
            contentClassName ?? "w-72",
          )}
        >
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <div className="mt-1.5 text-xs leading-5 text-muted-foreground">{children}</div>
          <Popover.Arrow className="fill-popover" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export { HelpPopover };

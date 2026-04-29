import { Info } from "lucide-react";
import { Popover } from "radix-ui";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useId } from "react";

import { cn } from "../lib/utils";

type InfoPopoverProps = {
  children: ReactNode;
  title?: string;
  label?: string;
  className?: string;
  contentClassName?: string;
  side?: ComponentPropsWithoutRef<typeof Popover.Content>["side"];
  align?: ComponentPropsWithoutRef<typeof Popover.Content>["align"];
};

function InfoPopover({
  children,
  title,
  label,
  className,
  contentClassName,
  side = "top",
  align = "center",
}: InfoPopoverProps) {
  const titleId = useId();

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            className,
          )}
          aria-label={label ?? (title ? `More information about ${title}` : "More information")}
        >
          <Info className="size-3.5" aria-hidden="true" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={12}
          aria-labelledby={title ? titleId : undefined}
          className={cn(
            "z-50 max-w-xs rounded-md border border-border bg-popover p-3 text-popover-foreground shadow-md outline-none",
            contentClassName,
          )}
        >
          {title ? (
            <p id={titleId} className="mb-1 text-sm font-semibold leading-none">
              {title}
            </p>
          ) : null}
          <div className="text-sm leading-5 text-muted-foreground">{children}</div>
          <Popover.Arrow className="fill-popover" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export { InfoPopover };

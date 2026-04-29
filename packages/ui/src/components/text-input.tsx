import type * as React from "react";
import { cn } from "../lib/utils";

interface TextInputProps extends React.ComponentProps<"input"> {
  label: string;
}

function TextInput({ label, className, id, ...props }: TextInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="group">
      <label
        htmlFor={inputId}
        className="mb-2 block text-sm font-semibold text-foreground transition-colors group-focus-within:text-hanover-green"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          "w-full rounded-md border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground transition-all duration-200",
          "hover:border-foreground/30",
          "focus:border-hanover-green focus:outline-none focus:ring-2 focus:ring-hanover-green/40",
          "disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export type { TextInputProps };
export { TextInput };

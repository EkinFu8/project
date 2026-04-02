import type * as React from "react";
import { cn } from "../lib/utils";

interface TextInputProps extends React.ComponentProps<"input"> {
  label: string;
}

function TextInput({ label, className, id, ...props }: TextInputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-2 block text-sm font-semibold text-foreground"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={cn(
          "w-full rounded border border-border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export { TextInput };
export type { TextInputProps };

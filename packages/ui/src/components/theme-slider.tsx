import { type LucideIcon, Monitor, Moon, Sun } from "lucide-react";
import { cn } from "../lib/utils";
import { type ThemePreference, useTheme } from "./theme-provider";

const ORDER: ThemePreference[] = ["system", "light", "dark"];

const LABELS: Record<ThemePreference, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

const ICONS: Record<ThemePreference, LucideIcon> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

function preferenceToIndex(p: ThemePreference): number {
  const i = ORDER.indexOf(p);
  return i >= 0 ? i : 0;
}

/** Three theme choices with a sliding pill that moves to the active option. */
function ThemeSlider({ className }: { className?: string }) {
  const { preference, setPreference } = useTheme();
  const index = preferenceToIndex(preference);

  return (
    <div className={cn("w-full", className)}>
      <fieldset
        aria-label="Color theme"
        className="relative m-0 flex min-w-0 gap-1 rounded-lg border border-border bg-muted/90 p-1"
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute bottom-1 top-1 rounded-md bg-card shadow-sm ring-1 ring-border/70",
            "transition-transform duration-200 ease-out",
          )}
          style={{
            width: "calc((100% - 1rem) / 3)",
            left: "0.25rem",
            transform: `translateX(calc(${index} * (100% + 0.25rem)))`,
          }}
        />
        {ORDER.map((key) => {
          const Icon = ICONS[key];
          return (
            <button
              key={key}
              type="button"
              className={cn(
                "relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 px-1 text-sm font-medium outline-none transition-colors sm:gap-2 sm:px-1.5",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                preference === key
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setPreference(key)}
              aria-pressed={preference === key}
            >
              <Icon className="size-4 shrink-0" aria-hidden strokeWidth={1.75} />
              <span className="truncate">{LABELS[key]}</span>
            </button>
          );
        })}
      </fieldset>
    </div>
  );
}

export { ThemeSlider };

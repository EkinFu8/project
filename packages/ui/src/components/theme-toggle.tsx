import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

function labelFor(preference: "system" | "light" | "dark"): string {
  switch (preference) {
    case "system":
      return "Theme: match system. Click for light mode.";
    case "light":
      return "Theme: light. Click for dark mode.";
    case "dark":
      return "Theme: dark. Click to match system.";
    default:
      return "Cycle theme";
  }
}

function ThemeToggle({ className }: { className?: string }) {
  const { preference, cyclePreference } = useTheme();

  const Icon = preference === "system" ? Monitor : preference === "light" ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={cyclePreference}
      className={className}
      aria-label={labelFor(preference)}
    >
      <Icon className="size-5" aria-hidden strokeWidth={1.75} />
    </button>
  );
}

export { ThemeToggle };

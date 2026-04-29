import type { AssistantStatus } from "./types";

export function statusColor(status: AssistantStatus): string {
  switch (status) {
    case "loading":
      return "#EF9F27";
    case "ready":
      return "#1D9E75";
    case "generating":
      return "#378ADD";
    case "error":
      return "#E24B4A";
  }
}

export function statusLabel(status: AssistantStatus, progress: number): string {
  switch (status) {
    case "loading":
      return `Loading local model... ${progress}%`;
    case "ready":
      return "Ready";
    case "generating":
      return "Thinking";
    case "error":
      return "Unavailable";
  }
}

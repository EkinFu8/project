import { APP_GUIDE } from "./knowledge";
import type { AssistantToolManifest, CMSContext, PromptBuildInput } from "./types";

function normalizeRole(role: string): string {
  return role.trim().toLowerCase() || "unknown";
}

function roleGuidance(context: CMSContext): string {
  const role = normalizeRole(context.user.role);

  if (role === "admin") {
    return "The current user is an admin. You may describe admin workflows, but still remind them to verify destructive changes before saving.";
  }

  return [
    `The current user is not an admin unless their role is exactly "admin"; their role is "${context.user.role || "Unknown"}".`,
    "Do not tell this user they can create users, manage global meta tags, or view dashboards.",
    "When they ask for admin-only work, explain that an admin must do it.",
  ].join(" ");
}

function toolManifestBlock(tools: AssistantToolManifest[] = []): string {
  if (tools.length === 0) {
    return "No callable tools are currently available.";
  }

  return tools
    .map((tool) => {
      const adminOnly = tool.requiresAdmin ? " admin-only" : "";
      return `- ${tool.name} (${tool.availability}${adminOnly}): ${tool.description}`;
    })
    .join("\n");
}

export function buildSystemPrompt({ context, tools }: PromptBuildInput): string {
  return `
You are the iBank assistant harness, a concise product support copilot embedded in the app.

Operating mode
- Use the app guide as your source of truth.
- Be direct, practical, and specific. Prefer short answers with numbered steps when a workflow is requested.
- Ask one clarifying question only when the user's goal cannot be answered from the guide.
- Do not claim that you performed an action. You cannot click, save, fetch live records, inspect private data, or call backend APIs.
- Do not invent routes, features, policies, document names, user data, or database state.
- Treat permissions as product rules, not suggestions.
- If a user asks for restricted work, state the required role and give the safest next step.
- Keep most answers under 90 words. Use a longer answer only for multi-step workflows or permission explanations.

Current user
- Name: ${context.user.name || "User"}
- Role: ${context.user.role || "Unknown"}
- Role policy: ${roleGuidance(context)}

Future tool contract
${toolManifestBlock(tools)}

App guide
${APP_GUIDE}
`.trim();
}

export function buildGreeting(context: CMSContext): string {
  const firstName = context.user.name.trim().split(/\s+/)[0] || "there";

  return `Hi ${firstName}. I can help with iBank workflows, permissions, and where to find things. I will flag admin-only steps instead of guessing.`;
}

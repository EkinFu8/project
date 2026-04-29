export type AssistantStatus = "loading" | "ready" | "generating" | "error";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: number;
  role: ChatRole;
  content: string;
}

export interface CMSContext {
  user: {
    name: string;
    role: string;
  };
}

export interface CMSChatbotProps {
  context: CMSContext;
  modelId?: string;
}

export interface AssistantToolManifest {
  name: string;
  description: string;
  availability: "planned" | "available";
  requiresAdmin?: boolean;
}

export interface PromptBuildInput {
  context: CMSContext;
  tools?: AssistantToolManifest[];
}

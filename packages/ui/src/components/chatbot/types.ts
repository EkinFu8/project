export type AssistantStatus = "loading" | "ready" | "generating" | "error";

export type ChatRole = "user" | "assistant";

export interface AssistantAction {
  label: string;
  to: string;
  description?: string;
  adminOnly?: boolean;
  tone?: "primary" | "neutral";
}

export interface AssistantSnapshotItem {
  id: string;
  label: string;
  detail?: string;
  to?: string;
  tone?: "default" | "attention" | "success" | "muted";
}

export interface ChatMessage {
  id: number;
  role: ChatRole;
  content: string;
}

export interface CMSContext {
  user: {
    name: string;
    role: string;
    portal?: string;
    email?: string;
  };
  page?: {
    path: string;
    title: string;
    description?: string;
  };
  permissions?: {
    isAdmin: boolean;
    canCreateContent: boolean;
    canManageUsers: boolean;
    canManageTags: boolean;
    canViewDashboard: boolean;
    canViewCoworkers: boolean;
  };
  workload?: {
    unreadNotifications: number;
    submittedDocuments: number;
    dueSoon: number;
    overdue: number;
    checkedOutByUser: number;
  };
  highlights?: AssistantSnapshotItem[];
  actions?: AssistantAction[];
}

export interface CMSChatbotProps {
  context: CMSContext;
  modelId?: string;
  onNavigate?: (to: string) => void;
  initialPrompt?: string;
  mode?: "launcher" | "page";
  onSubmitQuestion?: (question: string) => void;
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

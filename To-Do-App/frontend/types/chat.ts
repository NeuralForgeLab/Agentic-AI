// Task: T3-007 - Chat types
// From: specs/phase3-ai-chatbot/spec.md §4

export interface ActionResult {
  type: string;
  task?: {
    id: number;
    title: string;
    description?: string;
    completed: boolean;
    created_at: string;
  };
  task_id?: number;
  tasks?: Array<{
    id: number;
    title: string;
    description?: string;
    completed: boolean;
    created_at: string;
  }>;
  total?: number;
  completed?: number;
  message?: string;
}

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  actions?: ActionResult[];
  created_at: string;
}

export interface ChatResponse {
  message: string;
  actions: ActionResult[];
  conversation_id: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
}

export interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
}

export interface ConversationMessagesResponse {
  conversation_id: string;
  messages: ChatMessage[];
}

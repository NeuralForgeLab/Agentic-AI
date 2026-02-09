// API client with JWT - Enhanced for advanced task management
import type {
  Task,
  TaskListResponse,
  TaskCreate,
  TaskUpdate,
  TaskStats,
  Priority,
  TaskStatus,
} from "@/types/task";
import type {
  ChatRequest,
  ChatResponse,
  ConversationListResponse,
  ConversationMessagesResponse,
} from "@/types/chat";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchWithAuth(
  endpoint: string,
  token: string,
  options: RequestInit = {},
): Promise<Response> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }));
    throw new ApiError(response.status, error.detail || "Request failed");
  }

  return response;
}

export interface TaskListFilters {
  status?: TaskStatus;
  priority?: Priority;
  category?: string;
  due_today?: boolean;
  overdue?: boolean;
  sort_by?: "created_at" | "due_date" | "priority" | "title";
  sort_order?: "asc" | "desc";
}

export const taskApi = {
  async list(
    userId: string,
    token: string,
    filters: TaskListFilters = {},
  ): Promise<TaskListResponse> {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.priority) params.append("priority", filters.priority);
    if (filters.category) params.append("category", filters.category);
    if (filters.due_today) params.append("due_today", "true");
    if (filters.overdue) params.append("overdue", "true");
    if (filters.sort_by) params.append("sort_by", filters.sort_by);
    if (filters.sort_order) params.append("sort_order", filters.sort_order);

    const queryString = params.toString();
    const endpoint = `/api/users/${userId}/tasks${queryString ? `?${queryString}` : ""}`;

    const response = await fetchWithAuth(endpoint, token);
    return response.json();
  },

  async getStats(userId: string, token: string): Promise<TaskStats> {
    const response = await fetchWithAuth(
      `/api/users/${userId}/tasks/stats`,
      token,
    );
    return response.json();
  },

  async create(userId: string, token: string, data: TaskCreate): Promise<Task> {
    const response = await fetchWithAuth(`/api/users/${userId}/tasks`, token, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async get(userId: string, taskId: number, token: string): Promise<Task> {
    const response = await fetchWithAuth(
      `/api/users/${userId}/tasks/${taskId}`,
      token,
    );
    return response.json();
  },

  async update(
    userId: string,
    taskId: number,
    token: string,
    data: TaskUpdate,
  ): Promise<Task> {
    const response = await fetchWithAuth(
      `/api/users/${userId}/tasks/${taskId}`,
      token,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );
    return response.json();
  },

  async toggle(userId: string, taskId: number, token: string): Promise<Task> {
    const response = await fetchWithAuth(
      `/api/users/${userId}/tasks/${taskId}/toggle`,
      token,
      { method: "POST" },
    );
    return response.json();
  },

  async updateStatus(
    userId: string,
    taskId: number,
    token: string,
    status: TaskStatus,
  ): Promise<Task> {
    const response = await fetchWithAuth(
      `/api/users/${userId}/tasks/${taskId}/status?new_status=${status}`,
      token,
      { method: "POST" },
    );
    return response.json();
  },

  async delete(userId: string, taskId: number, token: string): Promise<void> {
    await fetchWithAuth(`/api/users/${userId}/tasks/${taskId}`, token, {
      method: "DELETE",
    });
  },
};

// Chat API endpoints
export const chatApi = {
  async sendMessage(
    userId: string,
    token: string,
    data: ChatRequest,
  ): Promise<ChatResponse> {
    const response = await fetchWithAuth(`/api/users/${userId}/chat`, token, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async listConversations(
    userId: string,
    token: string,
  ): Promise<ConversationListResponse> {
    const response = await fetchWithAuth(
      `/api/users/${userId}/chat/conversations`,
      token,
    );
    return response.json();
  },

  async getConversationMessages(
    userId: string,
    conversationId: string,
    token: string,
  ): Promise<ConversationMessagesResponse> {
    const response = await fetchWithAuth(
      `/api/users/${userId}/chat/conversations/${conversationId}/messages`,
      token,
    );
    return response.json();
  },

  async deleteConversation(
    userId: string,
    conversationId: string,
    token: string,
  ): Promise<void> {
    await fetchWithAuth(
      `/api/users/${userId}/chat/conversations/${conversationId}`,
      token,
      { method: "DELETE" },
    );
  },
};

export { ApiError };

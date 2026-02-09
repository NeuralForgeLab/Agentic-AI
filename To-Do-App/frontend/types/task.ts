// Task types with advanced features

export type Priority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "completed" | "cancelled";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  completed: boolean;
  completed_at: string | null;
  priority: Priority;
  due_date: string | null;
  reminder_at: string | null;
  start_date: string | null;
  category: string | null;
  tags: string | null;
  notes: string | null;
  estimated_minutes: number | null;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  completed: number;
  in_progress: number;
  overdue: number;
  due_today: number;
}

export interface TaskCreate {
  title: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  due_date?: string;
  reminder_at?: string;
  start_date?: string;
  category?: string;
  tags?: string;
  notes?: string;
  estimated_minutes?: number;
  is_recurring?: boolean;
  recurrence_pattern?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  due_date?: string;
  reminder_at?: string;
  start_date?: string;
  category?: string;
  tags?: string;
  notes?: string;
  estimated_minutes?: number;
  is_recurring?: boolean;
  recurrence_pattern?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  in_progress: number;
  todo: number;
  overdue: number;
  due_today: number;
  due_this_week: number;
  by_priority: Record<string, number>;
  by_category: Record<string, number>;
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "bg-gray-100 text-gray-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

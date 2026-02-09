// Task: T3-008 - ChatMessage component
// From: specs/phase3-ai-chatbot/plan.md §3.2
"use client";

import type { ActionResult } from "@/types/chat";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  actions?: ActionResult[];
}

function ActionBadge({ action }: { action: ActionResult }) {
  const getActionDetails = () => {
    switch (action.type) {
      case "task_created":
        return {
          label: "Created",
          color: "bg-green-100 text-green-800",
          detail: action.task?.title,
        };
      case "task_updated":
        return {
          label: "Updated",
          color: "bg-blue-100 text-blue-800",
          detail: action.task?.title,
        };
      case "task_deleted":
        return {
          label: "Deleted",
          color: "bg-red-100 text-red-800",
          detail: `Task #${action.task_id}`,
        };
      case "task_toggled":
        return {
          label: action.task?.completed ? "Completed" : "Reopened",
          color: action.task?.completed
            ? "bg-purple-100 text-purple-800"
            : "bg-yellow-100 text-yellow-800",
          detail: action.task?.title,
        };
      case "tasks_listed":
        return {
          label: "Listed",
          color: "bg-gray-100 text-gray-800",
          detail: `${action.total} tasks (${action.completed} done)`,
        };
      case "error":
        return {
          label: "Error",
          color: "bg-red-100 text-red-800",
          detail: action.message,
        };
      default:
        return {
          label: action.type,
          color: "bg-gray-100 text-gray-800",
          detail: null,
        };
    }
  };

  const { label, color, detail } = getActionDetails();

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}
    >
      {label}
      {detail && <span className="font-normal">: {detail}</span>}
    </span>
  );
}

export default function ChatMessage({ role, content, actions }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-900"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>

        {actions && actions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {actions.map((action, index) => (
              <ActionBadge key={index} action={action} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

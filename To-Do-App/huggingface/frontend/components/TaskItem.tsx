// TaskItem component - Simplified
"use client";

import { useState } from "react";
import type { Task, TaskUpdate } from "@/types/task";

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: number) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
  onUpdate: (taskId: number, data: TaskUpdate) => Promise<void>;
}

export default function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await onToggle(task.id);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(task.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 bg-white border rounded-lg ${
        task.completed ? "border-green-200 bg-green-50/50" : "border-gray-200"
      }`}
    >
      <input
        type="checkbox"
        checked={task.completed}
        onChange={handleToggle}
        disabled={loading}
        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
      />

      <span
        className={`flex-1 ${
          task.completed ? "text-gray-500 line-through" : "text-gray-900"
        }`}
      >
        {task.title}
      </span>

      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-2 py-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}

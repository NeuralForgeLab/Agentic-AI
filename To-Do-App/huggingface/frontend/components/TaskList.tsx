// TaskList component - Simplified
"use client";

import TaskItem from "./TaskItem";
import type { TaskListResponse, TaskUpdate } from "@/types/task";

interface TaskListProps {
  tasks: TaskListResponse;
  onToggle: (taskId: number) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
  onUpdate: (taskId: number, data: TaskUpdate) => Promise<void>;
}

export default function TaskList({
  tasks,
  onToggle,
  onDelete,
  onUpdate,
}: TaskListProps) {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Your Tasks</h3>
        <span className="text-sm text-gray-500">
          {tasks.completed} / {tasks.total} done
        </span>
      </div>

      {tasks.tasks.length === 0 ? (
        <p className="text-center py-8 text-gray-500">
          No tasks yet. Add one above!
        </p>
      ) : (
        <div className="space-y-2">
          {tasks.tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Dashboard page with advanced task management
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { taskApi } from "@/lib/api";
import type {
  Task,
  TaskListResponse,
  TaskCreate,
  TaskUpdate,
} from "@/types/task";
import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import ChatInterface from "@/components/ChatInterface";

interface User {
  id: string;
  email: string;
  name?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tasksData, setTasksData] = useState<TaskListResponse>({
    tasks: [],
    total: 0,
    completed: 0,
    in_progress: 0,
    overdue: 0,
    due_today: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get unique categories from tasks
  const categories = useMemo(() => {
    const cats = new Set<string>();
    tasksData.tasks.forEach((task) => {
      if (task.category) cats.add(task.category);
    });
    return Array.from(cats).sort();
  }, [tasksData.tasks]);

  // Initialize - check session and get token
  useEffect(() => {
    const init = async () => {
      try {
        // Get session
        const sessionResult = await authClient.getSession();

        if (!sessionResult.data?.user) {
          router.push("/signin");
          return;
        }

        const currentUser = sessionResult.data.user as User;
        setUser(currentUser);

        // Get JWT token with retry logic for post-login race condition
        let jwtToken: string | null = null;
        let retries = 3;

        while (retries > 0 && !jwtToken) {
          const tokenResult = await authClient.token();
          if (tokenResult.data?.token) {
            jwtToken = tokenResult.data.token;
          } else if (retries > 1) {
            // Wait a bit before retrying (session may still be propagating)
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
          retries--;
        }

        if (!jwtToken) {
          setError(
            "Failed to get authentication token. Please try refreshing the page.",
          );
          setLoading(false);
          return;
        }

        setToken(jwtToken);

        // Fetch tasks
        const data = await taskApi.list(currentUser.id, jwtToken);
        setTasksData(data);
      } catch (err) {
        console.error("Init error:", err);
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const handleCreateTask = async (taskData: TaskCreate) => {
    if (!user?.id || !token) return;

    try {
      const newTask = await taskApi.create(user.id, token, taskData);
      setTasksData((prev) => ({
        ...prev,
        tasks: [newTask, ...prev.tasks],
        total: prev.total + 1,
      }));
    } catch (err) {
      throw err; // Re-throw to let the form handle the error
    }
  };

  const handleToggle = async (taskId: number) => {
    if (!user?.id || !token) return;

    try {
      const updated = await taskApi.toggle(user.id, taskId, token);
      setTasksData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === taskId ? updated : t)),
        completed: prev.completed + (updated.completed ? 1 : -1),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle task");
    }
  };

  const handleDelete = async (taskId: number) => {
    if (!user?.id || !token) return;

    try {
      const deletedTask = tasksData.tasks.find((t) => t.id === taskId);
      await taskApi.delete(user.id, taskId, token);
      setTasksData((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== taskId),
        total: prev.total - 1,
        completed: deletedTask?.completed ? prev.completed - 1 : prev.completed,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    }
  };

  const handleUpdate = async (taskId: number, data: TaskUpdate) => {
    if (!user?.id || !token) return;

    try {
      const updated = await taskApi.update(user.id, taskId, token, data);
      setTasksData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === taskId ? updated : t)),
        completed: updated.completed
          ? prev.completed +
            (prev.tasks.find((t) => t.id === taskId)?.completed ? 0 : 1)
          : prev.completed -
            (prev.tasks.find((t) => t.id === taskId)?.completed ? 1 : 0),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push("/signin");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  // Refresh tasks when chat makes changes
  const refreshTasks = useCallback(async () => {
    if (!user?.id || !token) return;

    try {
      const data = await taskApi.list(user.id, token);
      setTasksData(data);
    } catch (err) {
      console.error("Failed to refresh tasks:", err);
    }
  }, [user?.id, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Redirecting to sign in...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Todo App</h1>
            <p className="text-sm text-gray-500">Advanced Task Management</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome,{" "}
              <span className="font-medium">{user.name || user.email}</span>
            </span>
            <button
              onClick={handleSignOut}
              className="px-3 py-1.5 text-sm text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="text-red-700 hover:text-red-900 font-bold text-xl leading-none"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Task Management Section */}
          <div className="space-y-6">
            <TaskForm onSubmit={handleCreateTask} categories={categories} />
            <TaskList
              tasks={tasksData}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          </div>

          {/* AI Chat Section */}
          <div className="lg:sticky lg:top-8 h-[700px]">
            {token && (
              <ChatInterface
                userId={user.id}
                token={token}
                onTaskChange={refreshTasks}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 pb-8 text-center text-sm text-gray-500">
        <p>Todo App - Built with Next.js, FastAPI, and AI</p>
      </footer>
    </div>
  );
}

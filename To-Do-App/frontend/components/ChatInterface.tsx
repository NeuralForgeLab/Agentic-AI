// Task: T3-007 - ChatInterface component
// From: specs/phase3-ai-chatbot/plan.md §3.1, specs/phase3-ai-chatbot/spec.md §4.1
"use client";

import { useState, useEffect, useRef } from "react";
import { chatApi } from "@/lib/api";
import type { ChatMessage as ChatMessageType, ActionResult } from "@/types/chat";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

interface ChatInterfaceProps {
  userId: string;
  token: string;
  onTaskChange?: () => void;
}

interface DisplayMessage {
  id: number | string;
  role: "user" | "assistant";
  content: string;
  actions?: ActionResult[];
}

export default function ChatInterface({
  userId,
  token,
  onTaskChange,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add initial greeting message
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hi! I'm your AI assistant. I can help you manage your tasks. Try saying things like:\n\n" +
          "- \"Add a task to buy groceries\"\n" +
          "- \"Show me my tasks\"\n" +
          "- \"Mark task 1 as done\"\n" +
          "- \"Delete task 2\"\n\n" +
          "How can I help you today?",
      },
    ]);
  }, []);

  const handleSend = async (message: string) => {
    if (!message.trim() || loading) return;

    // Add user message immediately
    const userMessage: DisplayMessage = {
      id: Date.now(),
      role: "user",
      content: message,
    };
    setMessages((prev) => [...prev, userMessage]);
    setError("");
    setLoading(true);

    try {
      const response = await chatApi.sendMessage(userId, token, {
        message,
        conversation_id: conversationId || undefined,
      });

      // Save conversation ID for subsequent messages
      if (!conversationId) {
        setConversationId(response.conversation_id);
      }

      // Add assistant response
      const assistantMessage: DisplayMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.message,
        actions: response.actions,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Notify parent if tasks were modified
      if (response.actions && response.actions.length > 0 && onTaskChange) {
        const taskModifyingActions = [
          "task_created",
          "task_updated",
          "task_deleted",
          "task_toggled",
        ];
        const hasTaskChange = response.actions.some((action) =>
          taskModifyingActions.includes(action.type)
        );
        if (hasTaskChange) {
          onTaskChange();
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setError(err instanceof Error ? err.message : "Failed to send message");

      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          actions: [{ type: "error", message: err instanceof Error ? err.message : "Unknown error" }],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setConversationId(null);
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Starting a new conversation. How can I help you?",
      },
    ]);
    setError("");
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-800">AI Assistant</span>
          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
            Online
          </span>
        </div>
        <button
          onClick={handleNewConversation}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          New Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            actions={msg.actions}
          />
        ))}

        {loading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-sm text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={loading} />
    </div>
  );
}

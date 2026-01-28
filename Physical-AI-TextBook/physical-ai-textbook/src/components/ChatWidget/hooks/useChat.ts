import { useState, useCallback, useRef } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useAuth } from "@site/src/contexts/AuthContext";

export interface Source {
  chapter: string;
  section: string;
  content: string;
  score: number;
  url?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  selectedText?: string;
  createdAt: Date;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}

export function useChat() {
  const { siteConfig } = useDocusaurusContext();
  const API_URL =
    (siteConfig.customFields?.ragApiUrl as string) || "http://localhost:8000";

  const { user, getIdToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getAuthHeaders = useCallback(async () => {
    if (!user) return {};
    const token = await getIdToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, [user, getIdToken]);

  const loadSessions = useCallback(async () => {
    if (!user) return;

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/api/history/sessions`, {
        headers,
      });

      if (!response.ok) throw new Error("Failed to load sessions");

      const data = await response.json();
      setSessions(
        data.sessions.map((s: any) => ({
          id: s.id,
          title: s.title,
          createdAt: new Date(s.created_at),
          updatedAt: new Date(s.updated_at),
          messageCount: s.message_count,
        })),
      );
    } catch (err) {
      console.error("Error loading sessions:", err);
    }
  }, [user, getAuthHeaders]);

  const loadSessionMessages = useCallback(
    async (sessionId: string) => {
      if (!user) return;

      try {
        setIsLoading(true);
        const headers = await getAuthHeaders();
        const response = await fetch(
          `${API_URL}/api/history/sessions/${sessionId}`,
          { headers },
        );

        if (!response.ok) throw new Error("Failed to load messages");

        const data = await response.json();
        setMessages(
          data.messages.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            sources: m.sources,
            selectedText: m.selected_text,
            createdAt: new Date(m.created_at),
          })),
        );
        setCurrentSessionId(sessionId);
      } catch (err) {
        console.error("Error loading messages:", err);
        setError("Failed to load chat history");
      } finally {
        setIsLoading(false);
      }
    },
    [user, getAuthHeaders],
  );

  const sendMessage = useCallback(
    async (
      content: string,
      selectedText?: string,
      pageContext?: string,
    ): Promise<void> => {
      if (!content.trim()) return;

      // Cancel any ongoing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setError(null);
      setIsLoading(true);

      // Add user message immediately
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        role: "user",
        content,
        selectedText,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Add placeholder for assistant message
      const assistantMessage: Message = {
        id: `temp-assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        sources: [],
        createdAt: new Date(),
        isStreaming: true,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      try {
        // Use simple endpoint (no auth required, no streaming)
        const response = await fetch(`${API_URL}/api/chat/simple`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            selected_text: selectedText,
            page_context: pageContext,
            locale: "en",
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const data = await response.json();

        // Update the assistant message with the response
        setMessages((prev) =>
          prev.map((m) =>
            m.isStreaming
              ? {
                  ...m,
                  id: `msg-${Date.now()}`,
                  content: data.content,
                  sources: data.sources,
                  isStreaming: false,
                }
              : m,
          ),
        );

        // Skip the streaming logic below
        setIsLoading(false);
        abortControllerRef.current = null;
        return;

        // Original streaming code (kept for future use)
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";
        let fullContent = "";
        let sources: Source[] = [];
        let newSessionId = currentSessionId;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("event:")) {
              const eventType = line.slice(6).trim();
              continue;
            }

            if (line.startsWith("data:")) {
              try {
                const data = JSON.parse(line.slice(5).trim());

                if (data.content) {
                  fullContent += data.content;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.isStreaming ? { ...m, content: fullContent } : m,
                    ),
                  );
                }

                if (data.sources) {
                  sources = data.sources;
                  if (data.session_id) {
                    newSessionId = data.session_id;
                  }
                }

                if (data.message_id) {
                  // Stream complete
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.isStreaming
                        ? {
                            ...m,
                            id: data.message_id,
                            content: fullContent,
                            sources,
                            isStreaming: false,
                          }
                        : m,
                    ),
                  );
                  if (newSessionId && newSessionId !== currentSessionId) {
                    setCurrentSessionId(newSessionId);
                    loadSessions();
                  }
                }

                if (data.error) {
                  throw new Error(data.error);
                }
              } catch (parseError) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          // User cancelled, remove streaming message
          setMessages((prev) => prev.filter((m) => !m.isStreaming));
        } else {
          console.error("Chat error:", err);
          setError(err.message || "Failed to send message");
          // Remove streaming message on error
          setMessages((prev) => prev.filter((m) => !m.isStreaming));
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [user, currentSessionId, getAuthHeaders, loadSessions],
  );

  const startNewChat = useCallback(() => {
    setMessages([]);
    setCurrentSessionId(null);
    setError(null);
  }, []);

  const deleteSession = useCallback(
    async (sessionId: string) => {
      if (!user) return;

      try {
        const headers = await getAuthHeaders();
        const response = await fetch(
          `${API_URL}/api/history/sessions/${sessionId}`,
          {
            method: "DELETE",
            headers,
          },
        );

        if (!response.ok) throw new Error("Failed to delete session");

        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (currentSessionId === sessionId) {
          startNewChat();
        }
      } catch (err) {
        console.error("Error deleting session:", err);
        setError("Failed to delete chat");
      }
    },
    [user, currentSessionId, getAuthHeaders, startNewChat],
  );

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    messages,
    sessions,
    currentSessionId,
    isLoading,
    error,
    sendMessage,
    loadSessions,
    loadSessionMessages,
    startNewChat,
    deleteSession,
    cancelStream,
    clearError: () => setError(null),
  };
}

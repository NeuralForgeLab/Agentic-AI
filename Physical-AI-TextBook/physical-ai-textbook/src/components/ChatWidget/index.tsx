import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "@docusaurus/router";
import Link from "@docusaurus/Link";
import Translate from "@docusaurus/Translate";
import { useAuth } from "@site/src/contexts/AuthContext";
import { useChat, ChatSession } from "./hooks/useChat";
import { useTextSelection } from "./hooks/useTextSelection";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import styles from "./styles.module.css";

export default function ChatWidget() {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const {
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
    clearError,
  } = useChat();

  const { selectedText, selectionRect, hasSelection, clearSelection } =
    useTextSelection();

  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [pendingSelectedText, setPendingSelectedText] = useState<string | null>(
    null,
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current page context
  const pageContext = location.pathname;

  // Load sessions when user is authenticated
  useEffect(() => {
    if (user && isOpen) {
      loadSessions();
    }
  }, [user, isOpen, loadSessions]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setShowHistory(false);
  };

  const handleSendMessage = (content: string) => {
    sendMessage(content, pendingSelectedText || undefined, pageContext);
    setPendingSelectedText(null);
    clearSelection();
  };

  const handleAskAboutSelection = () => {
    if (hasSelection) {
      setPendingSelectedText(selectedText);
      setIsOpen(true);
      clearSelection();
    }
  };

  const handleSessionClick = (session: ChatSession) => {
    loadSessionMessages(session.id);
    setShowHistory(false);
  };

  const handleNewChat = () => {
    startNewChat();
    setShowHistory(false);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  // Don't render during SSR
  if (typeof window === "undefined") {
    return null;
  }

  // Don't show on auth pages
  if (location.pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <div className={styles.chatWidget}>
      {/* Selection Tooltip */}
      {hasSelection && selectionRect && !isOpen && (
        <div
          className={styles.selectionTooltip}
          style={{
            top: selectionRect.bottom + window.scrollY + 8,
            left: selectionRect.left + selectionRect.width / 2,
            transform: "translateX(-50%)",
          }}
          onClick={handleAskAboutSelection}
        >
          💬 <Translate id="chat.askAboutThis">Ask about this</Translate>
        </div>
      )}

      {/* Chat Panel */}
      {isOpen ? (
        <div className={styles.chatPanel}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              🤖 <Translate id="chat.title">AI Assistant</Translate>
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.headerButton}
                onClick={() => setShowHistory(!showHistory)}
                title="Chat history"
              >
                📋
              </button>
              <button
                className={styles.headerButton}
                onClick={handleNewChat}
                title="New chat"
              >
                ➕
              </button>
              <button
                className={styles.headerButton}
                onClick={handleToggle}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* History Sidebar */}
          {showHistory && (
            <div className={styles.historySidebar}>
              <div className={styles.historyHeader}>
                <span className={styles.historyTitle}>
                  <Translate id="chat.history">Chat History</Translate>
                </span>
                <button
                  className={styles.headerButton}
                  onClick={() => setShowHistory(false)}
                >
                  ✕
                </button>
              </div>
              <div className={styles.historyList}>
                {sessions.length === 0 ? (
                  <div className={styles.welcomeMessage}>
                    <p className={styles.welcomeText}>
                      <Translate id="chat.noHistory">
                        No chat history yet
                      </Translate>
                    </p>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      className={styles.historyItem}
                      onClick={() => handleSessionClick(session)}
                    >
                      <div className={styles.historyItemContent}>
                        <div className={styles.historyItemTitle}>
                          {session.title}
                        </div>
                        <div className={styles.historyItemMeta}>
                          {formatDate(session.updatedAt)} ·{" "}
                          {session.messageCount} messages
                        </div>
                      </div>
                      <button
                        className={styles.historyItemDelete}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Main Content */}
          <>
            {/* Messages */}
            <div className={styles.messagesContainer}>
              {messages.length === 0 ? (
                <div className={styles.welcomeMessage}>
                  <div className={styles.welcomeIcon}>📚</div>
                  <div className={styles.welcomeTitle}>
                    <Translate id="chat.welcome.title">
                      Welcome to the AI Assistant
                    </Translate>
                  </div>
                  <p className={styles.welcomeText}>
                    <Translate id="chat.welcome.text">
                      Ask me anything about the Physical AI Textbook! You can
                      also select text on any page and ask about it.
                    </Translate>
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error Message */}
            {error && (
              <div className={styles.errorMessage}>
                <span>{error}</span>
                <button className={styles.errorDismiss} onClick={clearError}>
                  ✕
                </button>
              </div>
            )}

            {/* Input */}
            <ChatInput
              onSend={handleSendMessage}
              disabled={isLoading}
              selectedText={pendingSelectedText || undefined}
              onClearSelection={() => setPendingSelectedText(null)}
              placeholder={
                pendingSelectedText
                  ? "Ask about the selected text..."
                  : "Ask a question..."
              }
            />
          </>
        </div>
      ) : (
        <button
          className={styles.toggleButton}
          onClick={handleToggle}
          aria-label="Open chat"
        >
          💬
        </button>
      )}
    </div>
  );
}

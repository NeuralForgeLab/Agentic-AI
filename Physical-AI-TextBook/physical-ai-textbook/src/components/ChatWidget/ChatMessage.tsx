import React from 'react';
import { Message, Source } from './hooks/useChat';
import styles from './styles.module.css';

interface ChatMessageProps {
  message: Message;
}

function SourceCard({ source }: { source: Source }) {
  return (
    <a
      href={source.url || '#'}
      className={styles.sourceCard}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className={styles.sourceHeader}>
        <span className={styles.sourceChapter}>{source.chapter}</span>
        <span className={styles.sourceScore}>
          {Math.round(source.score * 100)}%
        </span>
      </div>
      <div className={styles.sourceSection}>{source.section}</div>
    </a>
  );
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`${styles.message} ${isUser ? styles.userMessage : styles.assistantMessage}`}
    >
      <div className={styles.messageAvatar}>
        {isUser ? '👤' : '🤖'}
      </div>
      <div className={styles.messageContent}>
        {message.selectedText && (
          <div className={styles.selectedTextQuote}>
            <span className={styles.quoteLabel}>Asking about:</span>
            <q>{message.selectedText.slice(0, 150)}...</q>
          </div>
        )}
        <div className={styles.messageText}>
          {message.content}
          {message.isStreaming && (
            <span className={styles.cursor}>▊</span>
          )}
        </div>
        {message.sources && message.sources.length > 0 && (
          <div className={styles.sourcesContainer}>
            <div className={styles.sourcesLabel}>Sources:</div>
            <div className={styles.sourcesList}>
              {message.sources.map((source, index) => (
                <SourceCard key={index} source={source} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

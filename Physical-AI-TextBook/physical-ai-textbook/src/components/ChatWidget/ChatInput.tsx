import React, { useState, useRef, useEffect } from 'react';
import Translate from '@docusaurus/Translate';
import styles from './styles.module.css';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  selectedText?: string;
  onClearSelection?: () => void;
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder,
  selectedText,
  onClearSelection,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <form onSubmit={handleSubmit} className={styles.inputForm}>
      {selectedText && (
        <div className={styles.selectedTextBadge}>
          <span className={styles.selectedTextPreview}>
            📝 "{selectedText.slice(0, 50)}..."
          </span>
          <button
            type="button"
            className={styles.clearSelectionBtn}
            onClick={onClearSelection}
            aria-label="Clear selection"
          >
            ×
          </button>
        </div>
      )}
      <div className={styles.inputContainer}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Ask a question...'}
          disabled={disabled}
          className={styles.input}
          rows={1}
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className={styles.sendButton}
          aria-label="Send message"
        >
          {disabled ? (
            <span className={styles.loadingSpinner}>⏳</span>
          ) : (
            '➤'
          )}
        </button>
      </div>
    </form>
  );
}

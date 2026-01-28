import { useState, useEffect, useCallback } from 'react';

interface TextSelection {
  text: string;
  rect: DOMRect | null;
}

export function useTextSelection() {
  const [selection, setSelection] = useState<TextSelection>({
    text: '',
    rect: null,
  });

  const handleSelectionChange = useCallback(() => {
    const windowSelection = window.getSelection();

    if (!windowSelection || windowSelection.isCollapsed) {
      setSelection({ text: '', rect: null });
      return;
    }

    const text = windowSelection.toString().trim();

    if (text.length < 10 || text.length > 1000) {
      // Ignore very short or very long selections
      setSelection({ text: '', rect: null });
      return;
    }

    // Get the bounding rectangle of the selection
    const range = windowSelection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setSelection({ text, rect });
  }, []);

  const clearSelection = useCallback(() => {
    setSelection({ text: '', rect: null });
    window.getSelection()?.removeAllRanges();
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleSelectionChange);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  return {
    selectedText: selection.text,
    selectionRect: selection.rect,
    hasSelection: selection.text.length > 0,
    clearSelection,
  };
}

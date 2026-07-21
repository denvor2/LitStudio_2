import { useEffect, useRef, useCallback } from 'react';
import { getSceneText, onYDocChange, loadContentIntoYDoc } from '../../lib/yjs';

interface SceneEditorProps {
  sceneId: string;
  initialContent: string;
  onUpdate: (content: string, wordCount: number, charCount: number) => void;
}

export function SceneEditor({ sceneId, initialContent, onUpdate }: SceneEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const lastUpdateRef = useRef<string>('');

  // Load initial content into Yjs
  useEffect(() => {
    loadContentIntoYDoc(sceneId, initialContent);
    if (editorRef.current) {
      editorRef.current.value = initialContent;
      lastUpdateRef.current = initialContent;
    }
  }, [sceneId, initialContent]);

  // Subscribe to Yjs changes
  useEffect(() => {
    const unsubscribe = onYDocChange(sceneId, (content) => {
      if (editorRef.current && content !== editorRef.current.value) {
        // Save cursor position
        const start = editorRef.current.selectionStart;
        const end = editorRef.current.selectionEnd;

        editorRef.current.value = content;

        // Restore cursor position
        editorRef.current.selectionStart = start;
        editorRef.current.selectionEnd = end;
      }

      // Only call onUpdate if content actually changed
      if (content !== lastUpdateRef.current) {
        lastUpdateRef.current = content;
        const wordCount = content.split(/\s+/).filter(Boolean).length;
        const charCount = content.length;
        onUpdate(content, wordCount, charCount);
      }
    });

    return unsubscribe;
  }, [sceneId, onUpdate]);

  // Handle input
  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    const content = editorRef.current.value;

    // Update Yjs document (which triggers the observer)
    const text = getSceneText(sceneId);
    text.delete(0, text.length);
    text.insert(0, content);
  }, [sceneId]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = editorRef.current?.selectionStart || 0;
      const end = editorRef.current?.selectionEnd || 0;
      const value = editorRef.current?.value || '';
      const newValue = value.substring(0, start) + '\t' + value.substring(end);
      if (editorRef.current) {
        editorRef.current.value = newValue;
        editorRef.current.selectionStart = start + 1;
        editorRef.current.selectionEnd = start + 1;
        handleInput();
      }
    }
  }, [handleInput]);

  return (
    <div className="flex-1 overflow-y-auto">
      <textarea
        ref={editorRef}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        className="w-full h-full px-16 py-12 focus:outline-none resize-none"
        style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: '18px',
          lineHeight: '1.8',
        }}
        placeholder="Начните писать..."
        spellCheck={false}
      />
    </div>
  );
}

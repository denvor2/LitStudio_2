import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useCallback } from 'react';

interface SceneEditorProps {
  content: string;
  onUpdate: (content: string, plaintext: string) => void;
  placeholder?: string;
}

export function SceneEditor({ content, onUpdate, placeholder }: SceneEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Начните писать...',
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[60vh] px-16 py-12',
        style: 'font-family: "Playfair Display", Georgia, serif; font-size: 18px; line-height: 1.8;',
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const plaintext = editor.getText();
      onUpdate(JSON.stringify(json), plaintext);
    },
  });

  // Sync external content changes
  useEffect(() => {
    if (editor && content) {
      try {
        const parsed = JSON.parse(content);
        const currentContent = JSON.stringify(editor.getJSON());
        if (content !== currentContent) {
          editor.commands.setContent(parsed);
        }
      } catch {
        // If content is plain text, set it directly
        if (editor.getText() !== content) {
          editor.commands.setContent(content);
        }
      }
    }
  }, [content]);

  if (!editor) return null;

  return (
    <div className="min-h-[60vh]">
      <EditorContent editor={editor} />
    </div>
  );
}

'use client';

import { HocuspocusProvider } from '@hocuspocus/provider';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { EditorContent, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';

interface TiptapEditorProps {
  provider: HocuspocusProvider;
  username: string;
}

const Tiptap = ({ provider, username }: TiptapEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      Collaboration.configure({
        document: provider.document,
      }),
      CollaborationCursor.configure({
        provider,
        user: { name: username, color: '#ffcc00' },
      }),
    ],
    // content: '<p>Hello World! 🌎️</p>',
  });

  return (
    <div className="border-2">
      <EditorContent
        id="tiptap"
        editor={editor}
        onClick={() => editor?.commands.focus()}
      />
    </div>
  );
};

export default Tiptap;

'use client';

import { HocuspocusProvider } from '@hocuspocus/provider';
import CodeBlock from '@tiptap/extension-code-block';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import { EditorContent, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';

interface TiptapEditorProps {
  provider: HocuspocusProvider;
  username: string;
}

const Tiptap = ({ provider, username }: TiptapEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'prose text-white-600 prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
      },
    },
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      Highlight,
      Image.configure({ inline: true, allowBase64: true }),
      CodeBlock,
      Collaboration.configure({
        document: provider.document,
      }),
      CollaborationCursor.configure({
        provider,
        user: { name: username, color: '#ffcc00' },
      }),
    ],
  });

  return (
    <div className="border-2 overflow-auto">
      <EditorContent
        id="tiptap"
        editor={editor}
        onClick={() => editor?.commands.focus()}
      />
    </div>
  );
};

export default Tiptap;

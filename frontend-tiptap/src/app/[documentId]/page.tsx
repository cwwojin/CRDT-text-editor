'use client';

import { HocuspocusProvider } from '@hocuspocus/provider';
import Tiptap from '@src/components/editor/editor';
import { useParams, useSearchParams } from 'next/navigation';
import * as Y from 'yjs';

export default function Home() {
  const params = useParams();
  const query = useSearchParams();

  const ydoc = new Y.Doc();
  const username = query?.get('user') ?? 'John Doe';

  const provider = new HocuspocusProvider({
    url: 'ws://localhost:8001',
    name: params.documentId as string,
    document: ydoc,
  });

  return (
    <div>
      <Tiptap provider={provider} username={username} />{' '}
    </div>
  );
}

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';

// WebSocket server URL - same host, port 3002
const WS_URL = `ws://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3002`;

// Active documents and providers
const docs = new Map<string, Y.Doc>();
const providers = new Map<string, WebrtcProvider>();
const persistence = new Map<string, IndexeddbPersistence>();

export function getYDoc(docId: string): Y.Doc {
  let doc = docs.get(docId);
  if (!doc) {
    doc = new Y.Doc();
    docs.set(docId, doc);

    // Load from IndexedDB
    const pers = new IndexeddbPersistence(docId, doc);
    persistence.set(docId, pers);
  }
  return doc;
}

export function connectToRoom(docId: string): { doc: Y.Doc; provider: WebrtcProvider } {
  const doc = getYDoc(docId);

  // Create WebRTC provider for peer-to-peer sync
  const provider = new WebrtcProvider(docId, doc, {
    signaling: [WS_URL],
  });

  providers.set(docId, provider);

  // Log connection status
  provider.on('synced', ({ synced }: { synced: boolean }) => {
    console.log(`[Yjs] Room ${docId} synced: ${synced}`);
  });

  provider.awareness.on('change', () => {
    console.log(`[Yjs] Awareness changed in room ${docId}`);
  });

  return { doc, provider };
}

export function disconnectFromRoom(docId: string) {
  const provider = providers.get(docId);
  if (provider) {
    provider.disconnect();
    provider.destroy();
    providers.delete(docId);
  }

  const pers = persistence.get(docId);
  if (pers) {
    pers.destroy();
    persistence.delete(docId);
  }

  const doc = docs.get(docId);
  if (doc) {
    doc.destroy();
    docs.delete(docId);
  }
}

export function getSceneText(docId: string): Y.Text {
  const doc = getYDoc(docId);
  return doc.getText('scene-content');
}

export function loadContentIntoYDoc(docId: string, content: string) {
  const text = getSceneText(docId);
  const currentContent = text.toString();
  if (currentContent !== content) {
    text.delete(0, currentContent.length);
    text.insert(0, content);
  }
}

export function onYDocChange(docId: string, callback: (content: string) => void): () => void {
  const text = getSceneText(docId);
  const handler = () => callback(text.toString());
  text.observe(handler);
  return () => text.unobserve(handler);
}

export function getAwareness(docId: string) {
  const provider = providers.get(docId);
  return provider?.awareness;
}

export function setUserAwareness(docId: string, user: { name: string; color: string }) {
  const awareness = getAwareness(docId);
  if (awareness) {
    awareness.setLocalStateField('user', {
      name: user.name,
      color: user.color,
    });
  }
}

export function getConnectedUsers(docId: string): Array<{ name: string; color: string }> {
  const awareness = getAwareness(docId);
  if (!awareness) return [];

  const users: Array<{ name: string; color: string }> = [];
  awareness.getStates().forEach((state: any) => {
    if (state.user) {
      users.push(state.user);
    }
  });
  return users;
}

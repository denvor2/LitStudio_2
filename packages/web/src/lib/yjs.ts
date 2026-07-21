import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';

// Shared Yjs document per scene
const docs = new Map<string, Y.Doc>();
const persistence = new Map<string, IndexeddbPersistence>();

export function getYDoc(sceneId: string): Y.Doc {
  let doc = docs.get(sceneId);
  if (!doc) {
    doc = new Y.Doc();
    docs.set(sceneId, doc);

    // Load from IndexedDB
    const pers = new IndexeddbPersistence(`scene-${sceneId}`, doc);
    persistence.set(sceneId, pers);
  }
  return doc;
}

export function destroyYDoc(sceneId: string) {
  const doc = docs.get(sceneId);
  const pers = persistence.get(sceneId);
  if (pers) {
    pers.destroy();
    persistence.delete(sceneId);
  }
  if (doc) {
    doc.destroy();
    docs.delete(sceneId);
  }
}

// Get the Yjs text type for a scene
export function getSceneText(sceneId: string): Y.Text {
  const doc = getYDoc(sceneId);
  return doc.getText('scene-content');
}

// Convert Yjs content to HTML string
export function yDocToHTML(sceneId: string): string {
  const text = getSceneText(sceneId);
  return text.toString() || '';
}

// Load content from plain text into Yjs
export function loadContentIntoYDoc(sceneId: string, content: string) {
  const text = getSceneText(sceneId);
  if (text.toString() !== content) {
    text.delete(0, text.length);
    text.insert(0, content);
  }
}

// Subscribe to changes
export function onYDocChange(sceneId: string, callback: (content: string) => void): () => void {
  const text = getSceneText(sceneId);
  const handler = () => callback(text.toString());
  text.observe(handler);
  return () => text.unobserve(handler);
}

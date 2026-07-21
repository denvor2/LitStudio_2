import { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { Server } from 'http';
import * as Y from 'yjs';

// Simplified WebSocket server for Yjs sync
export function startWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server });
  const docs = new Map<string, Y.Doc>();

  wss.on('connection', (ws: any, req: IncomingMessage) => {
    const url = new URL(req.url || '', 'http://localhost');
    const roomName = url.searchParams.get('room') || 'default';

    console.log(`[WS] Client connected to room: ${roomName}`);

    // Get or create document for this room
    let doc = docs.get(roomName);
    if (!doc) {
      doc = new Y.Doc();
      docs.set(roomName, doc);
    }

    // Send current document state to new client
    const stateVector = Y.encodeStateAsUpdate(doc);
    ws.send(JSON.stringify({ type: 'sync', data: Array.from(stateVector) }));

    // Handle incoming updates
    ws.on('message', (message: any) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'update' && doc) {
          const update = new Uint8Array(data.data);
          Y.applyUpdate(doc, update);

          // Broadcast to other clients
          wss.clients.forEach((client: any) => {
            if (client !== ws && client.readyState === 1) {
              client.send(JSON.stringify({ type: 'update', data: data.data }));
            }
          });
        }
      } catch (e) {
        console.error('[WS] Error processing message:', e);
      }
    });

    ws.on('close', () => {
      console.log(`[WS] Client disconnected from room: ${roomName}`);
    });
  });

  console.log('[WS] WebSocket server ready');
  return wss;
}

// Start standalone if run directly
if (require.main === module) {
  const http = require('http');
  const server = http.createServer();
  startWebSocketServer(server);
  const port = process.env.WS_PORT || 3002;
  server.listen(port, () => {
    console.log(`[WS] Standalone server listening on port ${port}`);
  });
}

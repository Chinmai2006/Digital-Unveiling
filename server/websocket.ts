import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import network from 'os';
import { WSMessage, ClientRole } from '../shared/protocol.js';
import { PresentationStateMachine } from './stateMachine.js';

interface ExtendedWebSocket extends WebSocket {
  isAlive?: boolean;
  role?: ClientRole;
}

export function setupWebSocketServer(server: Server, stateMachine: PresentationStateMachine) {
  const wss = new WebSocketServer({ server });

  const getLocalIp = (): string => {
    const interfaces = network.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name] || []) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
    return '127.0.0.1';
  };

  const getConnectedRoles = () => {
    let tablet = false;
    let projector = false;
    let control = false;
    let total = 0;

    wss.clients.forEach((client: ExtendedWebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        total++;
        if (client.role === 'tablet') tablet = true;
        if (client.role === 'projector') projector = true;
        if (client.role === 'control') control = true;
      }
    });

    return { tablet, projector, control, total };
  };

  const broadcastState = () => {
    const serverIp = getLocalIp();
    const payload = stateMachine.getStatePayload(getConnectedRoles(), serverIp);
    const message: WSMessage = {
      type: 'STATE_UPDATE',
      payload,
      timestamp: Date.now(),
    };

    const data = JSON.stringify(message);
    wss.clients.forEach((client: ExtendedWebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };

  wss.on('connection', (ws: ExtendedWebSocket) => {
    ws.isAlive = true;
    ws.role = 'unknown';

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Send initial state upon connection
    ws.send(JSON.stringify({
      type: 'STATE_UPDATE',
      payload: stateMachine.getStatePayload(getConnectedRoles(), getLocalIp()),
      timestamp: Date.now(),
    }));

    ws.on('message', (rawMessage: string) => {
      try {
        const msg: WSMessage = JSON.parse(rawMessage.toString());

        if (msg.type === 'CLIENT_REGISTER' && msg.role) {
          ws.role = msg.role;
          console.log(`[WS] Client registered with role: ${ws.role}`);
          broadcastState();
          return;
        }

        if (msg.type === 'START_REVEAL') {
          console.log('[WS] Command received: START_REVEAL');
          const started = stateMachine.startAutoSequence(broadcastState);
          if (!started) {
            console.log('[WS] START_REVEAL ignored — sequence already running or not in INTRO state.');
          }
          return;
        }

        if (msg.type === 'REVEAL_NEXT') {
          console.log('[WS] Command received: REVEAL_NEXT');
          const payload = stateMachine.getStatePayload(getConnectedRoles());
          if (payload.currentIndex === -1) {
            stateMachine.startAutoSequence(broadcastState);
          } else {
            const changed = stateMachine.revealNext();
            if (changed) broadcastState();
          }
          return;
        }

        if (msg.type === 'REVEAL_PREV') {
          console.log('[WS] Command received: REVEAL_PREV');
          const changed = stateMachine.revealPrev();
          if (changed) broadcastState();
          return;
        }

        if (msg.type === 'RESET') {
          console.log('[WS] Command received: RESET');
          stateMachine.reset();
          broadcastState();
          return;
        }

        if (msg.type === 'TRIGGER_INDEX' && typeof msg.payload?.index === 'number') {
          console.log(`[WS] Command received: TRIGGER_INDEX ${msg.payload.index}`);
          const changed = stateMachine.triggerIndex(msg.payload.index);
          if (changed) broadcastState();
          return;
        }

        if (msg.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
          return;
        }
      } catch (err) {
        console.error('[WS] Error processing message:', err);
      }
    });

    ws.on('close', () => {
      broadcastState();
    });
  });

  // Heartbeat ping interval
  const interval = setInterval(() => {
    wss.clients.forEach((ws: ExtendedWebSocket) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 10000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  return { broadcastState, getLocalIp };
}

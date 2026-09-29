import { useEffect, useState, useRef, useCallback } from 'react';
import { StateUpdatePayload, WSMessage, ClientRole } from '@shared/protocol';

export function useWebSocket(role: ClientRole) {
  const [serverState, setServerState] = useState<StateUpdatePayload | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getWsUrl = (): string => {
    const envUrl = (import.meta as any).env?.VITE_WS_URL;
    if (envUrl) return envUrl;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    if (window.location.protocol === 'https:') {
      return `${protocol}//${window.location.host}/ws`;
    }
    const host = window.location.hostname;
    return `${protocol}//${host}:3001`;
  };

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    const url = getWsUrl();
    console.log(`[WS Client] Connecting to ${url} as role: ${role}...`);

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('[WS Client] Connected successfully.');
        setIsConnected(true);
        // Register role with server
        ws.send(
          JSON.stringify({
            type: 'CLIENT_REGISTER',
            role,
            timestamp: Date.now(),
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const msg: WSMessage = JSON.parse(event.data);
          if (msg.type === 'STATE_UPDATE' && msg.payload) {
            setServerState(msg.payload as StateUpdatePayload);
          }
        } catch (e) {
          console.error('[WS Client] Message parse error:', e);
        }
      };

      ws.onclose = () => {
        console.warn('[WS Client] Closed. Attempting reconnect in 2s...');
        setIsConnected(false);
        wsRef.current = null;
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = setTimeout(connect, 2000);
      };

      ws.onerror = (err) => {
        console.error('[WS Client] Error:', err);
        ws.close();
      };

      wsRef.current = ws;
    } catch (e) {
      console.error('[WS Client] Connection exception:', e);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = setTimeout(connect, 3000);
    }
  }, [role]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((msg: WSMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    } else {
      console.warn('[WS Client] Cannot send message, WebSocket not open.');
    }
  }, []);

  return { serverState, isConnected, sendMessage };
}

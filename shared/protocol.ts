export type PresentationState = 
  | 'INTRO'
  | 'READY'
  | 'REVEALING'
  | 'DISPLAYED'
  | 'FINALE_BUILDUP'
  | 'FINALE_REVEALED'
  | 'ALL_LOGOS'
  | 'FINAL';

export interface LogoConfig {
  id: string;
  name: string;
  fullName?: string;
  tagline?: string;
  image: string;
  isFinale?: boolean;
  themeColor: string;
  secondaryColor: string;
}

export type WSMessageType =
  | 'STATE_UPDATE'
  | 'START_REVEAL'
  | 'REVEAL_NEXT'
  | 'REVEAL_PREV'
  | 'RESET'
  | 'TRIGGER_INDEX'
  | 'GESTURE_DETECTED'
  | 'CLIENT_REGISTER'
  | 'PING'
  | 'PONG';

export type ClientRole = 'tablet' | 'projector' | 'control' | 'unknown';

export interface WSMessage {
  type: WSMessageType;
  role?: ClientRole;
  payload?: any;
  timestamp: number;
}

export interface StateUpdatePayload {
  currentIndex: number; // 0 to 4 (-1 for INTRO)
  state: PresentationState;
  currentLogo: LogoConfig | null;
  totalLogos: number;
  isLocked?: boolean;
  /** True only when the server is in INTRO state and no sequence is running */
  gestureEnabled: boolean;
  connectedClients: {
    tablet: boolean;
    projector: boolean;
    control: boolean;
    total: number;
  };
  serverIp?: string;
}

export interface GesturePayload {
  gesture: 'OPEN_PALM' | 'UNKNOWN';
  confidence: number;
  handDetected: boolean;
}

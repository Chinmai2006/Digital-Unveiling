import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CameraView } from '../components/CameraView';
import { GestureIndicator } from '../components/GestureIndicator';
import { HandTracker } from '../vision/handTracker';
import { GestureDetector, GestureResult } from '../vision/gestureDetector';
import { StateUpdatePayload, WSMessage } from '@shared/protocol';
import { Wifi, WifiOff, Play, Smartphone } from 'lucide-react';

interface TabletControllerProps {
  serverState: StateUpdatePayload | null;
  sendMessage: (msg: WSMessage) => void;
  isConnected: boolean;
}

/** Tablet-side gesture phase — drives the status HUD messages */
export type TabletPhase =
  | 'READY'           // Waiting for open palm
  | 'PALM_HELD'       // Palm detected, holding 400ms
  | 'SHOW_STARTED'    // Palm confirmed, command sent — put hand down
  | 'IN_PROGRESS'     // Sequence running on the projector
  | 'COMPLETE';       // Sequence finished (FINAL state)

export const TabletController: React.FC<TabletControllerProps> = ({
  serverState,
  sendMessage,
  isConnected,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handTrackerRef = useRef<HandTracker>(new HandTracker());
  const gestureDetectorRef = useRef<GestureDetector>(new GestureDetector(400, 1500));

  const [isVisionReady, setIsVisionReady] = useState(false);
  const [gestureResult, setGestureResult] = useState<GestureResult>({
    gesture: 'UNKNOWN',
    confidence: 0,
    handDetected: false,
    isConfirmed: false,
    progress: 0,
  });

  // Track whether this tablet instance has already sent START_REVEAL
  const hasTriggeredRef = useRef(false);

  // Initialize MediaPipe vision task
  useEffect(() => {
    handTrackerRef.current.initialize().then((ready) => {
      setIsVisionReady(ready);
    });
  }, []);

  const currentLogo = serverState?.currentLogo;
  const currentIndex = serverState?.currentIndex ?? -1;
  const presentationState = serverState?.state ?? 'INTRO';
  const gestureEnabled = serverState?.gestureEnabled ?? true;

  // Derive tablet UI phase from server state
  const tabletPhase: TabletPhase = (() => {
    if (presentationState === 'FINAL' || presentationState === 'ALL_LOGOS') return 'COMPLETE';
    if (currentIndex >= 0 || (presentationState !== 'INTRO' && !gestureEnabled)) return 'IN_PROGRESS';
    if (hasTriggeredRef.current) return 'SHOW_STARTED';
    return 'READY';
  })();

  // Reset local trigger lock when server resets to INTRO with gesture re-enabled
  useEffect(() => {
    if (currentIndex === -1 && gestureEnabled) {
      hasTriggeredRef.current = false;
      gestureDetectorRef.current.resetCooldown();
    }
  }, [currentIndex, gestureEnabled]);

  // Process frame callback from camera
  const handleVideoFrame = useCallback(
    (video: HTMLVideoElement, timestampMs: number) => {
      const landmarks = handTrackerRef.current.detectFrame(video, timestampMs);

      // Process gesture detection logic
      const result = gestureDetectorRef.current.processLandmarks(landmarks);
      setGestureResult(result);

      // Draw hand landmarks overlay on canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          handTrackerRef.current.drawLandmarks(
            ctx,
            landmarks || [],
            canvasRef.current.width,
            canvasRef.current.height,
            result.isConfirmed
          );
        }
      }

      // Only fire once, only when server says gesture is enabled (INTRO + no running sequence)
      if (result.isConfirmed && !hasTriggeredRef.current && gestureEnabled) {
        hasTriggeredRef.current = true;
        console.log('[Tablet] Open Palm Confirmed — sending START_REVEAL');
        sendMessage({
          type: 'START_REVEAL',
          role: 'tablet',
          timestamp: Date.now(),
        });
      }
    },
    [sendMessage, gestureEnabled]
  );

  const handleManualTrigger = () => {
    sendMessage({
      type: 'REVEAL_NEXT',
      role: 'tablet',
      timestamp: Date.now(),
    });
    gestureDetectorRef.current.resetCooldown();
  };

  // Human-readable status label for the top bar
  const statusLabel = (() => {
    if (tabletPhase === 'COMPLETE') return 'SHOW COMPLETE';
    if (tabletPhase === 'IN_PROGRESS') return 'REVEAL IN PROGRESS';
    if (tabletPhase === 'SHOW_STARTED') return 'SHOW STARTED';
    if (currentIndex === -1) return 'INTRO SCREEN';
    return `${currentIndex + 1}/5: ${currentLogo?.name}`;
  })();

  return (
    <div className="relative w-screen h-screen overflow-hidden font-sans select-none bg-black">
      {/* 1. Fullscreen Camera Feed & Canvas Skeleton */}
      <CameraView onVideoFrame={handleVideoFrame} canvasRef={canvasRef} />

      {/* 2. Top Floating Header Bar */}
      <header className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        {/* Left: App Title Badge */}
        <div className="flex items-center space-x-3 px-4 py-2.5 rounded-2xl bg-surface/80 border border-white/20 backdrop-blur-xl pointer-events-auto">
          <Smartphone className="w-5 h-5 text-primary" />
          <div>
            <h1 className="text-xs font-black font-display tracking-wider text-white">GESTURE CONTROLLER</h1>
            <p className="text-[10px] text-slate-300 font-semibold">TABLET CAMERA</p>
          </div>
        </div>

        {/* Right: Status + Connection */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <div className="px-4 py-2.5 rounded-2xl bg-surface/80 border border-white/20 backdrop-blur-xl text-xs font-bold text-slate-200">
            <span className="text-slate-400">STATUS: </span>
            <span className={`font-display font-extrabold ${
              tabletPhase === 'COMPLETE' ? 'text-emerald-400' :
              tabletPhase === 'IN_PROGRESS' ? 'text-amber-400' :
              tabletPhase === 'SHOW_STARTED' ? 'text-yellow-300' :
              'text-primary'
            }`}>
              {statusLabel}
            </span>
          </div>

          <div
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold backdrop-blur-xl ${
              isConnected
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-red-500/20 text-red-300 border border-red-500/40'
            }`}
          >
            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4 animate-pulse" />}
            <span className="hidden sm:inline">{isConnected ? 'ONLINE' : 'OFFLINE'}</span>
          </div>
        </div>
      </header>

      {/* 3. Bottom Floating Gesture HUD & Manual Trigger */}
      <footer className="absolute bottom-4 left-4 right-4 z-30 max-w-4xl mx-auto flex flex-col space-y-3">
        {/* Hand Detection & Gesture Status Component */}
        <GestureIndicator
          result={gestureResult}
          isVisionReady={isVisionReady}
          tabletPhase={tabletPhase}
          gestureEnabled={gestureEnabled}
          currentIndex={currentIndex}
        />

        {/* Manual Touch Trigger Fallback Button */}
        <button
          onClick={handleManualTrigger}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent hover:opacity-90 active:scale-[0.98] transition font-display text-sm md:text-base font-black tracking-widest text-slate-950 flex items-center justify-center space-x-3 shadow-[0_0_30px_rgba(56,189,248,0.4)] border border-white/20 backdrop-blur-lg"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>MANUAL TOUCH TRIGGER • REVEAL NEXT LOGO</span>
        </button>
      </footer>
    </div>
  );
};

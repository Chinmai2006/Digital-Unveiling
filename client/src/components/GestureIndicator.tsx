import React from 'react';
import { GestureResult } from '../vision/gestureDetector';
import { Hand, CheckCircle2, Lock, PartyPopper } from 'lucide-react';
import type { TabletPhase } from '../pages/TabletController';

interface GestureIndicatorProps {
  result: GestureResult;
  isVisionReady: boolean;
  tabletPhase: TabletPhase;
  gestureEnabled: boolean;
  currentIndex?: number;
}

export const GestureIndicator: React.FC<GestureIndicatorProps> = ({
  result,
  tabletPhase,
  gestureEnabled,
  currentIndex = -1,
}) => {
  const { gesture, handDetected, isConfirmed, progress } = result;

  // Derive display values per phase
  const isActive = tabletPhase === 'IN_PROGRESS' || tabletPhase === 'SHOW_STARTED';
  const isComplete = tabletPhase === 'COMPLETE';

  const headingText = (() => {
    if (isComplete) return 'SHOW COMPLETE';
    if (tabletPhase === 'IN_PROGRESS') return 'REVEAL IN PROGRESS';
    if (tabletPhase === 'SHOW_STARTED') return 'SHOW STARTED — PUT YOUR HAND DOWN';
    if (isConfirmed) return 'GESTURE CONFIRMED!';
    if (gesture === 'OPEN_PALM') return 'OPEN PALM DETECTED';
    if (handDetected) return 'RAISE OPEN PALM 🖐️';
    return 'SHOW YOUR HAND TO BEGIN';
  })();

  const subText = (() => {
    if (isComplete) return 'Presentation finished. Reset from Control Panel to restart.';
    if (tabletPhase === 'IN_PROGRESS') return `Logo ${currentIndex >= 0 ? currentIndex + 1 : 1}/5 — no further gestures required.`;
    if (tabletPhase === 'SHOW_STARTED') return 'Command sent. Sequence is launching on the projector...';
    if (isConfirmed) return 'Triggering automatic logo reveal sequence...';
    if (gesture === 'OPEN_PALM') return 'Hold open palm steady for 400ms...';
    return 'Show one open palm to launch the full 5-logo sequence';
  })();

  const ringProgress = isActive || isComplete ? 1 : progress;
  const ringColor = isComplete
    ? '#fbbf24'
    : isActive || isConfirmed
    ? '#22c55e'
    : '#38bdf8';

  const barProgress = isActive || isComplete ? 100 : progress * 100;

  return (
    <div className="w-full bg-surface/85 backdrop-blur-xl border border-white/20 rounded-3xl p-4 md:p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-white">
      {/* Left: Gesture Icon + Radial Progress */}
      <div className="flex items-center space-x-4">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-surface-light border border-white/10 flex-shrink-0">
          {/* Progress SVG Radial Ring */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke={ringColor}
              strokeWidth="5"
              strokeDasharray={175}
              strokeDashoffset={175 * (1 - ringProgress)}
              strokeLinecap="round"
              className="transition-all duration-75"
            />
          </svg>

          {/* Icon inside */}
          {isComplete ? (
            <PartyPopper className="w-7 h-7 text-amber-400" />
          ) : isActive ? (
            <Lock className="w-8 h-8 text-emerald-400 animate-pulse" />
          ) : isConfirmed ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
          ) : (
            <Hand
              className={`w-8 h-8 transition-all duration-300 ${
                gesture === 'OPEN_PALM' && gestureEnabled ? 'text-primary scale-110' : 'text-slate-400'
              }`}
            />
          )}
        </div>

        {/* Text Info */}
        <div className="text-left">
          <div className="flex items-center space-x-2 text-[10px] font-extrabold tracking-widest uppercase mb-0.5">
            {isComplete ? (
              <span className="flex items-center text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 mr-1.5" />
                SEQUENCE COMPLETE
              </span>
            ) : isActive ? (
              <span className="flex items-center text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1.5" />
                GESTURE LOCKED • AUTO SEQUENCE ACTIVE
              </span>
            ) : handDetected ? (
              <span className="flex items-center text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1.5" />
                HAND TRACKED
              </span>
            ) : (
              <span className="flex items-center text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-500 mr-1.5" />
                SEARCHING...
              </span>
            )}
          </div>

          <h2 className="text-lg md:text-xl font-black font-display tracking-wide">{headingText}</h2>
          <p className="text-xs text-slate-300 font-medium">{subText}</p>
        </div>
      </div>

      {/* Right: Hold Progress Bar */}
      <div className="w-full md:w-48 space-y-1">
        <div className="flex justify-between text-[10px] font-extrabold tracking-wider text-slate-300 uppercase">
          <span>{isActive || isComplete ? 'SEQUENCE STATUS' : 'GESTURE HOLD'}</span>
          <span>{Math.round(barProgress)}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-surface-light overflow-hidden border border-white/10 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-75 ${
              isComplete
                ? 'bg-amber-400 shadow-[0_0_10px_#fbbf24]'
                : isActive || isConfirmed
                ? 'bg-emerald-400 shadow-[0_0_10px_#22c55e]'
                : 'bg-gradient-to-r from-primary to-accent'
            }`}
            style={{ width: `${barProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { StateUpdatePayload, WSMessage } from '@shared/protocol';
import { LOGOS } from '../data/logos';
import { soundEngine } from '../audio/soundEngine';
import { Sliders, Monitor, Smartphone, RotateCcw, SkipBack, Play, Sparkles, Volume2, Network } from 'lucide-react';

interface ControlPanelProps {
  serverState: StateUpdatePayload | null;
  sendMessage: (msg: WSMessage) => void;
  isConnected: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  serverState,
  sendMessage,
  isConnected,
}) => {
  const currentIndex = serverState?.currentIndex ?? -1;
  const state = serverState?.state ?? 'INTRO';
  const currentLogo = currentIndex >= 0 && currentIndex < LOGOS.length ? LOGOS[currentIndex] : null;
  const clients = serverState?.connectedClients;
  const serverIp = serverState?.serverIp || 'localhost';

  const sendCmd = (type: WSMessage['type'], payload?: any) => {
    sendMessage({
      type,
      role: 'control',
      payload,
      timestamp: Date.now(),
    });
  };

  return (
    <div className="min-h-screen bg-background text-white p-4 md:p-8 font-sans select-none">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl bg-surface border border-white/10 shadow-2xl gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-400">
              <Sliders className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black font-display tracking-wide">EVENT CONTROL PANEL</h1>
              <p className="text-sm font-semibold text-slate-400">ACES LOGO INAUGURATION OPERATOR DASHBOARD</p>
            </div>
          </div>

          {/* Connection Status Overview Pill */}
          <div className="flex items-center space-x-3 bg-surface-light px-5 py-3 rounded-2xl border border-white/10">
            <div className="flex items-center space-x-2">
              <Smartphone className={`w-4 h-4 ${clients?.tablet ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="text-xs font-bold">TABLET: {clients?.tablet ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center space-x-2">
              <Monitor className={`w-4 h-4 ${clients?.projector ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="text-xs font-bold">PROJECTOR: {clients?.projector ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
          </div>
        </header>

        {/* Network LAN Info Banner */}
        <div className="p-4 rounded-2xl bg-sky-950/60 border border-sky-400/30 flex flex-col md:flex-row items-center justify-between text-sky-200 text-sm gap-2">
          <div className="flex items-center space-x-3">
            <Network className="w-5 h-5 text-sky-400 flex-shrink-0" />
            <span>
              <strong>Local Wi-Fi IP:</strong> <code className="bg-sky-900/80 px-2 py-1 rounded text-sky-100">{serverIp}:3001</code>
            </span>
          </div>
          <div className="text-xs text-sky-300">
            Open tablet URL: <code className="text-white">https://{serverIp}:5173/tablet</code>
          </div>
        </div>

        {/* Current State & Active Logo Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Logo Overview Card */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-surface border border-white/10 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold tracking-widest text-slate-400 uppercase">
                CURRENT DISPLAY STATE
              </span>
              <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-black tracking-wider">
                {state}
              </span>
            </div>

            <div className="my-8 flex items-center space-x-6">
              {currentLogo ? (
                <>
                  <img
                    src={currentLogo.image}
                    alt={currentLogo.name}
                    className="w-24 h-24 object-contain rounded-2xl bg-surface-light p-3 border border-white/10"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">LOGO {currentIndex + 1} OF 5</p>
                    <h2 className="text-4xl font-black font-display text-white mt-1">{currentLogo.name}</h2>
                    <p className="text-sm font-semibold text-slate-300 mt-1">{currentLogo.fullName || currentLogo.tagline}</p>
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">INITIAL STATE</p>
                  <h2 className="text-4xl font-black font-display text-white mt-1">START SCREEN (INTRO)</h2>
                  <p className="text-sm text-slate-300 mt-1">Waiting for initial gesture trigger...</p>
                </div>
              )}
            </div>

            {/* Logo Sequence Timeline Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>SEQUENCE PROGRESS</span>
                <span>{currentIndex === -1 ? '0%' : `${Math.round(((currentIndex + 1) / 5) * 100)}%`}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-surface-light overflow-hidden flex p-0.5 border border-white/10">
                {LOGOS.map((logo, idx) => (
                  <div
                    key={logo.id}
                    className={`h-full flex-1 rounded-full transition-all duration-500 mx-0.5 ${
                      idx === currentIndex
                        ? 'bg-primary shadow-[0_0_10px_#38bdf8]'
                        : idx < currentIndex
                        ? 'bg-emerald-500'
                        : 'bg-slate-700/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Audio Test & Direct Jump Card */}
          <div className="p-8 rounded-3xl bg-surface border border-white/10 flex flex-col justify-between space-y-4">
            <h3 className="text-sm font-extrabold tracking-widest text-slate-400 uppercase">DIRECT JUMP LOGO</h3>
            <div className="grid grid-cols-1 gap-2">
              {LOGOS.map((logo, idx) => (
                <button
                  key={logo.id}
                  onClick={() => sendCmd('TRIGGER_INDEX', { index: idx })}
                  className={`p-3 rounded-xl text-left text-xs font-bold flex items-center justify-between transition border ${
                    idx === currentIndex
                      ? 'bg-primary/20 text-primary border-primary/50'
                      : 'bg-surface-light text-slate-300 border-white/5 hover:bg-white/5'
                  }`}
                >
                  <span>{idx + 1}. {logo.name}</span>
                  {logo.isFinale && <Sparkles className="w-4 h-4 text-amber-400" />}
                </button>
              ))}
            </div>

            {/* Audio Test Trigger */}
            <button
              onClick={() => {
                soundEngine.unlockAudio();
                soundEngine.playTransitionSwoosh();
              }}
              className="w-full py-3 rounded-xl bg-surface-light border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center space-x-2"
            >
              <Volume2 className="w-4 h-4 text-primary" />
              <span>TEST AUDIO FX SWOOSH</span>
            </button>
          </div>
        </div>

        {/* Primary Manual Action Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => sendCmd('REVEAL_PREV')}
            className="p-6 rounded-3xl bg-surface hover:bg-surface-light border border-white/10 active:scale-95 transition flex flex-col items-center justify-center space-y-2 group"
          >
            <SkipBack className="w-8 h-8 text-slate-400 group-hover:text-white transition" />
            <span className="font-display font-extrabold text-sm tracking-wider">PREVIOUS LOGO</span>
          </button>

          <button
            onClick={() => sendCmd('REVEAL_NEXT')}
            className="md:col-span-2 p-6 rounded-3xl bg-gradient-to-r from-primary to-accent hover:opacity-95 active:scale-95 transition font-display text-slate-950 font-black tracking-widest text-lg flex items-center justify-center space-x-4 shadow-[0_0_40px_rgba(56,189,248,0.4)]"
          >
            <Play className="w-8 h-8 fill-current" />
            <span>REVEAL NEXT LOGO</span>
          </button>

          <button
            onClick={() => sendCmd('TRIGGER_INDEX', { index: 4 })}
            className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:opacity-95 active:scale-95 transition font-display text-slate-950 font-black tracking-wider text-sm flex flex-col items-center justify-center space-y-1 shadow-[0_0_30px_rgba(245,158,11,0.4)]"
          >
            <Sparkles className="w-6 h-6 fill-current" />
            <span>TRIGGER IDEA BANK FINALE</span>
          </button>
        </div>

        {/* Emergency Reset Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={() => sendCmd('RESET')}
            className="px-6 py-3 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/40 text-xs font-bold tracking-wider flex items-center space-x-2 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET PRESENTATION TO START INTRO</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ProjectorDisplay } from './pages/ProjectorDisplay';
import { TabletController } from './pages/TabletController';
import { ControlPanel } from './pages/ControlPanel';
import { useWebSocket } from './services/websocket';
import { Monitor, Smartphone, Sliders, Sparkles, Shield, ChevronRight } from 'lucide-react';

const ProjectorWrapper = () => {
  const { serverState } = useWebSocket('projector');
  return <ProjectorDisplay serverState={serverState} />;
};

const TabletWrapper = () => {
  const { serverState, isConnected, sendMessage } = useWebSocket('tablet');
  return (
    <TabletController
      serverState={serverState}
      sendMessage={sendMessage}
      isConnected={isConnected}
    />
  );
};

const ControlWrapper = () => {
  const { serverState, isConnected, sendMessage } = useWebSocket('control');
  return (
    <ControlPanel
      serverState={serverState}
      sendMessage={sendMessage}
      isConnected={isConnected}
    />
  );
};

const Launchpad = () => {
  return (
    <div className="min-h-screen bg-background text-white p-6 flex flex-col items-center justify-center select-none font-sans relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />

      <div className="max-w-4xl w-full text-center z-10 space-y-8">
        <div className="flex justify-center">
          <div className="px-6 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-black tracking-[0.25em] uppercase flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>ACES INAUGURATION SYSTEM</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black font-display tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
          GESTURE-CONTROLLED CINEMATIC UNVEILING
        </h1>

        <p className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto font-medium">
          Select a role to launch the live inauguration interface for the ACES website event.
        </p>

        {/* Roles Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {/* Projector Display Card */}
          <Link
            to="/projector"
            className="p-8 rounded-3xl bg-surface hover:bg-surface-light border border-white/10 hover:border-primary/50 transition-all duration-300 flex flex-col items-center text-center space-y-4 group shadow-xl"
          >
            <div className="p-4 rounded-2xl bg-sky-500/10 text-primary group-hover:scale-110 transition duration-300">
              <Monitor className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-display text-white group-hover:text-primary transition">
                PROJECTOR
              </h2>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                Full-screen cinematic audience display for main inauguration.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-primary pt-2">
              <span>LAUNCH DISPLAY</span>
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Tablet Controller Card */}
          <Link
            to="/tablet"
            className="p-8 rounded-3xl bg-surface hover:bg-surface-light border border-white/10 hover:border-primary/50 transition-all duration-300 flex flex-col items-center text-center space-y-4 group shadow-xl"
          >
            <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition duration-300">
              <Smartphone className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-display text-white group-hover:text-indigo-400 transition">
                TABLET
              </h2>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                Camera gesture input controller with MediaPipe tracking.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-indigo-400 pt-2">
              <span>OPEN CAMERA</span>
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Operator Control Panel Card */}
          <Link
            to="/control"
            className="p-8 rounded-3xl bg-surface hover:bg-surface-light border border-white/10 hover:border-amber-400/50 transition-all duration-300 flex flex-col items-center text-center space-y-4 group shadow-xl"
          >
            <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition duration-300">
              <Sliders className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-display text-white group-hover:text-amber-400 transition">
                CONTROL
              </h2>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                Operator manual override dashboard & status monitor.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-amber-400 pt-2">
              <span>OPEN DASHBOARD</span>
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>

        {/* Footer Order Note */}
        <div className="pt-10 flex items-center justify-center space-x-2 text-xs font-bold text-slate-500 tracking-wider uppercase">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>SEQUENCE: ACES ➔ ACM ➔ TECHNICAL ➔ ART CIRCLE ➔ IDEA BANK (GRAND FINALE)</span>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Launchpad />} />
        <Route path="/projector" element={<ProjectorWrapper />} />
        <Route path="/tablet" element={<TabletWrapper />} />
        <Route path="/control" element={<ControlWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

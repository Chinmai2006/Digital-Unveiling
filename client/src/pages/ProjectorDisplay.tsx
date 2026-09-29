import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { CinematicLogo } from '../components/CinematicLogo';
import { FinaleReveal } from '../components/FinaleReveal';
import { AllLogosReveal } from '../components/AllLogosReveal';
import { LOGOS } from '../data/logos';
import { soundEngine } from '../audio/soundEngine';
import { StateUpdatePayload } from '@shared/protocol';
import { Maximize } from 'lucide-react';

interface ProjectorDisplayProps {
  serverState: StateUpdatePayload | null;
}

export const ProjectorDisplay: React.FC<ProjectorDisplayProps> = ({ serverState }) => {
  const currentIndex = serverState ? serverState.currentIndex : -1;
  const state = serverState ? serverState.state : 'INTRO';
  const currentLogo = currentIndex >= 0 && currentIndex < LOGOS.length ? LOGOS[currentIndex] : null;

  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < 4) {
      soundEngine.playTransitionSwoosh();
    } else if (currentIndex === 4 && state === 'FINALE_BUILDUP') {
      soundEngine.playFinaleBuildup();
    }
  }, [currentIndex, state]);

  // Soft shimmer when all-logos screen appears
  useEffect(() => {
    if (state === 'ALL_LOGOS') {
      soundEngine.playTransitionSwoosh();
    }
  }, [state]);

  const handleUnlockAudio = () => {
    soundEngine.unlockAudio();
    soundEngine.setMuted(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      onClick={handleUnlockAudio}
      className="relative w-screen h-screen bg-background overflow-hidden select-none font-display cursor-default"
    >
      {/* Background Particle Animation */}
      <ParticleCanvas state={state} themeColor={currentLogo?.themeColor || '#38bdf8'} />

      {/* Discrete Corner Fullscreen Quick Toggle */}
      <div className="absolute bottom-6 right-6 z-50 opacity-20 hover:opacity-100 transition duration-300">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFullscreen();
          }}
          className="p-3 rounded-full bg-surface/80 border border-white/10 text-white hover:bg-white/10"
        >
          <Maximize className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Presentation Router */}
      <AnimatePresence mode="wait">
        {/* START SCREEN INTRO (Index -1) */}
        {currentIndex === -1 && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center"
          >
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-2xl md:text-3xl font-extrabold tracking-[0.3em] text-primary uppercase"
            >
              ASSOCIATION OF COMPUTER ENGINEERING STUDENTS
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 1.2 }}
              className="mt-6 text-6xl md:text-9xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 drop-shadow-2xl"
            >
              PRESENTS
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-6 px-8 py-3 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md shadow-[0_0_30px_rgba(56,189,248,0.2)]"
            >
              <h2 className="text-xl md:text-3xl font-bold tracking-[0.2em] text-sky-200">
                A NEW CHAPTER
              </h2>
            </motion.div>

            {/* Pulsing Readiness Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ delay: 1.8, duration: 2.5, repeat: Infinity }}
              className="mt-20 flex flex-col items-center space-y-3"
            >
              <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_#38bdf8]" />
              <p className="text-sm font-semibold tracking-[0.25em] text-slate-400 uppercase">
                READY • SHOW YOUR HAND TO BEGIN
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* LOGOS 1 - 4 (ACES, ACM, Technical, Art Circle) */}
        {currentIndex >= 0 && currentIndex < 4 && currentLogo && (
          <motion.div
            key={`logo-${currentLogo.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <CinematicLogo logo={currentLogo} />
          </motion.div>
        )}

        {/* LOGO 5: IDEA BANK GRAND FINALE */}
        {currentIndex === 4 && state !== 'ALL_LOGOS' && state !== 'FINAL' && currentLogo && (
          <motion.div
            key="finale"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="w-full h-full"
          >
            <FinaleReveal logo={currentLogo} />
          </motion.div>
        )}

        {/* CLOSING: ALL 5 LOGOS TOGETHER */}
        {(state === 'ALL_LOGOS' || state === 'FINAL') && (
          <motion.div
            key="all-logos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="w-full h-full"
          >
            <AllLogosReveal />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

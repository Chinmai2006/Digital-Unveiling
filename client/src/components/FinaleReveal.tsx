import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogoConfig } from '@shared/protocol';

interface FinaleRevealProps {
  logo: LogoConfig;
}

export const FinaleReveal: React.FC<FinaleRevealProps> = ({ logo }) => {
  const [stage, setStage] = useState<'darkness' | 'spark' | 'energy' | 'pause' | 'boom'>('darkness');

  useEffect(() => {
    // Tightened Finale Sequence Timeline
    // T+300ms  → spark appears
    // T+900ms  → energy burst
    // T+1600ms → dark flash
    // T+1800ms → logo reveal
    const timer1 = setTimeout(() => setStage('spark'),  300);
    const timer2 = setTimeout(() => setStage('energy'), 900);
    const timer3 = setTimeout(() => setStage('pause'),  1600);
    const timer4 = setTimeout(() => setStage('boom'),   1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-4 text-center select-none overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        {/* Stage 1: Darkness */}
        {stage === 'darkness' && (
          <motion.div
            key="darkness"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black z-50"
          />
        )}

        {/* Stage 2 & 3: Spark and Energy Buildup */}
        {(stage === 'spark' || stage === 'energy') && (
          <motion.div
            key="buildup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center relative"
          >
            {/* Spark Core */}
            <motion.div
              animate={{
                scale: stage === 'energy' ? [1, 3, 6] : [0.2, 1, 1.1],
                opacity: stage === 'energy' ? [0.7, 1, 0.1] : [0, 0.9, 1],
              }}
              transition={{ duration: stage === 'energy' ? 0.7 : 0.6, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-100 via-amber-400 to-amber-600 shadow-[0_0_80px_rgba(251,191,36,0.9)]"
            />

            {/* Rotating Energy Rings */}
            {stage === 'energy' && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0, rotate: 0 }}
                animate={{ scale: [0.8, 3, 5], opacity: [0, 0.9, 0], rotate: 180 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="absolute w-64 h-64 border-2 border-amber-300/60 rounded-full border-dashed pointer-events-none"
              />
            )}
          </motion.div>
        )}

        {/* Stage 4: Pause (Dark Flash Frame) */}
        {stage === 'pause' && (
          <motion.div
            key="pause"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black z-50"
          />
        )}

        {/* Stage 5: GRAND FINALE REVEAL */}
        {stage === 'boom' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative flex flex-col items-center justify-center z-20"
          >
            {/* Fullscreen Radial Flash Boom Shockwave */}
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: [0, 3, 8], opacity: [1, 0.6, 0] }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-white via-amber-200 to-amber-500 blur-2xl pointer-events-none"
            />

            {/* Intense Golden Background Halo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: [0, 0.5, 0.35], scale: [0.6, 1.2, 1] }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute w-[800px] h-[800px] rounded-full bg-amber-500/30 blur-[160px] pointer-events-none"
            />

            {/* Main Holographic Finale Card */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 30, filter: 'blur(12px)' }}
              animate={{ scale: 1, opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative p-12 md:p-16 rounded-3xl bg-surface/90 border-2 border-amber-400/40 backdrop-blur-2xl shadow-[0_0_100px_rgba(245,158,11,0.4)] flex flex-col items-center"
            >
              {/* Grand Finale Badge Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-extrabold text-xs md:text-sm tracking-[0.3em] uppercase mb-8 shadow-lg"
              >
                ✦ GRAND INAUGURATION FINALE ✦
              </motion.div>

              {/* Idea Bank Logo Graphic */}
              <motion.img
                src={logo.image}
                alt={logo.name}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                className="w-72 h-72 md:w-96 md:h-96 object-contain drop-shadow-[0_10px_50px_rgba(245,158,11,0.6)]"
              />

              {/* Idea Bank Title */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="mt-8 text-6xl md:text-8xl font-black font-display tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500"
              >
                {logo.name}
              </motion.h1>


            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

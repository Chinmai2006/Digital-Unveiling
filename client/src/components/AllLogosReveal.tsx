import React from 'react';
import { motion } from 'framer-motion';
import { LOGOS } from '../data/logos';

export const AllLogosReveal: React.FC = () => {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-6 text-center select-none overflow-hidden">
      {/* Subtle multi-color background glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.18 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, #38bdf8 0%, transparent 50%), ' +
            'radial-gradient(ellipse at 80% 50%, #fbbf24 0%, transparent 50%), ' +
            'radial-gradient(ellipse at 50% 20%, #818cf8 0%, transparent 40%), ' +
            'radial-gradient(ellipse at 50% 80%, #f472b6 0%, transparent 40%)',
        }}
      />

      {/* Header label */}
      <motion.p
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="text-xs md:text-sm font-extrabold tracking-[0.35em] text-slate-400 uppercase mb-10"
      >
        ACES PRESENTS
      </motion.p>

      {/* Five logos row */}
      <div className="flex flex-row items-end justify-center gap-6 md:gap-10 w-full max-w-6xl">
        {LOGOS.map((logo, i) => (
          <motion.div
            key={logo.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 + i * 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-3 flex-1 min-w-0"
          >
            {/* Glow ring behind logo */}
            <div
              className="relative flex items-center justify-center p-3 md:p-4 rounded-2xl bg-surface/60 border border-white/10 backdrop-blur-md shadow-lg"
              style={{ boxShadow: `0 0 24px ${logo.themeColor}33` }}
            >
              <motion.div
                className="absolute inset-0 rounded-2xl opacity-20 blur-md pointer-events-none"
                style={{ backgroundColor: logo.themeColor }}
              />
              <img
                src={logo.image}
                alt={logo.name}
                className="w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain relative z-10"
              />
            </div>

            {/* Name */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 + i * 0.18 }}
              className="text-[10px] md:text-xs font-black tracking-widest uppercase text-center leading-tight"
              style={{ color: logo.themeColor }}
            >
              {logo.name}
            </motion.p>
          </motion.div>
        ))}
      </div>

      {/* Divider line */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1, delay: 1.4, ease: 'easeOut' }}
        className="mt-12 w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.6 }}
        className="mt-6 text-xs md:text-sm font-semibold tracking-[0.25em] text-slate-500 uppercase"
      >
        ASSOCIATION OF COMPUTER ENGINEERING STUDENTS
      </motion.p>
    </div>
  );
};

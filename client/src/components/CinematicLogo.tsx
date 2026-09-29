import React from 'react';
import { motion } from 'framer-motion';
import { LogoConfig } from '@shared/protocol';

interface CinematicLogoProps {
  logo: LogoConfig;
}

export const CinematicLogo: React.FC<CinematicLogoProps> = ({ logo }) => {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center select-none overflow-hidden">
      {/* Background radial glow spot */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.4, 0.25], scale: [0.5, 1.2, 1] }}
        transition={{ duration: 3, ease: 'easeOut' }}
        className="absolute w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none"
        style={{ backgroundColor: logo.themeColor }}
      />

      {/* Main Logo Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative group"
      >
        {/* Holographic Glowing Outline Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.8, scale: 1 }}
          transition={{ delay: 0.5, duration: 1.2 }}
          className="absolute -inset-6 rounded-3xl opacity-75 blur-xl transition duration-1000"
          style={{
            background: `radial-gradient(circle, ${logo.themeColor} 0%, ${logo.secondaryColor} 100%)`,
          }}
        />

        {/* Logo Glass Card */}
        <div className="relative p-12 md:p-16 rounded-3xl bg-surface/80 border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col items-center">
          {/* Light Sweep Layer */}
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '200%', opacity: [0, 0.6, 0] }}
            transition={{ delay: 1.2, duration: 1.5, ease: 'easeInOut' }}
            className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
          />

          {/* Logo Image */}
          <motion.img
            src={logo.image}
            alt={logo.name}
            initial={{ scale: 0.7, opacity: 0, filter: 'brightness(0) blur(20px)' }}
            animate={{
              scale: 1,
              opacity: 1,
              filter: 'brightness(1) blur(0px)',
            }}
            transition={{ duration: 1.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-[0_10px_35px_rgba(0,0,0,0.8)]"
          />

          {/* Logo Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="mt-8 text-5xl md:text-7xl font-black font-display tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300"
          >
            {logo.name}
          </motion.h1>


        </div>
      </motion.div>
    </div>
  );
};

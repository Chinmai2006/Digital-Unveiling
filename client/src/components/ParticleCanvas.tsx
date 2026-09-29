import React, { useEffect, useRef } from 'react';
import { PresentationState } from '@shared/protocol';

interface ParticleCanvasProps {
  state: PresentationState;
  themeColor?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
}

interface ShockwaveRing {
  radius: number;
  maxRadius: number;
  lineWidth: number;
  alpha: number;
  color: string;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ state, themeColor = '#38bdf8' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  const particlesRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<ShockwaveRing[]>([]);
  const prevStateRef = useRef<PresentationState>(state);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Helper to spawn standard ambient particle
    const createAmbientParticle = (): Particle => {
      const colors = [themeColor, '#818cf8', '#38bdf8', '#c084fc', '#ffffff'];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.3 - Math.random() * 0.5,
        size: Math.random() * 2.5 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2,
        maxAlpha: Math.random() * 0.7 + 0.3,
        life: 0,
        maxLife: Math.random() * 300 + 200,
      };
    };

    // Initialize 80 ambient particles
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 80; i++) {
        particlesRef.current.push(createAmbientParticle());
      }
    }

    // Trigger shockwave when state transitions into FINALE_BUILDUP / FINALE_REVEALED
    if (state === 'FINALE_REVEALED' && prevStateRef.current !== 'FINALE_REVEALED') {
      // Spawn Shockwaves
      shockwavesRef.current.push(
        { radius: 10, maxRadius: Math.max(width, height) * 0.9, lineWidth: 30, alpha: 1, color: '#fef08a' },
        { radius: 5, maxRadius: Math.max(width, height) * 0.7, lineWidth: 15, alpha: 0.9, color: '#fbbf24' },
        { radius: 1, maxRadius: Math.max(width, height) * 0.5, lineWidth: 8, alpha: 0.8, color: '#ffffff' }
      );

      // Spawn 150 explosive finale particles
      const centerX = width / 2;
      const centerY = height / 2;
      for (let i = 0; i < 150; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 12 + 4;
        particlesRef.current.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 4 + 2,
          color: Math.random() > 0.3 ? '#fbbf24' : '#ffffff',
          alpha: 1,
          maxAlpha: 1,
          life: 0,
          maxLife: Math.random() * 100 + 60,
        });
      }
    }
    prevStateRef.current = state;

    let buildUpTime = 0;

    const render = () => {
      ctx.fillStyle = 'rgba(7, 9, 14, 0.25)'; // Smooth trails
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Render & Update Shockwaves
      for (let i = shockwavesRef.current.length - 1; i >= 0; i--) {
        const ring = shockwavesRef.current[i];
        ring.radius += 18;
        ring.alpha = Math.max(0, 1 - ring.radius / ring.maxRadius);

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = ring.lineWidth * ring.alpha;
        ctx.shadowColor = ring.color;
        ctx.shadowBlur = 25;
        ctx.globalAlpha = ring.alpha;
        ctx.stroke();
        ctx.restore();

        if (ring.alpha <= 0 || ring.radius >= ring.maxRadius) {
          shockwavesRef.current.splice(i, 1);
        }
      }

      // Render & Update Particles
      if (state === 'FINALE_BUILDUP') {
        buildUpTime += 0.03;

        // Swirling vortex towards center
        particlesRef.current.forEach((p) => {
          const dx = centerX - p.x;
          const dy = centerY - p.y;
          const dist = Math.hypot(dx, dy) + 0.1;
          const force = (1200 / dist) * Math.min(2, buildUpTime);

          p.vx += (dx / dist) * force * 0.05 - (dy / dist) * 0.1;
          p.vy += (dy / dist) * force * 0.05 + (dx / dist) * 0.1;

          p.x += p.vx;
          p.y += p.vy;

          p.vx *= 0.95;
          p.vy *= 0.95;

          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#fef08a';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });

        // Spawn central spark buildup
        if (Math.random() < 0.6) {
          const angle = Math.random() * Math.PI * 2;
          const spawnDist = Math.random() * 300 + 100;
          particlesRef.current.push({
            x: centerX + Math.cos(angle) * spawnDist,
            y: centerY + Math.sin(angle) * spawnDist,
            vx: 0,
            vy: 0,
            size: Math.random() * 3 + 1,
            color: '#fef08a',
            alpha: 0.8,
            maxAlpha: 1,
            life: 0,
            maxLife: 100,
          });
        }
      } else {
        // Normal Ambient Movement
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life++;

          // Fade out near end of life
          if (p.life > p.maxLife * 0.8) {
            p.alpha = Math.max(0, p.maxAlpha * (1 - (p.life - p.maxLife * 0.8) / (p.maxLife * 0.2)));
          }

          ctx.save();
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Respawn ambient particles when out of bounds or expired
          if (p.y < -10 || p.x < -10 || p.x > width + 10 || p.life >= p.maxLife) {
            if (particlesRef.current.length > 80) {
              particlesRef.current.splice(i, 1);
            } else {
              particlesRef.current[i] = createAmbientParticle();
            }
          }
        }
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [state, themeColor]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};

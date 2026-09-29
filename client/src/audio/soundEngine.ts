export class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private isUnlocked: boolean = false;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;

  constructor() {}

  public unlockAudio(): boolean {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isUnlocked = !!(this.ctx && this.ctx.state === 'running');
    return this.isUnlocked;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    }
  }

  public isAudioMuted(): boolean {
    return this.isMuted;
  }

  /** Very faint room-presence hum — barely perceptible, just fills silence */
  public playAmbientHum() {
    if (this.isMuted || !this.ctx || this.ctx.state !== 'running') return;
    if (this.ambientOsc) return;

    try {
      const now = this.ctx.currentTime;
      this.ambientOsc = this.ctx.createOscillator();
      this.ambientGain = this.ctx.createGain();

      this.ambientOsc.type = 'sine';
      this.ambientOsc.frequency.setValueAtTime(60, now);

      // Very gentle fade in, stays extremely quiet
      this.ambientGain.gain.setValueAtTime(0, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.03, now + 4);

      this.ambientOsc.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);
      this.ambientOsc.start(now);
    } catch (e) {
      console.warn('[Audio] Ambient hum failed:', e);
    }
  }

  public stopAmbientHum() {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);
      setTimeout(() => {
        if (this.ambientOsc) {
          this.ambientOsc.stop();
          this.ambientOsc.disconnect();
          this.ambientOsc = null;
        }
      }, 1100);
    }
  }

  /**
   * Logo reveal shimmer — used for logos 1–4 (and Idea Bank on reveal).
   * Soft, short, high-frequency air shimmer. Polished and subtle.
   */
  public playTransitionSwoosh() {
    if (this.isMuted || !this.ctx || this.ctx.state !== 'running') return;

    try {
      const now = this.ctx.currentTime;

      const bufferSize = Math.floor(this.ctx.sampleRate * 0.9);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      // Narrow high-pass shimmer — airy, not whooshy
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3500, now);
      filter.frequency.linearRampToValueAtTime(6000, now + 0.25);
      filter.frequency.linearRampToValueAtTime(4000, now + 0.8);
      filter.Q.setValueAtTime(1.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.9);
    } catch (e) {
      console.warn('[Audio] Shimmer failed:', e);
    }
  }

  /**
   * Idea Bank buildup — same soft shimmer texture as other logos,
   * slightly longer fade to match the visual buildup. No riser, no drama.
   */
  public playFinaleBuildup() {
    if (this.isMuted || !this.ctx || this.ctx.state !== 'running') return;

    try {
      const now = this.ctx.currentTime;

      const bufferSize = Math.floor(this.ctx.sampleRate * 1.2);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(4000, now);
      filter.frequency.linearRampToValueAtTime(7000, now + 0.4);
      filter.frequency.linearRampToValueAtTime(5000, now + 1.1);
      filter.Q.setValueAtTime(1.2, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 1.2);
    } catch (e) {
      console.warn('[Audio] Finale shimmer failed:', e);
    }
  }

  /**
   * Called at the visual BOOM moment for Idea Bank.
   * Intentionally silent — the visual handles the impact.
   */
  public playCinematicBoom() {
    // No audio — visual impact stands on its own
  }
}

export const soundEngine = new SoundEngine();

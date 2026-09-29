import { PresentationState, LogoConfig, StateUpdatePayload } from '../shared/protocol.js';
import { LOGOS } from '../client/src/data/logos.js';

export class PresentationStateMachine {
  private currentIndex: number = -1; // -1 means INTRO state
  private state: PresentationState = 'INTRO';
  private logos: LogoConfig[] = LOGOS;
  private isLocked: boolean = false;
  private lockTimeout: NodeJS.Timeout | null = null;
  private autoSequenceTimers: NodeJS.Timeout[] = [];
  /** True only when server is in INTRO and no sequence is running */
  private gestureEnabled: boolean = true;

  constructor() {}

  public getStatePayload(
    connectedClients: { tablet: boolean; projector: boolean; control: boolean; total: number },
    serverIp?: string
  ): StateUpdatePayload {
    return {
      currentIndex: this.currentIndex,
      state: this.state,
      currentLogo:
        this.currentIndex >= 0 && this.currentIndex < this.logos.length
          ? this.logos[this.currentIndex]
          : null,
      totalLogos: this.logos.length,
      isLocked: this.isLocked,
      gestureEnabled: this.gestureEnabled,
      connectedClients,
      serverIp,
    };
  }

  public startAutoSequence(broadcastCallback: () => void): boolean {
    // Only allow starting when in INTRO and gesture is enabled
    if (!this.gestureEnabled || this.currentIndex !== -1) {
      console.log('[StateMachine] Sequence already running or gesture disabled. Ignoring START_REVEAL.');
      return false;
    }

    this.cancelAutoSequence();

    // Lock gesture immediately — no further palm triggers allowed until RESET
    this.gestureEnabled = false;
    this.isLocked = true;

    // Timeline Configuration (ms)
    // Each logo: reveal animation ~1s, then 15s speaking hold before next
    //
    // T=0s     ACES REVEALING
    // T=1s     ACES DISPLAYED (15s hold)
    // T=16s    ACM REVEALING
    // T=17s    ACM DISPLAYED (15s hold)
    // T=32s    Technical Club REVEALING
    // T=33s    Technical Club DISPLAYED (15s hold)
    // T=48s    Art Circle REVEALING
    // T=49s    Art Circle DISPLAYED (15s hold)
    // T=64s    Idea Bank FINALE_BUILDUP (short cinematic ~3s)
    // T=67s    Idea Bank FINALE_REVEALED (15s hold)
    // T=82s    ALL_LOGOS — stays permanently until manual RESET

    const schedule: { delay: number; index: number; state: PresentationState }[] = [
      { delay: 0,      index: 0, state: 'REVEALING' },
      { delay: 1000,   index: 0, state: 'DISPLAYED' },

      { delay: 16000,  index: 1, state: 'REVEALING' },
      { delay: 17000,  index: 1, state: 'DISPLAYED' },

      { delay: 32000,  index: 2, state: 'REVEALING' },
      { delay: 33000,  index: 2, state: 'DISPLAYED' },

      { delay: 48000,  index: 3, state: 'REVEALING' },
      { delay: 49000,  index: 3, state: 'DISPLAYED' },

      { delay: 64000,  index: 4, state: 'FINALE_BUILDUP' },
      { delay: 67000,  index: 4, state: 'FINALE_REVEALED' },
      { delay: 82000,  index: 4, state: 'ALL_LOGOS' },
      // FINAL is only set via manual RESET or explicit control panel action
      // The ALL_LOGOS screen holds indefinitely as the closing state
    ];

    schedule.forEach(({ delay, index, state }) => {
      const timer = setTimeout(() => {
        this.currentIndex = index;
        this.state = state;
        if (state === 'ALL_LOGOS') {
          // Sequence complete — group screen holds indefinitely
          this.isLocked = false;
        }
        broadcastCallback();
      }, delay);
      this.autoSequenceTimers.push(timer);
    });

    // Broadcast immediately so clients see the locked state right away
    broadcastCallback();
    return true;
  }

  public revealNext(): boolean {
    // Manual control — cancel auto sequence and step forward
    if (this.currentIndex === -1) {
      return false; // websocket handler will call startAutoSequence
    }

    this.cancelAutoSequence();
    if (this.currentIndex >= 0 && this.currentIndex < 3) {
      this.currentIndex++;
      this.state = 'REVEALING';
      this.lockForDuration(3500, 'DISPLAYED');
      return true;
    }

    if (this.currentIndex === 3) {
      this.currentIndex = 4;
      this.state = 'FINALE_BUILDUP';
      this.lockForDuration(3000, 'FINALE_REVEALED');
      return true;
    }

    return false;
  }

  public revealPrev(): boolean {
    this.cancelAutoSequence();
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.state = 'DISPLAYED';
      this.isLocked = false;
      return true;
    } else if (this.currentIndex === 0) {
      this.currentIndex = -1;
      this.state = 'INTRO';
      this.isLocked = false;
      return true;
    }
    return false;
  }

  public triggerIndex(idx: number): boolean {
    this.cancelAutoSequence();
    if (idx >= 0 && idx < this.logos.length) {
      this.currentIndex = idx;
      if (idx === 4) {
        this.state = 'FINALE_BUILDUP';
        this.lockForDuration(3000, 'FINALE_REVEALED');
      } else {
        this.state = 'REVEALING';
        this.lockForDuration(3500, 'DISPLAYED');
      }
      return true;
    }
    return false;
  }

  public reset(): void {
    this.cancelAutoSequence();
    if (this.lockTimeout) clearTimeout(this.lockTimeout);
    this.isLocked = false;
    this.gestureEnabled = true; // Re-enable gesture detection only on explicit RESET
    this.currentIndex = -1;
    this.state = 'INTRO';
  }

  private cancelAutoSequence(): void {
    this.autoSequenceTimers.forEach((timer) => clearTimeout(timer));
    this.autoSequenceTimers = [];
  }

  private lockForDuration(ms: number, targetState: PresentationState) {
    this.isLocked = true;
    if (this.lockTimeout) clearTimeout(this.lockTimeout);
    this.lockTimeout = setTimeout(() => {
      this.state = targetState;
      this.isLocked = false;
    }, ms);
  }
}

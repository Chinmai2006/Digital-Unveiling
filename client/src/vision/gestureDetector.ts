export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface GestureResult {
  gesture: 'OPEN_PALM' | 'UNKNOWN';
  confidence: number;
  handDetected: boolean;
  isConfirmed: boolean;
  progress: number; // 0 to 1 progress bar towards trigger
}

export class GestureDetector {
  private holdStartTime: number | null = null;
  private lastTriggerTime: number = 0;
  private readonly requiredHoldDurationMs: number = 400; // 400ms temporal stability
  private readonly cooldownMs: number = 1500; // 1.5s cooldown lockout

  constructor(requiredHoldMs = 400, cooldownMs = 1500) {
    this.requiredHoldDurationMs = requiredHoldMs;
    this.cooldownMs = cooldownMs;
  }

  public processLandmarks(landmarks: Landmark[] | null): GestureResult {
    const now = Date.now();

    if (!landmarks || landmarks.length < 21) {
      this.holdStartTime = null;
      return {
        gesture: 'UNKNOWN',
        confidence: 0,
        handDetected: false,
        isConfirmed: false,
        progress: 0,
      };
    }

    const isPalmOpen = this.checkOpenPalm(landmarks);
    const confidence = isPalmOpen ? 0.95 : 0.2;

    // Check cooldown
    if (now - this.lastTriggerTime < this.cooldownMs) {
      this.holdStartTime = null;
      return {
        gesture: isPalmOpen ? 'OPEN_PALM' : 'UNKNOWN',
        confidence,
        handDetected: true,
        isConfirmed: false,
        progress: 0,
      };
    }

    if (isPalmOpen) {
      if (this.holdStartTime === null) {
        this.holdStartTime = now;
      }

      const elapsed = now - this.holdStartTime;
      const progress = Math.min(1, elapsed / this.requiredHoldDurationMs);
      const isConfirmed = elapsed >= this.requiredHoldDurationMs;

      if (isConfirmed) {
        this.lastTriggerTime = now;
        this.holdStartTime = null; // Reset hold for next trigger after cooldown
        return {
          gesture: 'OPEN_PALM',
          confidence,
          handDetected: true,
          isConfirmed: true,
          progress: 1,
        };
      }

      return {
        gesture: 'OPEN_PALM',
        confidence,
        handDetected: true,
        isConfirmed: false,
        progress,
      };
    } else {
      this.holdStartTime = null;
      return {
        gesture: 'UNKNOWN',
        confidence,
        handDetected: true,
        isConfirmed: false,
        progress: 0,
      };
    }
  }

  private checkOpenPalm(landmarks: Landmark[]): boolean {
    // 21 Landmark points:
    // 0: Wrist
    // 4: Thumb Tip, 3: Thumb IP, 2: Thumb MCP
    // 8: Index Tip, 6: Index PIP, 5: Index MCP
    // 12: Middle Tip, 10: Middle PIP, 9: Middle MCP
    // 16: Ring Tip, 14: Ring PIP, 13: Ring MCP
    // 20: Pinky Tip, 18: Pinky PIP, 17: Pinky MCP

    const wrist = landmarks[0];

    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    const indexMcp = landmarks[5];
    const middleMcp = landmarks[9];
    const ringMcp = landmarks[13];
    const pinkyMcp = landmarks[17];

    const indexPip = landmarks[6];
    const middlePip = landmarks[10];
    const ringPip = landmarks[14];
    const pinkyPip = landmarks[18];

    // Distance helper
    const dist = (p1: Landmark, p2: Landmark) =>
      Math.hypot(p1.x - p2.x, p1.y - p2.y);

    // 1. Check if finger tips are further from wrist than their MCP joints (extended fingers)
    const indexExtended = dist(indexTip, wrist) > dist(indexPip, wrist) * 1.15;
    const middleExtended = dist(middleTip, wrist) > dist(middlePip, wrist) * 1.15;
    const ringExtended = dist(ringTip, wrist) > dist(ringPip, wrist) * 1.15;
    const pinkyExtended = dist(pinkyTip, wrist) > dist(pinkyPip, wrist) * 1.15;

    // 2. Check if finger tips are spread out / above MCP
    const fingersUp =
      indexTip.y < indexMcp.y &&
      middleTip.y < middleMcp.y &&
      ringTip.y < ringMcp.y &&
      pinkyTip.y < pinkyMcp.y;

    // 3. Thumb check: thumb tip away from index MCP
    const thumbExtended = dist(thumbTip, indexMcp) > dist(landmarks[2], indexMcp);

    // Require at least 4 out of 5 fingers extended and fingers pointing upwards
    const extendedCount =
      (indexExtended ? 1 : 0) +
      (middleExtended ? 1 : 0) +
      (ringExtended ? 1 : 0) +
      (pinkyExtended ? 1 : 0) +
      (thumbExtended ? 1 : 0);

    return extendedCount >= 4 && (fingersUp || (indexExtended && middleExtended && ringExtended));
  }

  public resetCooldown() {
    this.lastTriggerTime = 0;
    this.holdStartTime = null;
  }
}

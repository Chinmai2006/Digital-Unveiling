import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { Landmark } from './gestureDetector';

export class HandTracker {
  private handLandmarker: HandLandmarker | null = null;
  private isInitializing = false;
  private isReady = false;

  public async initialize(): Promise<boolean> {
    if (this.isReady) return true;
    if (this.isInitializing) return false;

    this.isInitializing = true;

    try {
      // Load MediaPipe vision tasks bundle from jsDelivr CDN or static Wasm
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
      );

      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.isReady = true;
      this.isInitializing = false;
      console.log('[MediaPipe] HandLandmarker initialized successfully.');
      return true;
    } catch (err) {
      console.warn('[MediaPipe] GPU initialization failed, falling back to CPU delegate:', err);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
        );
        this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
        });
        this.isReady = true;
        this.isInitializing = false;
        return true;
      } catch (cpuErr) {
        console.error('[MediaPipe] HandLandmarker failed to load:', cpuErr);
        this.isInitializing = false;
        return false;
      }
    }
  }

  public detectFrame(video: HTMLVideoElement, timestampMs: number): Landmark[] | null {
    if (!this.isReady || !this.handLandmarker || video.readyState < 2) {
      return null;
    }

    try {
      const results = this.handLandmarker.detectForVideo(video, timestampMs);
      if (results && results.landmarks && results.landmarks.length > 0) {
        return results.landmarks[0] as Landmark[];
      }
    } catch (err) {
      console.error('[MediaPipe] Error detecting video frame:', err);
    }
    return null;
  }

  public drawLandmarks(
    ctx: CanvasRenderingContext2D,
    landmarks: Landmark[],
    width: number,
    height: number,
    isConfirmed: boolean = false
  ) {
    if (!landmarks || landmarks.length < 21) return;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Hand Skeleton Connections
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [5, 9], [9, 10], [10, 11], [11, 12], // Middle
      [9, 13], [13, 14], [14, 15], [15, 16], // Ring
      [13, 17], [17, 18], [18, 19], [19, 20], [0, 17] // Pinky & Palm
    ];

    const strokeColor = isConfirmed ? '#22c55e' : '#38bdf8';
    const pointColor = isConfirmed ? '#4ade80' : '#818cf8';

    // Draw connection lines
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.shadowColor = strokeColor;
    ctx.shadowBlur = 10;

    for (const [i, j] of connections) {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      ctx.beginPath();
      ctx.moveTo(p1.x * width, p1.y * height);
      ctx.lineTo(p2.x * width, p2.y * height);
      ctx.stroke();
    }

    // Draw Joint Nodes
    landmarks.forEach((p, idx) => {
      ctx.fillStyle = idx === 8 || idx === 12 || idx === 16 || idx === 20 || idx === 4 ? '#ffffff' : pointColor;
      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, idx === 0 ? 8 : 5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  public getStatus() {
    return {
      isReady: this.isReady,
      isInitializing: this.isInitializing,
    };
  }
}

import React, { useEffect, useRef, useState } from 'react';
import { Camera, AlertTriangle, RefreshCw } from 'lucide-react';

interface CameraViewProps {
  onVideoFrame: (video: HTMLVideoElement, timestampMs: number) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const CameraView: React.FC<CameraViewProps> = ({ onVideoFrame, canvasRef }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const startCamera = async () => {
    setError(null);
    setIsStreaming(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access API (getUserMedia) not supported or not in Secure Context (HTTPS).');
      }

      let stream: MediaStream | null = null;

      // Try user facing camera first, fallback to default video
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
      } catch (e) {
        console.warn('[Camera] Ideal constraints failed, falling back to basic video constraint:', e);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('autoplay', 'true');
        videoRef.current.setAttribute('muted', 'true');

        try {
          await videoRef.current.play();
        } catch (playError) {
          console.warn('[Camera] Play promise error:', playError);
        }

        setIsStreaming(true);
        setError(null);
      }
    } catch (err: any) {
      console.error('[Camera] Access error:', err);
      setError(
        err.name === 'NotAllowedError'
          ? 'CAMERA ACCESS DENIED. Please tap "Allow" when browser asks for camera permission.'
          : err.name === 'NotFoundError'
          ? 'NO CAMERA FOUND on this device.'
          : `CAMERA ERROR: ${err.message || err.name || 'Unable to access camera.'}`
      );
    }
  };

  useEffect(() => {
    let animId: number | null = null;

    startCamera();

    const processFrame = (timestampMs: number) => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        if (
          canvasRef.current &&
          (canvasRef.current.width !== window.innerWidth ||
            canvasRef.current.height !== window.innerHeight)
        ) {
          canvasRef.current.width = window.innerWidth;
          canvasRef.current.height = window.innerHeight;
        }
        onVideoFrame(videoRef.current, timestampMs);
      }
      animId = requestAnimationFrame(processFrame);
    };

    animId = requestAnimationFrame(processFrame);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onVideoFrame, canvasRef]);

  return (
    <div className="fixed inset-0 w-full h-full bg-black overflow-hidden select-none">
      {/* Fullscreen Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover transform -scale-x-100"
      />

      {/* Fullscreen Canvas Overlay for Skeleton */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none transform -scale-x-100 z-10"
      />

      {/* Camera Starting Overlay */}
      {!isStreaming && !error && (
        <div
          onClick={startCamera}
          className="absolute inset-0 flex flex-col items-center justify-center bg-surface/95 backdrop-blur-xl text-slate-200 z-20 cursor-pointer p-6 text-center"
        >
          <Camera className="w-16 h-16 text-primary animate-pulse mb-4" />
          <p className="text-base font-bold tracking-wider">STARTING CAMERA FEED...</p>
          <p className="text-xs text-slate-400 mt-2">Tap here if camera preview does not load automatically</p>
        </div>
      )}

      {/* Camera Error Banner with Retry Button */}
      {error && (
        <div className="absolute inset-0 p-6 flex flex-col items-center justify-center bg-red-950/95 text-center backdrop-blur-xl z-20 text-white">
          <AlertTriangle className="w-16 h-16 text-red-400 mb-4 animate-bounce" />
          <h3 className="text-xl font-black font-display text-red-200">CAMERA NOT STARTED</h3>
          <p className="mt-3 text-sm text-red-300 max-w-md font-medium leading-relaxed">{error}</p>
          <button
            onClick={startCamera}
            className="mt-6 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm flex items-center space-x-2 shadow-lg active:scale-95 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>RETRY CAMERA ACCESS</span>
          </button>
        </div>
      )}
    </div>
  );
};

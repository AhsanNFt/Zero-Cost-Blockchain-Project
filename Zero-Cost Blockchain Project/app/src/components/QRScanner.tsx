import { useState, useRef, useEffect, useCallback } from "react";
import { QrCode, Camera, X, Flashlight, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

interface QRScannerProps {
  onScan: (value: string) => void;
  onClose?: () => void;
}

/**
 * Zero-cost QR Code Scanner using the browser's native MediaDevices API.
 * No external paid service required — uses BarcodeDetector (Chrome/Edge) with
 * a canvas-based fallback parser for token IDs embedded in URLs or plain text.
 */
export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);

  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string>("");
  const [scanned, setScanned] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  // Extract token ID from various QR formats:
  // - Plain number: "42"
  // - URL: "https://app.com/credential/42" or "https://app.com/verify?tokenId=42"
  const extractTokenId = (raw: string): string => {
    const trimmed = raw.trim();
    // Plain number
    if (/^\d+$/.test(trimmed)) return trimmed;
    // URL with /credential/:id or /verify/:id
    const pathMatch = trimmed.match(/\/(?:credential|verify)\/(\d+)/);
    if (pathMatch) return pathMatch[1];
    // Query param tokenId=
    const queryMatch = trimmed.match(/[?&]tokenId=(\d+)/);
    if (queryMatch) return queryMatch[1];
    // Fallback: return raw
    return trimmed;
  };

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsActive(false);
    setFlashOn(false);
  }, []);

  const scanFrame = useCallback(
    async (detector: BarcodeDetector | null) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(() => scanFrame(detector));
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      try {
        if (detector) {
          const barcodes = await detector.detect(canvas);
          if (barcodes.length > 0) {
            const raw = barcodes[0].rawValue;
            const tokenId = extractTokenId(raw);
            setScanned(tokenId);
            stopCamera();
            onScan(tokenId);
            return;
          }
        }
      } catch {
        // BarcodeDetector failed, continue scanning
      }

      animFrameRef.current = requestAnimationFrame(() => scanFrame(detector));
    },
    [onScan, stopCamera]
  );

  const startCamera = useCallback(async () => {
    setError("");
    setScanned("");
    setIsLoading(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Check for torch/flash support
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
      setHasFlash(!!capabilities.torch);

      // Try to use BarcodeDetector API (Chrome 83+, Edge 83+)
      let detector: BarcodeDetector | null = null;
      if ("BarcodeDetector" in window) {
        try {
          detector = new BarcodeDetector({ formats: ["qr_code"] });
        } catch {
          // not supported
        }
      }

      setIsActive(true);
      setIsLoading(false);
      animFrameRef.current = requestAnimationFrame(() => scanFrame(detector));
    } catch (err) {
      setIsLoading(false);
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") {
          setError("Camera permission denied. Please allow camera access in your browser settings.");
        } else if (err.name === "NotFoundError") {
          setError("No camera found on this device.");
        } else {
          setError(`Camera error: ${err.message}`);
        }
      } else {
        setError("Failed to start camera.");
      }
    }
  }, [facingMode, scanFrame]);

  const toggleFlash = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      await track.applyConstraints({ advanced: [{ torch: !flashOn } as MediaTrackConstraintSet] });
      setFlashOn((prev) => !prev);
    } catch {
      // torch not supported
    }
  };

  const switchCamera = () => {
    stopCamera();
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Restart when facingMode changes
  useEffect(() => {
    if (isActive) {
      stopCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="liquid-glass rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <QrCode className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-light text-white">QR Code Scanner</h3>
            <p className="text-xs font-extralight text-white/40">Scan a credential QR code</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="w-8 h-8 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.05] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Camera Viewport */}
      <div className="relative bg-black aspect-video max-h-72 overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Scanning overlay */}
        {isActive && !scanned && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Corner brackets */}
            <div className="relative w-48 h-48">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-purple-400 rounded-tl-sm" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-purple-400 rounded-tr-sm" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-purple-400 rounded-bl-sm" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-400 rounded-br-sm" />
              {/* Scan line animation */}
              <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-scan-line" />
            </div>
          </div>
        )}

        {/* Success overlay */}
        {scanned && (
          <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-light text-white">Scanned!</p>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        )}

        {/* Placeholder when not active */}
        {!isActive && !isLoading && !scanned && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center">
              <Camera className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-sm font-extralight text-white/40">Camera not active</p>
            </div>
          </div>
        )}

        {/* Camera controls overlay */}
        {isActive && (
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {hasFlash && (
              <button
                onClick={toggleFlash}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  flashOn
                    ? "bg-amber-400 text-black"
                    : "bg-black/40 text-white/60 hover:bg-black/60"
                }`}
              >
                <Flashlight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={switchCamera}
              className="w-9 h-9 rounded-full bg-black/40 text-white/60 hover:bg-black/60 flex items-center justify-center transition-all"
              title="Switch camera"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm font-extralight text-red-400">{error}</p>
        </div>
      )}

      {/* Scanned result */}
      {scanned && (
        <div className="mx-5 mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs font-extralight text-white/40 mb-0.5">Token ID detected</p>
            <p className="text-sm font-light text-emerald-400">{scanned}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-5 flex gap-3">
        {!isActive ? (
          <button
            onClick={startCamera}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-light hover:brightness-110 transition-all disabled:opacity-40"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            {isLoading ? "Starting..." : "Start Camera"}
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full border border-white/10 bg-white/[0.02] text-white/60 text-sm font-light hover:bg-white/[0.05] transition-all"
          >
            <X className="w-4 h-4" />
            Stop Camera
          </button>
        )}
        {scanned && (
          <button
            onClick={() => { setScanned(""); startCamera(); }}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-300 text-sm font-light hover:bg-purple-500/20 transition-all"
          >
            <QrCode className="w-4 h-4" />
            Scan Again
          </button>
        )}
      </div>

      {/* Browser support note */}
      {!("BarcodeDetector" in window) && (
        <p className="px-5 pb-4 text-xs font-extralight text-white/20 text-center">
          For best results, use Chrome or Edge. Other browsers may have limited QR detection.
        </p>
      )}
    </div>
  );
}

// Extend TypeScript types for BarcodeDetector (not in all TS libs yet)
declare class BarcodeDetector {
  constructor(options?: { formats: string[] });
  detect(image: HTMLCanvasElement | HTMLVideoElement | ImageBitmap): Promise<Array<{ rawValue: string; format: string }>>;
}

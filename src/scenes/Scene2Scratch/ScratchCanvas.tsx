import React, { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useAudio } from '../../audio/useAudio';

interface ScratchCanvasProps {
  width?: number;
  height?: number;
  onCompleted: () => void;
  isCompleted: boolean;
  children: React.ReactNode;
}

export const ScratchCanvas: React.FC<ScratchCanvasProps> = ({
  onCompleted,
  isCompleted,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const audio = useAudio();
  const [scratchProgress, setScratchProgress] = useState(0);

  // Initialize and paint metallic gold scratch layer
  const paintScratchOverlay = useCallback((canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const w = canvas.width;
    const h = canvas.height;

    // Reset composite operation to normal draw
    ctx.globalCompositeOperation = 'source-over';

    // Rich metallic gold gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#c29d5b');
    grad.addColorStop(0.3, '#f0dbaf');
    grad.addColorStop(0.5, '#d9b779');
    grad.addColorStop(0.7, '#f3bd70');
    grad.addColorStop(1, '#a88342');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle brushed metallic texture lines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1.5);
    }

    // Sparkle flecks on gold foil
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 45; i++) {
      const rx = (Math.sin(i * 99) * 0.5 + 0.5) * w;
      const ry = (Math.cos(i * 77) * 0.5 + 0.5) * h;
      ctx.beginPath();
      ctx.arc(rx, ry, (i % 3) + 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center foil seal engraving text
    ctx.save();
    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(40, 25, 50, 0.65)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '3px';
    ctx.fillText('✦ SCRATCH TO UNCOVER ✦', w / 2, h / 2);
    ctx.restore();
  }, []);

  // Calculate percentage of erased pixels (throttled to offscreen buffer)
  const checkScratchPercentage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isCompleted) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Sample downscaled grid (30x20 points) for 60fps performance without reading millions of pixels
    const sampleCols = 30;
    const sampleRows = 20;
    const stepX = canvas.width / sampleCols;
    const stepY = canvas.height / sampleRows;
    let transparentCount = 0;

    // Use a small stride to sample
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const totalSamples = sampleCols * sampleRows;

    for (let r = 0; r < sampleRows; r++) {
      for (let c = 0; c < sampleCols; c++) {
        const x = Math.floor(c * stepX);
        const y = Math.floor(r * stepY);
        const alphaIndex = (y * canvas.width + x) * 4 + 3;
        if (data[alphaIndex] < 128) {
          transparentCount++;
        }
      }
    }

    const percentage = Math.round((transparentCount / totalSamples) * 100);
    setScratchProgress(percentage);

    // Auto-dissolve when threshold reached (50%)
    if (percentage >= 50 && !isCompleted) {
      triggerFoilDissolve();
    }
  }, [isCompleted]);

  // Smoothly dissolve the rest of the canvas with GSAP
  const triggerFoilDissolve = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    audio.playCardReveal();
    gsap.to(canvas, {
      opacity: 0,
      scale: 1.04,
      duration: 0.9,
      ease: 'power2.out',
      onComplete: () => {
        onCompleted();
      },
    });
  }, [audio, onCompleted]);

  // Erase stroke between points
  const eraseStroke = useCallback((x0: number, y0: number, x1: number, y1: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    const radius = 28; // Brush radius
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const step = Math.max(1, radius * 0.4);

    for (let i = 0; i < dist; i += step) {
      const t = i / dist;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(x1, y1, radius, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  // Initialize Canvas
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    ctx.scale(dpr, dpr);
    paintScratchOverlay(canvas, ctx);
  }, [paintScratchOverlay]);

  // Pointer Events Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isCompleted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    isDrawingRef.current = true;
    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const x = (e.clientX - rect.left) * dpr;
    const y = (e.clientY - rect.top) * dpr;

    lastPointRef.current = { x, y };
    eraseStroke(x, y, x, y);
    audio.playScratchChime();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || isCompleted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const currentX = (e.clientX - rect.left) * dpr;
    const currentY = (e.clientY - rect.top) * dpr;

    if (lastPointRef.current) {
      eraseStroke(
        lastPointRef.current.x,
        lastPointRef.current.y,
        currentX,
        currentY
      );
    }

    lastPointRef.current = { x: currentX, y: currentY };

    // Play sparkle sound occasionally during scratching
    if (Math.random() < 0.15) {
      audio.playScratchChime();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    checkScratchPercentage();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* Scratchable Card Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-black/80 border-2 border-gold-400/40 bg-plum-900"
      >
        {/* Underlying Revealed Card Content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-between select-none">
          {children}
        </div>

        {/* Scratch Canvas Overlay */}
        {!isCompleted && (
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="absolute inset-0 w-full h-full touch-none cursor-pointer select-none"
            style={{ zIndex: 20 }}
          />
        )}
      </div>

      {/* Progress & Quick Reveal Controls */}
      {!isCompleted && (
        <div className="w-full flex items-center justify-between px-2 mt-4 text-xs tracking-wider">
          <div className="flex items-center gap-2 text-gold-400/80">
            <span>Uncovered: {scratchProgress}%</span>
            <div className="w-20 h-1.5 rounded-full bg-plum-800 overflow-hidden">
              <div
                className="h-full bg-gold-400 transition-all duration-300"
                style={{ width: `${Math.min(100, scratchProgress * 2)}%` }}
              />
            </div>
          </div>

          <button
            onClick={triggerFoilDissolve}
            className="px-3.5 py-1.5 rounded-full bg-plum-900/60 hover:bg-gold-400/20 text-gold-300 border border-gold-400/30 uppercase tracking-widest text-[11px] transition-colors focus:outline-none focus:ring-1 focus:ring-gold-400"
          >
            Reveal Instantly
          </button>
        </div>
      )}
    </div>
  );
};

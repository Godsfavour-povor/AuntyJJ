import React, { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useAudio } from '../../audio/useAudio';

interface ScratchCardProps {
  onCompleted: () => void;
  isCompleted: boolean;
  children: React.ReactNode;
  containerClassName?: string;
  showControls?: boolean;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({
  onCompleted,
  isCompleted,
  children,
  containerClassName,
  showControls = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const audio = useAudio();
  const [scratchProgress, setScratchProgress] = useState(0);

  // Paint festive pastel confetti scratch overlay
  const paintOverlay = useCallback((canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const w = canvas.width;
    const h = canvas.height;

    ctx.globalCompositeOperation = 'source-over';

    // Cheerful pastel gradient (coral to butter yellow)
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#FB7185');
    grad.addColorStop(0.5, '#FDBA74');
    grad.addColorStop(1, '#FDE047');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Decorative polka dot confetti on top
    const colors = ['#38BDF8', '#2DD4BF', '#C084FC', '#FFFFFF'];
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = colors[i % colors.length];
      const rx = (Math.sin(i * 123) * 0.5 + 0.5) * w;
      const ry = (Math.cos(i * 321) * 0.5 + 0.5) * h;
      ctx.beginPath();
      ctx.arc(rx, ry, (i % 4) + 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center Stamp Callout
    ctx.save();
    const badgeW = Math.min(w * 0.85, 360);
    const badgeH = 54;
    const badgeX = (w - badgeW) / 2;
    const badgeY = (h - badgeH) / 2;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = '#1E1B4B';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    if (typeof (ctx as unknown as { roundRect?: (...args: number[]) => void }).roundRect === 'function') {
      (ctx as unknown as { roundRect: (...args: number[]) => void }).roundRect(badgeX, badgeY, badgeW, badgeH, 27);
    } else {
      ctx.rect(badgeX, badgeY, badgeW, badgeH);
    }
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 16px "Fredoka", sans-serif';
    ctx.fillStyle = '#1E1B4B';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ SCRATCH WITH TOUCH TO REVEAL ✨', w / 2, h / 2);
    ctx.restore();
  }, []);

  const triggerDissolve = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    audio.playCardReveal();
    gsap.to(canvas, {
      opacity: 0,
      scale: 1.05,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => {
        onCompleted();
      },
    });
  }, [audio, onCompleted]);

  // Periodic erased percentage check on downscaled grid
  const checkScratchPercentage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || isCompleted) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sampleCols = 25;
    const sampleRows = 18;
    const stepX = canvas.width / sampleCols;
    const stepY = canvas.height / sampleRows;
    let transparentCount = 0;

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

    if (percentage >= 48 && !isCompleted) {
      triggerDissolve();
    }
  }, [isCompleted, triggerDissolve]);

  // Stroke erasure interpolation
  const eraseStroke = useCallback((x0: number, y0: number, x1: number, y1: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    const radius = 30; // Brush radius
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

  // Initialize Canvas & keep size in sync with container
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || isCompleted) return;

    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.scale(dpr, dpr);
        paintOverlay(canvas, ctx);
      }
    };

    updateCanvasSize();

    const ro = new ResizeObserver(() => {
      if (!isCompleted) {
        updateCanvasSize();
      }
    });
    ro.observe(container);

    return () => ro.disconnect();
  }, [paintOverlay, isCompleted]);

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

    if (Math.random() < 0.2) {
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
    <div className="flex flex-col items-center w-full mx-auto select-none">
      <div
        ref={containerRef}
        className={
          containerClassName ||
          "relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-[6px_6px_0px_#1E1B4B] border-[3px] border-deep-ink bg-white"
        }
      >
        {/* Revealed Secret Card Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </div>

        {/* Scratch Canvas Foil covering 100% of modal */}
        {!isCompleted && (
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="absolute inset-0 w-full h-full touch-none cursor-pointer rounded-[inherit]"
            style={{ zIndex: 20 }}
          />
        )}
      </div>

      {/* Progress & Quick Reveal Controls (Optional) */}
      {showControls && !isCompleted && (
        <div className="w-full max-w-md flex items-center justify-between px-2 mt-3 text-xs">
          <div className="flex items-center gap-2 font-display font-semibold text-deep-ink">
            <span>Uncovered: {scratchProgress}%</span>
            <div className="w-24 h-2 rounded-full bg-white border border-deep-ink overflow-hidden">
              <div
                className="h-full bg-coral transition-all duration-300"
                style={{ width: `${Math.min(100, scratchProgress * 2.1)}%` }}
              />
            </div>
          </div>

          <button
            onClick={triggerDissolve}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-yellow text-deep-ink border-2 border-deep-ink font-display font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_#1E1B4B] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            Reveal Instantly ✨
          </button>
        </div>
      )}
    </div>
  );
};

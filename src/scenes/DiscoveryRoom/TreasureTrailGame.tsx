import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Award, Image, Bookmark, Sparkles, Crown, Check, ArrowRight } from 'lucide-react';
import { useAdventure } from '../../context/AdventureContext';
import { useAudio } from '../../audio/useAudio';
import { BIRTHDAY_DATA } from '../../config/birthdayData';
import { PipCharacter } from '../../components/Character/PipCharacter';
import { ScratchCard } from './ScratchCard';

interface Station {
  id: string;
  name: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  type: 'trophy' | 'polaroid' | 'origami' | 'scratch';
  color: string;
  icon: React.ReactNode;
}

export const TreasureTrailGame: React.FC = () => {
  const {
    scratchCompleted,
    completeScratch,
    exploredMemoryIds,
    openMemoryModal,
    characterMood,
    setCharacterMood,
    goToScene,
  } = useAdventure();

  const audio = useAudio();

  // Pip position in percentages (starts at trail entrance)
  const [pipPos, setPipPos] = useState<{ x: number; y: number }>({ x: 50, y: 88 });
  const [targetPos, setTargetPos] = useState<{ x: number; y: number } | null>(null);
  const [targetStation, setTargetStation] = useState<Station | null>(null);
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [isWalking, setIsWalking] = useState<boolean>(false);
  const [tapRipple, setTapRipple] = useState<{ x: number; y: number; id: number } | null>(null);
  const [scratchModalOpen, setScratchModalOpen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastStepTimeRef = useRef<number>(0);

  // 4 Treasure Trail stations on the map
  const stations: Station[] = [
    {
      id: 'mem-trophy',
      name: 'Sisterhood Trophy',
      x: 20,
      y: 65,
      type: 'trophy',
      color: '#FDE047',
      icon: <Award className="w-5 h-5 text-deep-ink" />,
    },
    {
      id: 'mem-polaroid',
      name: 'Laughter Polaroid',
      x: 80,
      y: 65,
      type: 'polaroid',
      color: '#FB7185',
      icon: <Image className="w-5 h-5 text-white" />,
    },
    {
      id: 'mem-origami',
      name: 'Sibling Compass',
      x: 22,
      y: 35,
      type: 'origami',
      color: '#2DD4BF',
      icon: <Bookmark className="w-5 h-5 text-deep-ink" />,
    },
    {
      id: 'station-scratch',
      name: 'Royal Secret Decree',
      x: 78,
      y: 35,
      type: 'scratch',
      color: '#C084FC',
      icon: <Crown className="w-5 h-5 text-white" />,
    },
  ];

  // Check if all keepsakes have been collected
  const allMemoriesExplored = BIRTHDAY_DATA.memories.every((m) => exploredMemoryIds.includes(m.id));
  const isTrailComplete = allMemoriesExplored && scratchCompleted;

  // Count uncovered keepsakes
  const exploredCount = exploredMemoryIds.length + (scratchCompleted ? 1 : 0);
  const totalCount = BIRTHDAY_DATA.memories.length + 1;

  // Station trigger handler
  const handleArriveAtStation = useCallback((station: Station) => {
    audio.playCollect();
    setCharacterMood('celebrating');

    if (station.type === 'scratch') {
      setScratchModalOpen(true);
    } else {
      const memory = BIRTHDAY_DATA.memories.find((m) => m.id === station.id);
      if (memory) {
        openMemoryModal(memory);
      }
    }
  }, [audio, setCharacterMood, openMemoryModal]);

  // Game Loop: smoothly walk Pip towards targetPos
  useEffect(() => {
    if (!targetPos) return;

    setIsWalking(true);
    let currentX = pipPos.x;
    let currentY = pipPos.y;

    const moveLoop = (timestamp: number) => {
      const dx = targetPos.x - currentX;
      const dy = targetPos.y - currentY;
      const distance = Math.hypot(dx, dy);

      // Facing orientation
      if (Math.abs(dx) > 0.5) {
        setFacing(dx < 0 ? 'left' : 'right');
      }

      // Step audio every 190ms while walking
      if (timestamp - lastStepTimeRef.current > 190) {
        audio.playFootstep();
        lastStepTimeRef.current = timestamp;
      }

      if (distance < 2.0) {
        // Reached destination!
        currentX = targetPos.x;
        currentY = targetPos.y;
        setPipPos({ x: currentX, y: currentY });
        setIsWalking(false);
        setTargetPos(null);
        audio.playPop();

        if (targetStation) {
          handleArriveAtStation(targetStation);
          setTargetStation(null);
        }
        return;
      }

      // Move with consistent smooth speed (~30% per second)
      const speed = 0.85;
      currentX += (dx / distance) * speed;
      currentY += (dy / distance) * speed;
      setPipPos({ x: currentX, y: currentY });

      animFrameRef.current = requestAnimationFrame(moveLoop);
    };

    animFrameRef.current = requestAnimationFrame(moveLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [targetPos, targetStation, handleArriveAtStation, audio, pipPos.x, pipPos.y]);

  // Handle click on map ground
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Constrain to walkable bounds
    const boundedX = Math.max(10, Math.min(90, clickX));
    const boundedY = Math.max(15, Math.min(90, clickY));

    // Show ripple
    setTapRipple({ x: boundedX, y: boundedY, id: Date.now() });
    setTargetStation(null);
    setTargetPos({ x: boundedX, y: boundedY });
  };

  // Direct station tap command
  const handleStationClick = (station: Station, e: React.MouseEvent) => {
    e.stopPropagation();
    setTargetStation(station);
    setTargetPos({ x: station.x, y: station.y });
    setTapRipple({ x: station.x, y: station.y, id: Date.now() });
  };

  // Grand Rainbow Portal Click
  const handlePortalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isTrailComplete) {
      // Gentle nudge
      audio.playPop();
      setCharacterMood('pointing');
      return;
    }
    audio.playFinaleFanfare();
    goToScene('scene_4_finale');
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center select-none">
      {/* Trail Map Container */}
      <div
        ref={containerRef}
        onClick={handleMapClick}
        className="relative w-full aspect-[4/3] sm:aspect-[16/11] max-h-[500px] rounded-3xl border-4 border-deep-ink shadow-[8px_8px_0px_#1E1B4B] overflow-hidden cursor-pointer bg-[#ECFDF5]"
      >
        {/* Grass & Cobblestone Path Illustration */}
        <svg
          viewBox="0 0 400 300"
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="none"
        >
          {/* Garden Grass Base */}
          <rect width="400" height="300" fill="#DCFCE7" />

          {/* Stepping Stone Winding Paths */}
          {/* Main vertical path */}
          <path
            d="M 200,280 C 200,240 130,220 100,195 C 70,170 80,120 100,105 C 130,85 170,75 200,45"
            fill="none"
            stroke="#FEF3C7"
            strokeWidth="38"
            strokeLinecap="round"
          />
          <path
            d="M 200,280 C 200,240 270,220 300,195 C 330,170 320,120 300,105 C 270,85 230,75 200,45"
            fill="none"
            stroke="#FEF3C7"
            strokeWidth="38"
            strokeLinecap="round"
          />
          {/* Central Crossing Plaza */}
          <ellipse cx="200" cy="150" rx="45" ry="30" fill="#FEF3C7" />

          {/* Stepping Stone Dots */}
          {[
            { cx: 200, cy: 265 },
            { cx: 180, cy: 235 },
            { cx: 220, cy: 235 },
            { cx: 130, cy: 205 },
            { cx: 270, cy: 205 },
            { cx: 95, cy: 155 },
            { cx: 305, cy: 155 },
            { cx: 130, cy: 105 },
            { cx: 270, cy: 105 },
            { cx: 180, cy: 75 },
            { cx: 220, cy: 75 },
            { cx: 200, cy: 50 },
          ].map((pt, i) => (
            <circle key={i} cx={pt.cx} cy={pt.cy} r="6" fill="#FDE68A" stroke="#1E1B4B" strokeWidth="1.5" />
          ))}

          {/* Decorative Flower Tufts */}
          {[
            { cx: 45, cy: 60, col: '#FB7185' },
            { cx: 355, cy: 60, col: '#38BDF8' },
            { cx: 40, cy: 250, col: '#FDE047' },
            { cx: 360, cy: 250, col: '#C084FC' },
            { cx: 200, cy: 190, col: '#FB7185' },
          ].map((fl, i) => (
            <g key={i}>
              <circle cx={fl.cx} cy={fl.cy} r="5" fill={fl.col} />
              <circle cx={fl.cx} cy={fl.cy} r="2" fill="#FFFFFF" />
            </g>
          ))}

          {/* Festive Hanging Garland at Top */}
          <path d="M 0,15 Q 100,35 200,20 Q 300,35 400,15" fill="none" stroke="#1E1B4B" strokeWidth="2" />
          {[20, 60, 100, 140, 180, 220, 260, 300, 340, 380].map((x, i) => (
            <polygon
              key={i}
              points={`${x - 8},${18 + Math.sin(x * 0.05) * 5} ${x + 8},${18 + Math.sin(x * 0.05) * 5} ${x},${32 + Math.sin(x * 0.05) * 5}`}
              fill={['#FB7185', '#38BDF8', '#FDE047', '#2DD4BF', '#C084FC'][i % 5]}
              stroke="#1E1B4B"
              strokeWidth="1.2"
            />
          ))}
        </svg>

        {/* Top-Left Progress Signpost */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none">
          <div className="px-3.5 py-1.5 rounded-2xl bg-white border-2 border-deep-ink shadow-[2px_2px_0px_#1E1B4B] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-dark" />
            <span className="font-display font-bold text-xs uppercase tracking-wider text-deep-ink">
              Keepsakes: {exploredCount}/{totalCount}
            </span>
          </div>
        </div>

        {/* Top Center: The Grand Rainbow Portal (Destination) */}
        <div
          onClick={handlePortalClick}
          className={`absolute top-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center cursor-pointer transition-all ${
            isTrailComplete ? 'scale-110 hover:scale-115 animate-bounce' : 'opacity-85'
          }`}
          style={{ top: '8%' }}
        >
          <div
            className={`px-4 py-2 rounded-2xl border-2 border-deep-ink shadow-[3px_3px_0px_#1E1B4B] flex items-center gap-2 transition-all ${
              isTrailComplete
                ? 'bg-gradient-to-r from-coral via-yellow to-turquoise text-deep-ink font-bold animate-pulse'
                : 'bg-white text-deep-ink/70'
            }`}
          >
            <span className="text-lg">{isTrailComplete ? '🌈' : '🔒'}</span>
            <span className="font-display font-bold text-xs uppercase tracking-wider">
              {isTrailComplete ? 'Grand Finale Portal ➔' : 'Rainbow Portal (Locked)'}
            </span>
          </div>
        </div>

        {/* 4 Interactive Keepsake Stations */}
        {stations.map((st) => {
          const isExplored =
            st.type === 'scratch'
              ? scratchCompleted
              : exploredMemoryIds.includes(st.id);

          return (
            <div
              key={st.id}
              onClick={(e) => handleStationClick(st, e)}
              className="absolute z-20 flex flex-col items-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: `${st.x}%`, top: `${st.y}%` }}
            >
              {/* Pedestal Icon Circle */}
              <div
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 border-deep-ink shadow-[3px_3px_0px_#1E1B4B] flex items-center justify-center transition-all group-hover:scale-110 group-active:scale-95 ${
                  isExplored ? 'ring-4 ring-yellow/60' : 'animate-bounce'
                }`}
                style={{ backgroundColor: st.color }}
              >
                {st.icon}

                {/* Checked Badge if found */}
                {isExplored && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-turquoise border-2 border-deep-ink flex items-center justify-center shadow-sm">
                    <Check className="w-3 h-3 text-deep-ink stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Station Name Label Pill */}
              <div className="mt-1 px-2.5 py-0.5 rounded-full bg-white/95 border border-deep-ink text-[10px] font-display font-bold uppercase tracking-wider text-deep-ink shadow-sm whitespace-nowrap">
                {st.name}
              </div>
            </div>
          );
        })}

        {/* Tap Ripple Indicator */}
        {tapRipple && (
          <div
            key={tapRipple.id}
            className="absolute z-10 w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-coral bg-coral/20 pointer-events-none animate-ping"
            style={{ left: `${tapRipple.x}%`, top: `${tapRipple.y}%` }}
          />
        )}

        {/* Pip The Mascot Moving On The Trail */}
        <div
          className={`absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ${
            isWalking ? 'animate-bounce' : ''
          }`}
          style={{
            left: `${pipPos.x}%`,
            top: `${pipPos.y}%`,
            transform: `translate(-50%, -50%) scaleX(${facing === 'left' ? -1 : 1})`,
          }}
        >
          <PipCharacter mood={isWalking ? 'happy' : characterMood} size={70} />
        </div>
      </div>

      {/* Guide Banner Under Map */}
      <div className="w-full mt-3 flex flex-col sm:flex-row items-center justify-between gap-2 px-2 text-xs">
        <div className="flex items-center gap-1.5 font-sans font-semibold text-deep-ink/80">
          <span>👆 Tap anywhere on the garden or click a treasure station to guide Pip!</span>
        </div>

        {isTrailComplete && (
          <button
            onClick={() => goToScene('scene_4_finale')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-coral to-peach text-white border-2 border-deep-ink font-display font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#1E1B4B] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all animate-pulse"
          >
            <span>Proceed to Finale! 🎈</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Secret Scratch Card Modal Overlay */}
      {scratchModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-ink/65 backdrop-blur-sm animate-fadeIn"
          onClick={() => setScratchModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-cream border-[3px] border-deep-ink rounded-3xl p-5 sm:p-7 shadow-[8px_8px_0px_#1E1B4B] animate-comic-pop"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="text-center mb-3">
              <span className="inline-block px-3 py-1 rounded-full bg-coral text-white text-[11px] font-display font-bold uppercase tracking-wider">
                👑 Top Secret Proclamation
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-deep-ink mt-1">
                Rub Foil to Reveal Decree!
              </h2>
            </div>

            {/* Tactile Canvas Scratch Card */}
            <ScratchCard
              onCompleted={() => {
                completeScratch();
                audio.playCollect();
              }}
              isCompleted={scratchCompleted}
            >
              <div className="w-full h-full flex flex-col justify-between items-center text-center p-3 sm:p-5 bg-gradient-to-b from-[#FEFCE8] to-[#FFFDF8] rounded-2xl border-2 border-deep-ink">
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-coral text-white text-[10px] font-display font-bold uppercase tracking-wider">
                  👑 Royal Proclamation
                </div>

                <h3 className="text-lg sm:text-xl font-display font-bold text-deep-ink">
                  To {BIRTHDAY_DATA.sisterName}
                </h3>

                <p className="font-sans font-medium text-xs sm:text-sm text-deep-ink/90 leading-relaxed max-w-sm px-1">
                  &ldquo;{BIRTHDAY_DATA.scratchSecretMessage}&rdquo;
                </p>

                <div className="text-[10px] font-sans font-semibold text-deep-ink/60 uppercase tracking-wider">
                  Certified with love &bull; From {BIRTHDAY_DATA.brotherName}
                </div>
              </div>
            </ScratchCard>

            {/* Close / Return to Trail Button */}
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setScratchModalOpen(false)}
                className="px-6 py-2 rounded-full bg-turquoise hover:bg-turquoise-dark text-deep-ink border-2 border-deep-ink font-display font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#1E1B4B] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                Return to Treasure Trail 🗺️
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

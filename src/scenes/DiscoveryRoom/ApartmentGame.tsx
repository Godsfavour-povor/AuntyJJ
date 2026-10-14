import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mail, Crown, ArrowRight, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Tv, Lightbulb, Flower2 } from 'lucide-react';
import { useAdventure } from '../../context/AdventureContext';
import { useAudio } from '../../audio/useAudio';
import { PipCharacter } from '../../components/Character/PipCharacter';
import { CinematicEnvelopeModal, type EnvelopeData } from './CinematicEnvelopeModal';
import { FinalScratchModal } from './FinalScratchModal';

interface TableTarget {
  id: string;
  roomName: string;
  name: string;
  x: number; // in virtual pixels (0 - 800)
  y: number; // in virtual pixels (0 - 500)
  type: 'envelope' | 'final_surprise';
  envelopeData?: EnvelopeData;
}

export const ApartmentGame: React.FC = () => {
  const {
    scratchCompleted,
    characterMood,
    goToScene,
  } = useAdventure();

  const audio = useAudio();

  // Pip position in 800x500 virtual arena (starts in center of Parlor)
  const [pipPos, setPipPos] = useState<{ x: number; y: number }>({ x: 400, y: 320 });
  const [facing, setFacing] = useState<'left' | 'right' | 'up' | 'down'>('down');
  const [isWalking, setIsWalking] = useState<boolean>(false);
  const [walkTarget, setWalkTarget] = useState<{ x: number; y: number } | null>(null);

  // Unlocked / opened envelope IDs
  const [openedEnvelopes, setOpenedEnvelopes] = useState<string[]>([]);
  const [activeEnvelope, setActiveEnvelope] = useState<EnvelopeData | null>(null);
  const [finalModalOpen, setFinalModalOpen] = useState<boolean>(false);

  // Active nearby target (ONLY active when Pip is standing right next to the table)
  const [nearbyTarget, setNearbyTarget] = useState<TableTarget | null>(null);

  // Interactive ambient toys
  const [tvOn, setTvOn] = useState<boolean>(false);
  const [lampOn, setLampOn] = useState<boolean>(false);
  const [flowersWatered, setFlowersWatered] = useState<boolean>(false);

  // Room indicator
  const [roomNotification, setRoomNotification] = useState<string>('Living Room 🛋️');
  const lastRoomRef = useRef<string>('parlor');

  // Virtual Joystick Touch Tracking
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [joystickVector, setJoystickVector] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingJoystick, setIsDraggingJoystick] = useState<boolean>(false);

  // Active keyboard keys
  const keysDownRef = useRef<{ [key: string]: boolean }>({});
  const lastStepTimeRef = useRef<number>(0);
  const arenaRef = useRef<HTMLDivElement>(null);

  // 4 Interactive Tables with Envelopes across the apartment
  const tables: TableTarget[] = [
    {
      id: 'env-bedroom',
      roomName: 'Keepsake Bedroom',
      name: 'Sisterhood Trophy Letter',
      x: 140,
      y: 260,
      type: 'envelope',
      envelopeData: {
        id: 'env-bedroom',
        roomName: 'The Keepsake Bedroom',
        title: 'The Ultimate Sister Trophy',
        badge: 'Family Record Holder 🏆',
        subtitle: 'Official Award for Patience & Wisdom',
        message:
          'Awarded by unanimous vote for displaying Olympic-level patience, endless wisdom, and unconditional brotherly support. You make being a big sister look effortless, inspiring, and full of grace!',
        pipRemark: 'Honestly, she deserves this trophy in solid 24k gold!',
        accentColor: '#FDE047',
      },
    },
    {
      id: 'env-dining',
      roomName: 'Sunshine Dining Balcony',
      name: 'Laughter Specialist Note',
      x: 660,
      y: 310,
      type: 'envelope',
      envelopeData: {
        id: 'env-dining',
        roomName: 'The Sunshine Balcony',
        title: 'The Laughter Specialist',
        badge: 'Pure Sunshine ☀️',
        subtitle: 'Contagious Chuckles Certified',
        message:
          'No matter how serious or busy life gets, your laugh has an undeniable superpower — it instantly makes everyone around you feel lighter, happier, and loved. Thank you for filling our family with pure warmth!',
        pipRemark: 'Her smile could power an entire city!',
        accentColor: '#FB7185',
      },
    },
    {
      id: 'env-parlor',
      roomName: 'Parlor Living Room',
      name: 'Sibling Compass Scroll',
      x: 320,
      y: 420,
      type: 'envelope',
      envelopeData: {
        id: 'env-parlor',
        roomName: 'The Sibling Den',
        title: 'The Sibling Compass',
        badge: 'Endless Guidance 🧭',
        subtitle: 'Wisdom You Can Always Count On',
        message:
          "Thank you for being my big sister, my cheerleader, and a constant voice of reason. You've taught me how to walk with confidence, kindness, and big dreams.",
        pipRemark: 'Best big sister ever? 100% verified by Godsfavour!',
        accentColor: '#2DD4BF',
      },
    },
    {
      id: 'final-surprise',
      roomName: 'The Secret Chamber',
      name: 'Final Birthday Surprise',
      x: 400,
      y: 100,
      type: 'final_surprise',
    },
  ];

  const allEnvelopesFound = openedEnvelopes.length >= 3;

  // Collision Boundaries
  const isWalkable = useCallback((newX: number, newY: number) => {
    // Outer walls
    if (newX < 55 || newX > 745 || newY < 45 || newY > 465) return false;

    // Outer wall dividing North Secret Chamber (Y: 20-160) from Center Parlor (Y: 160-470)
    if (newY <= 165) {
      if (newX < 350 || newX > 450) return false;
      // Velvet ribbon lock until all 3 envelopes are opened
      if (!allEnvelopesFound && newY < 155) return false;
    }

    // Vertical wall dividing Bedroom from Parlor (X: 250, Doorway at Y: 270-370)
    if (newX <= 255 && newX >= 245 && (newY < 270 || newY > 370)) return false;

    // Vertical wall dividing Parlor from Balcony (X: 550, Doorway at Y: 270-370)
    if (newX >= 545 && newX <= 555 && (newY < 270 || newY > 370)) return false;

    // Obstacle: Center Parlor Coffee Table
    if (newX > 370 && newX < 430 && newY > 320 && newY < 360) return false;

    return true;
  }, [allEnvelopesFound]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysDownRef.current[e.key.toLowerCase()] = true;
      setWalkTarget(null);

      // Space or Enter triggers nearby target
      if ((e.key === ' ' || e.key === 'Enter') && nearbyTarget) {
        e.preventDefault();
        triggerProximityAction();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDownRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  });

  // Proximity Action Trigger (ONLY works when Pip is nearby)
  const triggerProximityAction = () => {
    if (!nearbyTarget) return;

    if (nearbyTarget.type === 'final_surprise') {
      setFinalModalOpen(true);
    } else if (nearbyTarget.envelopeData) {
      setActiveEnvelope(nearbyTarget.envelopeData);
      if (!openedEnvelopes.includes(nearbyTarget.id)) {
        setOpenedEnvelopes((prev) => [...prev, nearbyTarget.id]);
      }
    }
  };

  // Main 60fps Game Loop
  useEffect(() => {
    let animId: number;

    const gameLoop = (timestamp: number) => {
      let dx = 0;
      let dy = 0;

      // Joystick input
      if (isDraggingJoystick) {
        dx += joystickVector.x;
        dy += joystickVector.y;
        setWalkTarget(null);
      }

      // Keyboard input
      const keys = keysDownRef.current;
      if (keys['arrowleft'] || keys['a']) dx -= 1;
      if (keys['arrowright'] || keys['d']) dx += 1;
      if (keys['arrowup'] || keys['w']) dy -= 1;
      if (keys['arrowdown'] || keys['s']) dy += 1;

      // Tap-to-move path interpolation
      if (walkTarget && !isDraggingJoystick && Math.hypot(dx, dy) === 0) {
        const targetDx = walkTarget.x - pipPos.x;
        const targetDy = walkTarget.y - pipPos.y;
        const distToTarget = Math.hypot(targetDx, targetDy);
        if (distToTarget > 6) {
          dx = targetDx / distToTarget;
          dy = targetDy / distToTarget;
        } else {
          setWalkTarget(null);
        }
      }

      // Movement application
      const mag = Math.hypot(dx, dy);
      if (mag > 0.1) {
        setIsWalking(true);
        const speed = 3.6;
        const moveX = (dx / mag) * speed;
        const moveY = (dy / mag) * speed;

        if (Math.abs(dx) > Math.abs(dy)) {
          setFacing(dx < 0 ? 'left' : 'right');
        } else {
          setFacing(dy < 0 ? 'up' : 'down');
        }

        if (timestamp - lastStepTimeRef.current > 180) {
          audio.playFootstep();
          lastStepTimeRef.current = timestamp;
        }

        setPipPos((prev) => {
          let nextX = prev.x;
          let nextY = prev.y;

          if (isWalkable(prev.x + moveX, prev.y)) {
            nextX = prev.x + moveX;
          }
          if (isWalkable(prev.x, prev.y + moveY)) {
            nextY = prev.y + moveY;
          }
          return { x: nextX, y: nextY };
        });
      } else {
        setIsWalking(false);
      }

      // Check proximity (strictly <= 58px)
      let foundNearby: TableTarget | null = null;
      for (const t of tables) {
        const dist = Math.hypot(t.x - pipPos.x, t.y - pipPos.y);
        if (dist <= 58) {
          foundNearby = t;
          break;
        }
      }
      setNearbyTarget(foundNearby);

      // Track current room
      let currentRoomCode = 'parlor';
      let currentRoomTitle = 'Living Room 🛋️';
      if (pipPos.y < 160) {
        currentRoomCode = 'royal';
        currentRoomTitle = 'The Secret Chamber 👑';
      } else if (pipPos.x < 250) {
        currentRoomCode = 'bedroom';
        currentRoomTitle = 'The Keepsake Bedroom 🛏️';
      } else if (pipPos.x > 550) {
        currentRoomCode = 'balcony';
        currentRoomTitle = 'The Sunshine Balcony ☀️';
      }

      if (currentRoomCode !== lastRoomRef.current) {
        lastRoomRef.current = currentRoomCode;
        setRoomNotification(currentRoomTitle);
        audio.playPop();
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isDraggingJoystick, joystickVector, pipPos, walkTarget, audio, isWalkable, tables]);

  // Touch Virtual Joystick Handlers
  const handleJoystickPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingJoystick(true);
    setWalkTarget(null);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateJoystick(e.clientX, e.clientY);
  };

  const handleJoystickPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingJoystick) return;
    updateJoystick(e.clientX, e.clientY);
  };

  const handleJoystickPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingJoystick(false);
    setJoystickVector({ x: 0, y: 0 });
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    const base = joystickBaseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rawDx = clientX - centerX;
    const rawDy = clientY - centerY;
    const radius = rect.width / 2;
    const dist = Math.hypot(rawDx, rawDy);

    if (dist === 0) {
      setJoystickVector({ x: 0, y: 0 });
      return;
    }

    const clampedDist = Math.min(dist, radius);
    setJoystickVector({
      x: (rawDx / dist) * (clampedDist / radius),
      y: (rawDy / dist) * (clampedDist / radius),
    });
  };

  // Directional D-Pad Button Helper
  const setDpadDirection = (dirX: number, dirY: number, active: boolean) => {
    setWalkTarget(null);
    if (active) {
      setIsDraggingJoystick(true);
      setJoystickVector({ x: dirX, y: dirY });
    } else {
      setIsDraggingJoystick(false);
      setJoystickVector({ x: 0, y: 0 });
    }
  };

  // Tap-to-move on floor
  const handleArenaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const arena = arenaRef.current;
    if (!arena) return;
    const rect = arena.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 800;
    const clickY = ((e.clientY - rect.top) / rect.height) * 500;
    setWalkTarget({ x: clickX, y: clickY });
    audio.playPop();
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center select-none">
      {/* Top HUD Bar: Room Banner & Envelope Counter (Clean, no nag text) */}
      <div className="w-full flex items-center justify-between px-4 py-2 mb-2 bg-white/95 border-2 border-deep-ink rounded-2xl shadow-[3px_3px_0px_#1E1B4B]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-turquoise" />
          <span className="font-display font-bold text-xs uppercase tracking-wider text-deep-ink">
            {roomNotification}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Mail className="w-4 h-4 text-coral" />
          <span className="font-display font-bold text-xs uppercase tracking-wider text-deep-ink">
            Envelopes: {openedEnvelopes.length}/3 Unlocked
          </span>
        </div>
      </div>

      {/* The 800 x 500 Apartment Game Arena */}
      <div
        ref={arenaRef}
        onClick={handleArenaClick}
        className="relative w-full aspect-[16/10] max-h-[520px] rounded-3xl border-4 border-deep-ink shadow-[8px_8px_0px_#1E1B4B] overflow-hidden bg-[#FDFBF7] cursor-pointer"
      >
        {/* Top-Down Apartment Architectural SVG Blueprint */}
        <svg
          viewBox="0 0 800 500"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {/* Room Floors */}
          {/* North Secret Chamber (Royal Lavender Carpet) */}
          <rect x="250" y="20" width="300" height="140" fill="#EDE9FE" />
          <path d="M 370,160 L 370,30 L 430,30 L 430,160 Z" fill="#F43F5E" opacity="0.3" />

          {/* West Bedroom Floor (Lilac Carpet) */}
          <rect x="50" y="160" width="200" height="300" fill="#FCE7F3" />
          {/* Bed Illustration */}
          <rect x="70" y="180" width="65" height="100" rx="8" fill="#F472B6" stroke="#1E1B4B" strokeWidth="2.5" />
          <rect x="75" y="185" width="55" height="30" rx="4" fill="#FFFFFF" />

          {/* East Dining Balcony Floor (Warm Yellow Terracotta) */}
          <rect x="550" y="160" width="200" height="300" fill="#FEF3C7" />
          <circle cx="660" cy="310" r="38" fill="#FDE68A" stroke="#1E1B4B" strokeWidth="2.5" />

          {/* Center Parlor Living Room (Warm Honey Parquet) */}
          <rect x="250" y="160" width="300" height="300" fill="#FEF9C3" />
          {/* Parlor Rug */}
          <ellipse cx="400" cy="330" rx="85" ry="55" fill="#E0F2FE" stroke="#1E1B4B" strokeWidth="2" strokeDasharray="6 4" />
          {/* Coffee Table */}
          <rect x="375" y="325" width="50" height="28" rx="6" fill="#FDBA74" stroke="#1E1B4B" strokeWidth="2.5" />
          {/* Cozy Sofa */}
          <rect x="360" y="380" width="80" height="36" rx="8" fill="#38BDF8" stroke="#1E1B4B" strokeWidth="2.5" />

          {/* Apartment Outer & Dividing Walls */}
          <rect x="50" y="20" width="700" height="440" fill="none" stroke="#1E1B4B" strokeWidth="6" />

          {/* North Chamber Bottom Dividing Wall (Doorway at 350-450) */}
          <line x1="50" y1="160" x2="350" y2="160" stroke="#1E1B4B" strokeWidth="6" />
          <line x1="450" y1="160" x2="750" y2="160" stroke="#1E1B4B" strokeWidth="6" />
          <circle cx="350" cy="160" r="4" fill="#1E1B4B" />
          <circle cx="450" cy="160" r="4" fill="#1E1B4B" />

          {/* West Bedroom Dividing Wall (Doorway at 270-370) */}
          <line x1="250" y1="160" x2="250" y2="270" stroke="#1E1B4B" strokeWidth="6" />
          <line x1="250" y1="370" x2="250" y2="460" stroke="#1E1B4B" strokeWidth="6" />
          <circle cx="250" cy="270" r="4" fill="#1E1B4B" />
          <circle cx="250" cy="370" r="4" fill="#1E1B4B" />

          {/* East Balcony Dividing Wall (Doorway at 270-370) */}
          <line x1="550" y1="160" x2="550" y2="270" stroke="#1E1B4B" strokeWidth="6" />
          <line x1="550" y1="370" x2="550" y2="460" stroke="#1E1B4B" strokeWidth="6" />
          <circle cx="550" cy="270" r="4" fill="#1E1B4B" />
          <circle cx="550" cy="370" r="4" fill="#1E1B4B" />

          {/* Golden Ribbon Lock across North Chamber Doorway (if envelopes not all found) */}
          {!allEnvelopesFound && (
            <g>
              <line x1="350" y1="160" x2="450" y2="160" stroke="#F59E0B" strokeWidth="5" strokeDasharray="6 4" />
              <circle cx="400" cy="160" r="10" fill="#FDE047" stroke="#1E1B4B" strokeWidth="2" />
              <text x="400" y="164" fontSize="10" textAnchor="middle" fill="#1E1B4B">🔒</text>
            </g>
          )}

          {/* Grand Finale Archway in North Wall */}
          <rect x="360" y="16" width="80" height="8" fill="#FDE047" stroke="#1E1B4B" strokeWidth="2" />
        </svg>

        {/* Ambient Interactive Objects (TV, Lamp, Flowers) */}
        {/* 1. Parlor TV Console */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setTvOn((prev) => !prev);
            audio.playPop();
          }}
          className="absolute top-[175px] left-[380px] z-20 flex flex-col items-center cursor-pointer"
        >
          <div className={`p-1 rounded border-2 border-deep-ink transition-colors ${tvOn ? 'bg-turquoise' : 'bg-white'}`}>
            <Tv className="w-4 h-4 text-deep-ink" />
          </div>
          <span className="text-[8px] font-bold text-deep-ink/70">TV</span>
        </div>

        {/* 2. Bedroom Desk Lamp */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setLampOn((prev) => !prev);
            audio.playPop();
          }}
          className="absolute top-[175px] left-[180px] z-20 flex flex-col items-center cursor-pointer"
        >
          <div className={`p-1 rounded-full border-2 border-deep-ink transition-colors ${lampOn ? 'bg-yellow shadow-[0_0_12px_#FDE047]' : 'bg-white'}`}>
            <Lightbulb className="w-4 h-4 text-deep-ink" />
          </div>
          <span className="text-[8px] font-bold text-deep-ink/70">Lamp</span>
        </div>

        {/* 3. Balcony Flower Planter */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setFlowersWatered(true);
            audio.playCollect();
          }}
          className="absolute top-[175px] left-[680px] z-20 flex flex-col items-center cursor-pointer"
        >
          <div className={`p-1 rounded-full border-2 border-deep-ink transition-transform ${flowersWatered ? 'scale-110 bg-coral text-white' : 'bg-white text-coral'}`}>
            <Flower2 className="w-4 h-4" />
          </div>
          <span className="text-[8px] font-bold text-deep-ink/70">Flowers</span>
        </div>

        {/* Waypoint Click Beacon */}
        {walkTarget && (
          <div
            className="absolute z-10 w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-coral bg-coral/20 pointer-events-none"
            style={{
              left: `${(walkTarget.x / 800) * 100}%`,
              top: `${(walkTarget.y / 500) * 100}%`,
            }}
          />
        )}

        {/* 4 Interactive Tables & Envelopes (Proximity-Gated Only!) */}
        {tables.map((t) => {
          const isOpened = openedEnvelopes.includes(t.id);
          const isNearby = nearbyTarget?.id === t.id;

          return (
            <div
              key={t.id}
              className="absolute z-20 flex flex-col items-center -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${(t.x / 800) * 100}%`,
                top: `${(t.y / 500) * 100}%`,
              }}
            >
              {/* Proximity prompt badge (ONLY visible when Pip is standing right beside table) */}
              {isNearby && (
                <div className="absolute -top-7 px-2 py-0.5 rounded-full bg-coral text-white text-[10px] font-display font-bold uppercase tracking-wider shadow-sm z-30">
                  Inspect! 💬
                </div>
              )}

              {/* Table Object Icon */}
              <div
                className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border-2 border-deep-ink shadow-[2px_2px_0px_#1E1B4B] flex items-center justify-center transition-all ${
                  t.type === 'final_surprise'
                    ? 'bg-gradient-to-r from-coral to-yellow'
                    : isOpened
                    ? 'bg-yellow/80 ring-2 ring-turquoise'
                    : 'bg-white'
                }`}
              >
                {t.type === 'final_surprise' ? (
                  <Crown className="w-5 h-5 text-deep-ink" />
                ) : (
                  <Mail className="w-5 h-5 text-coral" />
                )}

                {/* Checked mark if opened */}
                {isOpened && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-turquoise border border-deep-ink flex items-center justify-center text-[9px] font-bold text-deep-ink">
                    ✓
                  </div>
                )}
              </div>

              {/* Table Label */}
              <div className="mt-1 px-2 py-0.5 rounded-full bg-white/95 border border-deep-ink text-[9px] sm:text-[10px] font-display font-bold uppercase tracking-wider text-deep-ink shadow-sm whitespace-nowrap">
                {t.name}
              </div>
            </div>
          );
        })}

        {/* Pip The Mascot Moving In Apartment */}
        <div
          className={`absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ${
            isWalking ? 'scale-105' : ''
          }`}
          style={{
            left: `${(pipPos.x / 800) * 100}%`,
            top: `${(pipPos.y / 500) * 100}%`,
            transform: `translate(-50%, -50%) scaleX(${facing === 'left' ? -1 : 1})`,
          }}
        >
          <PipCharacter mood={characterMood} size={65} />
        </div>

        {/* On-Screen Virtual Joystick (Bottom Left) */}
        <div
          ref={joystickBaseRef}
          onPointerDown={handleJoystickPointerDown}
          onPointerMove={handleJoystickPointerMove}
          onPointerUp={handleJoystickPointerUp}
          onPointerCancel={handleJoystickPointerUp}
          className="absolute bottom-3 left-3 z-40 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/85 border-3 border-deep-ink shadow-[3px_3px_0px_#1E1B4B] flex items-center justify-center touch-none cursor-pointer"
        >
          {/* Joystick Floating Knob */}
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-turquoise border-2 border-deep-ink shadow-sm pointer-events-none transition-transform"
            style={{
              transform: `translate(${joystickVector.x * 28}px, ${joystickVector.y * 28}px)`,
            }}
          />
        </div>

        {/* On-Screen Proximity Action Button (Bottom Right) */}
        <div className="absolute bottom-4 right-4 z-40 flex flex-col items-end gap-2">
          {nearbyTarget && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerProximityAction();
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-coral hover:bg-coral-dark text-white border-2 border-deep-ink font-display font-bold text-xs uppercase tracking-wider shadow-[4px_4px_0px_#1E1B4B] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              <span>
                {nearbyTarget.type === 'final_surprise'
                  ? '👑 Open Final Surprise!'
                  : '✉️ Open Envelope!'}
              </span>
            </button>
          )}

          {/* Quick D-Pad Stepping Buttons (For Phone Ergonomics) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center bg-white/90 p-1.5 rounded-2xl border-2 border-deep-ink shadow-[2px_2px_0px_#1E1B4B]"
          >
            <button
              onPointerDown={() => setDpadDirection(0, -1, true)}
              onPointerUp={() => setDpadDirection(0, -1, false)}
              className="w-7 h-7 rounded-lg bg-yellow hover:bg-yellow-dark flex items-center justify-center border border-deep-ink text-deep-ink font-bold active:bg-coral active:text-white"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <div className="flex gap-1 my-0.5">
              <button
                onPointerDown={() => setDpadDirection(-1, 0, true)}
                onPointerUp={() => setDpadDirection(-1, 0, false)}
                className="w-7 h-7 rounded-lg bg-yellow hover:bg-yellow-dark flex items-center justify-center border border-deep-ink text-deep-ink font-bold active:bg-coral active:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onPointerDown={() => setDpadDirection(1, 0, true)}
                onPointerUp={() => setDpadDirection(1, 0, false)}
                className="w-7 h-7 rounded-lg bg-yellow hover:bg-yellow-dark flex items-center justify-center border border-deep-ink text-deep-ink font-bold active:bg-coral active:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onPointerDown={() => setDpadDirection(0, 1, true)}
              onPointerUp={() => setDpadDirection(0, 1, false)}
              className="w-7 h-7 rounded-lg bg-yellow hover:bg-yellow-dark flex items-center justify-center border border-deep-ink text-deep-ink font-bold active:bg-coral active:text-white"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Guide Banner Under Map (Only when final surprise completed) */}
      <div className="w-full mt-2.5 flex items-center justify-end px-2 text-xs">
        {scratchCompleted && (
          <button
            onClick={() => goToScene('scene_4_finale')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-coral to-peach text-white border-2 border-deep-ink font-display font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all"
          >
            <span>Proceed to Finale! 🎈</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Cinematic Multi-Stage Envelope Modal */}
      {activeEnvelope && (
        <CinematicEnvelopeModal
          envelope={activeEnvelope}
          onClose={() => setActiveEnvelope(null)}
        />
      )}

      {/* Final Surprise Cloud Reveal & Scratch Modal */}
      {finalModalOpen && (
        <FinalScratchModal
          onClose={() => setFinalModalOpen(false)}
        />
      )}
    </div>
  );
};

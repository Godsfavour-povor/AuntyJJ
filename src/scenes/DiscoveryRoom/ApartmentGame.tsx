import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mail, Crown, Sparkles, ArrowRight, X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Tv, Lightbulb, Flower2 } from 'lucide-react';
import { useAdventure } from '../../context/AdventureContext';
import { useAudio } from '../../audio/useAudio';
import { BIRTHDAY_DATA } from '../../config/birthdayData';
import { PipCharacter } from '../../components/Character/PipCharacter';
import { ScratchCard } from './ScratchCard';

interface TableTarget {
  id: string;
  roomName: string;
  name: string;
  x: number; // in virtual pixels (0 - 800)
  y: number; // in virtual pixels (0 - 500)
  type: 'envelope' | 'scratch';
  envelopeData?: {
    title: string;
    badge: string;
    subtitle: string;
    message: string;
    pipRemark: string;
    accentColor: string;
  };
}

export const ApartmentGame: React.FC = () => {
  const {
    scratchCompleted,
    completeScratch,
    characterMood,
    setCharacterMood,
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
  const [activeEnvelope, setActiveEnvelope] = useState<TableTarget | null>(null);
  const [scratchModalOpen, setScratchModalOpen] = useState<boolean>(false);

  // Active nearby target for proximity action button
  const [nearbyTarget, setNearbyTarget] = useState<TableTarget | null>(null);

  // Interactive ambient toys
  const [tvOn, setTvOn] = useState<boolean>(false);
  const [lampOn, setLampOn] = useState<boolean>(false);
  const [flowersWatered, setFlowersWatered] = useState<boolean>(false);

  // Room transition banner notification
  const [roomNotification, setRoomNotification] = useState<string>('Parlor (Living Room)');
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
      id: 'royal-decree',
      roomName: 'Royal Secret Chamber',
      name: 'Royal Mystery Table',
      x: 400,
      y: 100,
      type: 'scratch',
    },
  ];

  const allEnvelopesFound = openedEnvelopes.length >= 3;

  // Room Wall Boundaries & Doorways Collision Checker (Virtual 800 x 500 space)
  const isWalkable = useCallback((newX: number, newY: number) => {
    // Outer boundaries
    if (newX < 55 || newX > 745 || newY < 45 || newY > 465) return false;

    // Outer wall dividing North Royal Chamber (Y: 20-160) from Center Parlor (Y: 160-470)
    // Wall runs at Y: 160 from X: 50 to 800, Doorway at X: 350 - 450
    if (newY <= 165) {
      // Must be through doorway
      if (newX < 350 || newX > 450) return false;
      // Lock door if 3 envelopes not found yet
      if (!allEnvelopesFound && newY < 155) return false;
    }

    // Vertical wall dividing Bedroom (X: 50-250) from Parlor (X: 250-550)
    // Doorway at Y: 270 - 370
    if (newX <= 255 && newX >= 245 && (newY < 270 || newY > 370)) return false;

    // Vertical wall dividing Parlor (X: 250-550) from Dining Balcony (X: 550-750)
    // Doorway at Y: 270 - 370
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

      // Space or Enter opens nearby envelope
      if ((e.key === ' ' || e.key === 'Enter') && nearbyTarget) {
        e.preventDefault();
        triggerTargetAction(nearbyTarget);
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

  // Action trigger for nearby target
  const triggerTargetAction = (target: TableTarget) => {
    audio.playCollect();
    setCharacterMood('celebrating');

    if (target.type === 'scratch') {
      setScratchModalOpen(true);
    } else {
      setActiveEnvelope(target);
      if (!openedEnvelopes.includes(target.id)) {
        setOpenedEnvelopes((prev) => [...prev, target.id]);
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

      // Normalize movement speed
      const mag = Math.hypot(dx, dy);
      if (mag > 0.1) {
        setIsWalking(true);
        const speed = 3.8; // px per frame
        const moveX = (dx / mag) * speed;
        const moveY = (dy / mag) * speed;

        // Facing direction
        if (Math.abs(dx) > Math.abs(dy)) {
          setFacing(dx < 0 ? 'left' : 'right');
        } else {
          setFacing(dy < 0 ? 'up' : 'down');
        }

        // Footstep audio cadence
        if (timestamp - lastStepTimeRef.current > 180) {
          audio.playFootstep();
          lastStepTimeRef.current = timestamp;
        }

        setPipPos((prev) => {
          let nextX = prev.x;
          let nextY = prev.y;

          // Axis sliding physics
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

      // Check proximity to all tables (within 60px)
      let foundNearby: TableTarget | null = null;
      for (const t of tables) {
        const dist = Math.hypot(t.x - pipPos.x, t.y - pipPos.y);
        if (dist < 60) {
          foundNearby = t;
          break;
        }
      }
      setNearbyTarget(foundNearby);

      // Track current room for UI banner
      let currentRoomCode = 'parlor';
      let currentRoomTitle = 'Parlor (Living Room) 🛋️';
      if (pipPos.y < 160) {
        currentRoomCode = 'royal';
        currentRoomTitle = 'Royal Secret Chamber 👑';
      } else if (pipPos.x < 250) {
        currentRoomCode = 'bedroom';
        currentRoomTitle = 'Keepsake Bedroom 🛏️';
      } else if (pipPos.x > 550) {
        currentRoomCode = 'balcony';
        currentRoomTitle = 'Sunshine Balcony ☀️';
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
      {/* Top HUD Bar: Room Banner & Envelope Counter */}
      <div className="w-full flex items-center justify-between px-3.5 py-1.5 mb-2 bg-white/95 border-2 border-deep-ink rounded-2xl shadow-[3px_3px_0px_#1E1B4B]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-turquoise animate-pulse" />
          <span className="font-display font-bold text-xs uppercase tracking-wider text-deep-ink">
            {roomNotification}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-coral" />
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
          {/* North Royal Chamber (Royal Lavender Carpet) */}
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
            <g className="animate-pulse">
              <line x1="350" y1="160" x2="450" y2="160" stroke="#F59E0B" strokeWidth="5" strokeDasharray="6 4" />
              <circle cx="400" cy="160" r="10" fill="#FDE047" stroke="#1E1B4B" strokeWidth="2" />
              <text x="400" y="164" fontSize="10" textAnchor="middle" fill="#1E1B4B">🔒</text>
            </g>
          )}

          {/* Grand Finale Archway in North Wall */}
          <rect x="360" y="16" width="80" height="8" fill="#FDE047" stroke="#1E1B4B" strokeWidth="2" />
        </svg>

        {/* Ambient Interactive Objects (Toys) */}
        {/* 1. Parlor TV Console */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setTvOn((prev) => !prev);
            audio.playPop();
          }}
          className="absolute top-[175px] left-[380px] z-20 flex flex-col items-center cursor-pointer group"
        >
          <div className={`p-1 rounded border-2 border-deep-ink transition-colors ${tvOn ? 'bg-turquoise animate-pulse' : 'bg-white'}`}>
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
          className="absolute top-[175px] left-[180px] z-20 flex flex-col items-center cursor-pointer group"
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
          className="absolute top-[175px] left-[680px] z-20 flex flex-col items-center cursor-pointer group"
        >
          <div className={`p-1 rounded-full border-2 border-deep-ink transition-transform ${flowersWatered ? 'scale-125 bg-coral text-white' : 'bg-white text-coral'}`}>
            <Flower2 className="w-4 h-4" />
          </div>
          <span className="text-[8px] font-bold text-deep-ink/70">Flowers</span>
        </div>

        {/* Waypoint Click Beacon */}
        {walkTarget && (
          <div
            className="absolute z-10 w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-coral bg-coral/20 pointer-events-none animate-ping"
            style={{
              left: `${(walkTarget.x / 800) * 100}%`,
              top: `${(walkTarget.y / 500) * 100}%`,
            }}
          />
        )}

        {/* 4 Interactive Tables & Envelopes */}
        {tables.map((t) => {
          const isOpened = openedEnvelopes.includes(t.id);
          const isNearby = nearbyTarget?.id === t.id;

          return (
            <div
              key={t.id}
              onClick={(e) => {
                e.stopPropagation();
                triggerTargetAction(t);
              }}
              className="absolute z-20 flex flex-col items-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                left: `${(t.x / 800) * 100}%`,
                top: `${(t.y / 500) * 100}%`,
              }}
            >
              {/* Exclamation badge when Pip is nearby */}
              {isNearby && (
                <div className="absolute -top-7 animate-bounce px-2 py-0.5 rounded-full bg-coral text-white text-[10px] font-display font-bold uppercase tracking-wider shadow-sm z-30">
                  Inspect! 💬
                </div>
              )}

              {/* Table Object Icon */}
              <div
                className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border-2 border-deep-ink shadow-[2px_2px_0px_#1E1B4B] flex items-center justify-center transition-all group-hover:scale-110 ${
                  t.type === 'scratch'
                    ? 'bg-gradient-to-r from-coral to-yellow'
                    : isOpened
                    ? 'bg-yellow/80 ring-2 ring-turquoise'
                    : 'bg-white animate-bounce'
                }`}
              >
                {t.type === 'scratch' ? (
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
                {t.type === 'scratch' ? 'Royal Decree ✨' : t.name}
              </div>
            </div>
          );
        })}

        {/* Pip The Mascot Moving In Apartment */}
        <div
          className={`absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ${
            isWalking ? 'animate-bounce' : ''
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
          {nearbyTarget ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerTargetAction(nearbyTarget);
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-coral hover:bg-coral-dark text-white border-2 border-deep-ink font-display font-bold text-xs uppercase tracking-wider shadow-[4px_4px_0px_#1E1B4B] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all animate-bounce"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>
                {nearbyTarget.type === 'scratch'
                  ? '👑 Scratch Royal Decree!'
                  : '✉️ Open Birthday Envelope!'}
              </span>
            </button>
          ) : (
            <div className="px-3.5 py-1.5 rounded-xl bg-white/85 border border-deep-ink text-[11px] font-sans font-semibold text-deep-ink/70">
              🕹️ Move Joystick or Tap Floor
            </div>
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

      {/* Guide Banner Under Map */}
      <div className="w-full mt-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 px-2 text-xs">
        <div className="flex items-center gap-1.5 font-sans font-semibold text-deep-ink/80">
          <span>
            {allEnvelopesFound
              ? '🌟 All secret envelopes found! Head to the North Royal Chamber for the Scratch Decree!'
              : '🧭 Explore each room to find hidden envelopes on tables!'}
          </span>
        </div>

        {scratchCompleted && (
          <button
            onClick={() => goToScene('scene_4_finale')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-coral to-peach text-white border-2 border-deep-ink font-display font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#1E1B4B] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all animate-pulse"
          >
            <span>Proceed to Finale! 🎈</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Opened Envelope Modal */}
      {activeEnvelope && activeEnvelope.envelopeData && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-ink/65 backdrop-blur-sm animate-fadeIn"
          onClick={() => setActiveEnvelope(null)}
        >
          <div
            className="relative w-full max-w-lg bg-cream border-[3px] border-deep-ink rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_#1E1B4B] animate-comic-pop"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveEnvelope(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white border-2 border-deep-ink hover:bg-coral hover:text-white transition-all shadow-[2px_2px_0px_#1E1B4B]"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Envelope Content */}
            <div className="text-center space-y-3">
              <span
                className="inline-block px-3 py-1 rounded-full text-deep-ink border border-deep-ink text-xs font-display font-bold uppercase tracking-wider"
                style={{ backgroundColor: activeEnvelope.envelopeData.accentColor }}
              >
                {activeEnvelope.envelopeData.badge}
              </span>

              <h2 className="text-2xl sm:text-3xl font-display font-bold text-deep-ink">
                {activeEnvelope.envelopeData.title}
              </h2>

              <p className="text-xs uppercase font-sans font-semibold tracking-wider text-coral">
                {activeEnvelope.envelopeData.subtitle}
              </p>

              <div className="w-16 h-1 bg-deep-ink rounded-full mx-auto my-2" />

              <p className="text-sm sm:text-base text-deep-ink/90 font-sans leading-relaxed text-left max-w-md mx-auto">
                {activeEnvelope.envelopeData.message}
              </p>

              {/* Pip's Commentary */}
              <div className="mt-4 p-3 rounded-2xl bg-white border-2 border-deep-ink text-xs sm:text-sm font-sans font-medium text-deep-ink shadow-[2px_2px_0px_#1E1B4B] flex items-center gap-2 text-left">
                <span className="text-xl">💬</span>
                <span className="italic">
                  <strong>Pip says:</strong> &ldquo;{activeEnvelope.envelopeData.pipRemark}&rdquo;
                </span>
              </div>

              {/* Close / Keep Exploring CTA */}
              <button
                onClick={() => setActiveEnvelope(null)}
                className="mt-4 px-6 py-2.5 rounded-full bg-turquoise hover:bg-turquoise-dark text-deep-ink hover:text-white border-2 border-deep-ink font-display font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#1E1B4B] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                Keep Exploring Apartment ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secret Scratch Card Modal (North Royal Chamber Table) */}
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

            {/* Close / Return to Apartment Button */}
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setScratchModalOpen(false)}
                className="px-6 py-2 rounded-full bg-turquoise hover:bg-turquoise-dark text-deep-ink border-2 border-deep-ink font-display font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_#1E1B4B] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                Return to Apartment 🗺️
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAudio } from '../../audio/useAudio';
import { AudioToggle } from '../../components/HUD/AudioToggle';
import { PresentBoxModal, type PresentItem } from './PresentBoxModal';
import { CinematicEnvelopeModal } from './CinematicEnvelopeModal';

interface EnvelopeItem {
  id: string;
  type: 'envelope';
  title: string;
  x: number;
  y: number;
  unlocked: boolean;
}

type InteractiveItem = PresentItem | EnvelopeItem;

const INITIAL_ITEMS: InteractiveItem[] = [
  {
    id: 'present-1',
    type: 'present',
    title: 'SISTERHOOD TROPHY GIFT',
    cardHeading: 'The World’s Best Sister Trophy 🏆',
    badge: 'GIFT #1 • COZY BEDROOM',
    boxColor: '#F472B6',
    x: 13.5,
    y: 61,
    unlocked: false,
    photoUrl: '/IMG-20251014-WA0000.jpg',
    message: 'Thank you mama ❤️',
  },
  {
    id: 'present-2',
    type: 'present',
    title: 'SIBLING COMPASS GIFT',
    cardHeading: 'Our Unbreakable Sibling Compass 🧭',
    badge: 'GIFT #2 • LIVING LOUNGE',
    boxColor: '#38BDF8',
    x: 36,
    y: 86,
    unlocked: false,
    photoUrl: '/IMG-20261014-WA0023.jpg',
    message: 'I no get another picture 😭',
  },
  {
    id: 'present-3',
    type: 'present',
    title: 'LAUGHTER SPECIALIST GIFT',
    cardHeading: 'The Laughter Specialist Award 😂',
    badge: 'GIFT #3 • SUNSHINE BALCONY',
    boxColor: '#FBBF24',
    x: 87,
    y: 67,
    unlocked: false,
    photoUrl: '/Screenshot_20251016_171306_WhatsApp.jpg',
    message: 'Thank you for the care 🌸',
  },
  {
    id: 'final-envelope',
    type: 'envelope',
    title: 'FINAL BIRTHDAY SURPRISE',
    x: 50,
    y: 17,
    unlocked: false,
  },
];

export const ApartmentGame: React.FC = () => {
  const audio = useAudio();

  // Interactive items in the apartment
  const [items, setItems] = useState<InteractiveItem[]>(INITIAL_ITEMS);

  // Player position in percentage coordinates (0 - 100)
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>({ x: 85, y: 54 });
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [wobbleDeg, setWobbleDeg] = useState<number>(0);

  // Active Modals
  const [activePresent, setActivePresent] = useState<PresentItem | null>(null);
  const [envelopeModalOpen, setEnvelopeModalOpen] = useState<boolean>(false);

  // Room status
  const [roomInfo, setRoomInfo] = useState<{ name: string; emoji: string; color: string }>({
    name: 'THE SUNSHINE BALCONY',
    emoji: '🌼',
    color: '#2DD4BF',
  });

  // Target destination when tapping floor
  const targetPosRef = useRef<{ x: number; y: number } | null>(null);
  const playerPosRef = useRef<{ x: number; y: number }>({ x: 85, y: 54 });
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const joystickVectorRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingJoystickRef = useRef<boolean>(false);
  const stepTimerRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const modalOpenRef = useRef<boolean>(false);

  // Keep modal state in sync with ref to pause animation loops cleanly
  useEffect(() => {
    modalOpenRef.current = !!activePresent || envelopeModalOpen;
  }, [activePresent, envelopeModalOpen]);

  // Preload present keepsake pictures in the browser cache
  useEffect(() => {
    ['/IMG-20251014-WA0000.jpg', '/IMG-20261014-WA0023.jpg', '/Screenshot_20251016_171306_WhatsApp.jpg'].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Apartment container ref
  const apartmentRef = useRef<HTMLDivElement>(null);
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const joystickKnobRef = useRef<HTMLDivElement>(null);

  const openedPresentsCount = items.filter((i) => i.type === 'present' && i.unlocked).length;
  const allPresentsUnlocked = openedPresentsCount >= 3;

  // Collision detection and boundary movement
  const moveWithCollisions = useCallback(
    (nextX: number, nextY: number) => {
      const curX = playerPosRef.current.x;
      const curY = playerPosRef.current.y;

      // Outer boundary limits
      let clampedX = Math.max(5, Math.min(95, nextX));
      let clampedY = Math.max(8, Math.min(93, nextY));

      // 1. Horizontal Top Wall at Y = 31% (Doorway in center X: 43% to 57%)
      const crossingTopWall = (curY >= 31 && clampedY < 31) || (curY <= 31 && clampedY > 31);
      if (crossingTopWall) {
        const inCenterDoorway = clampedX > 43 && clampedX < 57;
        if (!inCenterDoorway || !allPresentsUnlocked) {
          clampedY = curY >= 31 ? 31.8 : 30.2;
        }
      }

      // 2. Left Vertical Wall at X = 26% (for Y > 31%, doorway gap is Y: 65% to 83%)
      if (clampedY > 31) {
        const crossingLeftWall = (curX <= 26 && clampedX > 26) || (curX >= 26 && clampedX < 26);
        const inLeftDoorway = clampedY > 65 && clampedY < 83;
        if (crossingLeftWall && !inLeftDoorway) {
          clampedX = curX <= 26 ? 25.2 : 26.8;
        }

        // 3. Right Vertical Wall at X = 74% (for Y > 31%, doorway gap is Y: 65% to 83%)
        const crossingRightWall = (curX <= 74 && clampedX > 74) || (curX >= 74 && clampedX < 74);
        const inRightDoorway = clampedY > 65 && clampedY < 83;
        if (crossingRightWall && !inRightDoorway) {
          clampedX = curX <= 74 ? 73.2 : 74.8;
        }
      }

      playerPosRef.current = { x: clampedX, y: clampedY };
      setPlayerPos({ x: clampedX, y: clampedY });

      // Update room status
      if (clampedY < 31) {
        setRoomInfo({ name: 'THE BIRTHDAY SANCTUARY', emoji: '👑', color: '#C084FC' });
      } else if (clampedX < 26) {
        setRoomInfo({ name: 'THE COZY BEDROOM', emoji: '🎀', color: '#F472B6' });
      } else if (clampedX > 74) {
        setRoomInfo({ name: 'THE SUNSHINE BALCONY', emoji: '🌼', color: '#2DD4BF' });
      } else {
        setRoomInfo({ name: 'THE LIVING LOUNGE', emoji: '🛋️', color: '#38BDF8' });
      }
    },
    [allPresentsUnlocked]
  );

  // Main 60fps RequestAnimationFrame Game Loop
  useEffect(() => {
    let animId: number;

    const gameLoop = (now: number) => {
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      if (!modalOpenRef.current) {
        let moveX = joystickVectorRef.current.x;
        let moveY = joystickVectorRef.current.y;

        const keys = keysRef.current;
        if (keys['w'] || keys['arrowup']) moveY -= 1;
        if (keys['s'] || keys['arrowdown']) moveY += 1;
        if (keys['a'] || keys['arrowleft']) moveX -= 1;
        if (keys['d'] || keys['arrowright']) moveX += 1;

        // Click-to-walk target vector
        if (moveX === 0 && moveY === 0 && targetPosRef.current) {
          const dx = targetPosRef.current.x - playerPosRef.current.x;
          const dy = targetPosRef.current.y - playerPosRef.current.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 1.2) {
            moveX = dx / dist;
            moveY = dy / dist;
          } else {
            targetPosRef.current = null;
          }
        }

        const mag = Math.hypot(moveX, moveY);
        if (mag > 0.05) {
          const normX = moveX / Math.max(1, mag);
          const normY = moveY / Math.max(1, mag);
          const speed = 28; // percentage units per second

          moveWithCollisions(
            playerPosRef.current.x + normX * speed * dt,
            playerPosRef.current.y + normY * speed * dt
          );

          if (normX < -0.1) setFacing('left');
          else if (normX > 0.1) setFacing('right');

          // Walking waddle wobble
          setWobbleDeg(Math.sin(now * 0.018) * 6);

          stepTimerRef.current += dt;
          if (stepTimerRef.current > 0.26) {
            audio.playFootstep();
            stepTimerRef.current = 0;
          }
        } else {
          setWobbleDeg(0);
        }
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [moveWithCollisions, audio]);

  // Keyboard navigation listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysRef.current[k] = true;
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) {
        targetPosRef.current = null;
      }
      if ((k === 'enter' || k === ' ') && !modalOpenRef.current) {
        // Trigger interaction with closest nearby item
        const p = playerPosRef.current;
        const nearby = items.find((i) => Math.hypot(p.x - i.x, p.y - i.y) < 14);
        if (nearby) {
          handleItemInteraction(nearby);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [items]);

  // Click anywhere on floor to walk
  const handleFloorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalOpenRef.current) return;
    const container = apartmentRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    targetPosRef.current = {
      x: Math.max(0, Math.min(100, clickX)),
      y: Math.max(0, Math.min(100, clickY)),
    };
    audio.playPop();
  };

  // Virtual Joystick touch & drag handler
  const handleJoystickPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (modalOpenRef.current) return;
    isDraggingJoystickRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handleJoystickPointerMove(e);
  };

  const handleJoystickPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingJoystickRef.current) return;
    const base = joystickBaseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxRadius = Math.min(rect.width, rect.height) * 0.32;

    let dx = e.clientX - centerX;
    let dy = e.clientY - centerY;

    const dist = Math.hypot(dx, dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    if (joystickKnobRef.current) {
      joystickKnobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }

    joystickVectorRef.current = {
      x: dx / maxRadius,
      y: dy / maxRadius,
    };
    targetPosRef.current = null;
  };

  const handleJoystickPointerUp = () => {
    isDraggingJoystickRef.current = false;
    if (joystickKnobRef.current) {
      joystickKnobRef.current.style.transform = 'translate(0px, 0px)';
    }
    joystickVectorRef.current = { x: 0, y: 0 };
  };

  // Open item modal or walk to item
  const handleItemInteraction = (item: InteractiveItem) => {
    if (modalOpenRef.current) return;
    const dist = Math.hypot(playerPosRef.current.x - item.x, playerPosRef.current.y - item.y);

    if (dist < 15) {
      if (item.type === 'present') {
        setActivePresent(item);
      } else if (item.type === 'envelope') {
        if (!allPresentsUnlocked) {
          audio.playPop();
          return;
        }
        setEnvelopeModalOpen(true);
      }
    } else {
      // Walk character near the clicked item
      targetPosRef.current = {
        x: item.x,
        y: Math.min(92, item.y + 7),
      };
      audio.playPop();
    }
  };

  // Handle present collect callback
  const handlePresentCollect = (unlockedId: string, updatedPhotoUrl?: string) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === unlockedId) {
          return {
            ...i,
            unlocked: true,
            photoUrl: updatedPhotoUrl && i.type === 'present' ? updatedPhotoUrl : (i as PresentItem).photoUrl,
          };
        }
        return i;
      })
    );
    setActivePresent(null);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center select-none h-full">
      {/* Top HUD Bar: Room Label and Present Counter */}
      <div className="w-full max-w-[min(100%,calc((100dvh-60px)*1.6))] neo-pill bg-white rounded-full px-3 sm:px-5 py-1 mb-1.5 flex items-center justify-between text-xs sm:text-sm font-extrabold tracking-wider shadow-[3px_3px_0px_#1E1B4B] flex-shrink-0">
        {/* Room Info with Live Color Dot */}
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full inline-block border border-deep-ink transition-colors"
            style={{ backgroundColor: roomInfo.color }}
          />
          <span className="uppercase text-deep-ink font-display font-bold text-[11px] sm:text-sm">
            {roomInfo.name}
          </span>
          <span className="text-sm">{roomInfo.emoji}</span>
        </div>

        {/* Right side: AudioToggle & Present Unlock Progress Counter */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="scale-85 sm:scale-95 origin-right">
            <AudioToggle />
          </div>
          <div className="flex items-center gap-1.5 text-deep-ink">
            <span className="text-coral text-sm sm:text-base">🎁</span>
            <span className="font-display font-bold text-[11px] sm:text-xs uppercase tracking-wider">
              {openedPresentsCount}/3 UNLOCKED
            </span>
          </div>
        </div>
      </div>

      {/* Main Apartment Container Viewport (Aspect 16:10 Landscape Game Canvas) */}
      <div className="w-full max-w-[min(100%,calc((100dvh-75px)*1.6))] aspect-[16/10] neo-card bg-[#FFFDF9] rounded-2xl sm:rounded-[28px] p-1 sm:p-2 relative flex items-center justify-center flex-shrink-0">
        <div
          ref={apartmentRef}
          onClick={handleFloorClick}
          className="relative w-full h-full bg-white border-[3px] sm:border-[4px] border-deep-ink overflow-hidden rounded-xl sm:rounded-2xl shadow-inner cursor-pointer"
        >
          {/* ================= ROOM 4: TOP FINAL SURPRISE ROOM (LAVENDER #F3E8FF) ================= */}
          <div className="absolute top-0 left-0 w-full h-[31%] bg-[#FAF8FF] border-b-[5px] border-deep-ink flex justify-center pointer-events-none">
            <div className="w-[38%] h-full bg-[#F3E8FF] relative flex flex-col items-center justify-center">
              {/* Golden Skylight Bar */}
              <div className="w-24 h-3 bg-yellow border-2 border-deep-ink absolute -top-1" />
              {/* Pink Carpet Runner */}
              <div className="w-16 h-full bg-[#FBCFE8]/80" />
            </div>
          </div>

          {/* ================= ROOM 1: BOTTOM-LEFT COZY BEDROOM (PINK #FDF2F8) ================= */}
          <div className="absolute bottom-0 left-0 w-[26%] h-[69%] bg-[#FDF2F8] pointer-events-none">
            {/* Pink Bed */}
            <div className="absolute top-6 left-5 w-20 sm:w-24 h-28 sm:h-36 bg-[#F472B6] border-[3px] border-deep-ink rounded-xl p-2 flex flex-col shadow-sm">
              <div className="w-full h-8 sm:h-10 bg-white border-2 border-deep-ink rounded-md" />
            </div>
            {/* Lamp Icon */}
            <div className="absolute top-5 left-[112px] sm:left-[126px] flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-deep-ink flex items-center justify-center text-sm shadow-sm">
                💡
              </div>
              <span className="text-[10px] font-bold text-slate-600 mt-0.5">Lamp</span>
            </div>
          </div>

          {/* ================= ROOM 2: BOTTOM-CENTER LIVING LOUNGE (CREAM #FEFCE8) ================= */}
          <div className="absolute bottom-0 left-[26%] w-[48%] h-[69%] bg-[#FEFCE8] pointer-events-none">
            {/* TV Icon */}
            <div className="absolute top-4 left-[18%] flex flex-col items-center">
              <div className="w-8 h-7 rounded bg-white border-2 border-deep-ink flex items-center justify-center text-xs shadow-sm">
                📺
              </div>
              <span className="text-[10px] font-bold text-slate-600 mt-0.5">TV</span>
            </div>

            {/* Dashed Oval Rug + Coffee Table + Blue Sofa */}
            <div className="absolute top-[34%] left-1/2 -translate-x-1/2 w-[56%] h-[36%] rounded-[50%] bg-[#E0F2FE] border-[2.5px] border-dashed border-deep-ink flex items-center justify-center">
              {/* Orange Coffee Table */}
              <div className="w-14 sm:w-16 h-9 sm:h-10 bg-[#FDBA74] border-[2.5px] border-deep-ink rounded-lg shadow-sm" />
            </div>
            {/* Blue Sofa */}
            <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 w-24 sm:w-28 h-11 sm:h-12 bg-[#38BDF8] border-[2.5px] border-deep-ink rounded-xl shadow-sm" />
          </div>

          {/* ================= ROOM 3: BOTTOM-RIGHT SUNSHINE BALCONY (YELLOW #FEF9C3) ================= */}
          <div className="absolute bottom-0 right-0 w-[26%] h-[69%] bg-[#FEF9C3] pointer-events-none">
            {/* Flowers Icon */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-deep-ink flex items-center justify-center text-sm shadow-sm">
                🌸
              </div>
              <span className="text-[10px] font-bold text-slate-600 mt-0.5">Flowers</span>
            </div>

            {/* Round Balcony Table */}
            <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-24 sm:w-28 h-24 sm:h-28 rounded-full bg-yellow border-[3px] border-deep-ink shadow-sm" />
          </div>

          {/* ================= INTERIOR DIVIDING WALLS WITH DOORWAY GAPS ================= */}
          {/* Left Vertical Wall (Between Bedroom & Living Lounge) */}
          <div className="absolute top-[31%] left-[26%] w-[5px] h-[35%] bg-deep-ink -translate-x-1/2 rounded-b-full pointer-events-none" />
          <div className="absolute bottom-0 left-[26%] w-[5px] h-[18%] bg-deep-ink -translate-x-1/2 rounded-t-full pointer-events-none" />

          {/* Right Vertical Wall (Between Living Lounge & Balcony) */}
          <div className="absolute top-[31%] left-[74%] w-[5px] h-[35%] bg-deep-ink -translate-x-1/2 rounded-b-full pointer-events-none" />
          <div className="absolute bottom-0 left-[74%] w-[5px] h-[18%] bg-deep-ink -translate-x-1/2 rounded-t-full pointer-events-none" />

          {/* Top Doorway Lock Barrier (Center of Top Wall at Y = 31%) */}
          <div className="absolute top-[31%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[16%] h-4 flex items-center justify-center z-10 pointer-events-none">
            <div
              className={`w-full h-1.5 border-b-4 border-dashed border-amber-500 bg-white transition-opacity duration-700 ${
                allPresentsUnlocked ? 'opacity-20' : 'opacity-100'
              }`}
            />
            <div
              className={`w-7 h-7 rounded-full border-[2.5px] border-deep-ink flex items-center justify-center text-xs shadow-md absolute transition-colors ${
                allPresentsUnlocked ? 'bg-turquoise' : 'bg-yellow'
              }`}
            >
              {allPresentsUnlocked ? '🔓' : '🔒'}
            </div>
          </div>

          {/* ================= INTERACTIVE NODES LAYER ON FLOOR (Z-10) ================= */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {items.map((item) => {
              const dist = Math.hypot(playerPos.x - item.x, playerPos.y - item.y);
              const isNear = dist < 14;

              return (
                <div
                  key={item.id}
                  id={`node-${item.id}`}
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center select-none pointer-events-auto cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemInteraction(item);
                  }}
                >
                  {/* Icon container */}
                  <div
                    className={`relative cursor-pointer transition-transform duration-200 ${
                      isNear ? 'scale-110' : 'hover:scale-105'
                    }`}
                  >
                    {/* Checkmark badge if unlocked */}
                    {item.unlocked && (
                      <div className="w-5 h-5 rounded-full bg-turquoise border-2 border-deep-ink flex items-center justify-center text-[10px] font-black text-deep-ink absolute -top-2 -right-2 z-20 shadow">
                        ✓
                      </div>
                    )}

                    {item.type === 'present' ? (
                      /* 3D-Look Vector Present Box */
                      <div className="w-12 h-11 sm:w-14 sm:h-12">
                        <svg
                          viewBox="0 0 64 60"
                          className="w-full h-full overflow-visible drop-shadow-[0_3px_0px_rgba(30,27,75,0.25)]"
                        >
                          <ellipse
                            cx="26"
                            cy="10"
                            rx="8"
                            ry="5"
                            transform="rotate(-15 26 10)"
                            fill="#FDE047"
                            stroke="#1E1B4B"
                            strokeWidth="3"
                          />
                          <ellipse
                            cx="38"
                            cy="10"
                            rx="8"
                            ry="5"
                            transform="rotate(15 38 10)"
                            fill="#FDE047"
                            stroke="#1E1B4B"
                            strokeWidth="3"
                          />
                          <rect
                            x="8"
                            y="13"
                            width="48"
                            height="11"
                            rx="3"
                            fill={item.boxColor}
                            stroke="#1E1B4B"
                            strokeWidth="3.2"
                          />
                          <rect
                            x="11"
                            y="24"
                            width="42"
                            height="28"
                            rx="4"
                            fill={item.boxColor}
                            stroke="#1E1B4B"
                            strokeWidth="3.2"
                          />
                          <rect
                            x="28"
                            y="13"
                            width="8"
                            height="39"
                            fill="#FDE047"
                            stroke="#1E1B4B"
                            strokeWidth="2.8"
                          />
                          <rect
                            x="11"
                            y="34"
                            width="42"
                            height="7"
                            fill="#FDE047"
                            stroke="#1E1B4B"
                            strokeWidth="2.8"
                          />
                        </svg>
                      </div>
                    ) : (
                      /* Royal Golden Envelope in Sanctuary */
                      <div className="w-14 h-11 sm:w-16 sm:h-12">
                        <svg
                          viewBox="0 0 70 52"
                          className="w-full h-full overflow-visible drop-shadow-[0_4px_0px_rgba(30,27,75,0.28)]"
                        >
                          <rect
                            x="4"
                            y="6"
                            width="62"
                            height="40"
                            rx="5"
                            fill="#FBBF24"
                            stroke="#1E1B4B"
                            strokeWidth="3.2"
                          />
                          <path
                            d="M5 45 L35 24 L65 45"
                            fill="#F59E0B"
                            stroke="#1E1B4B"
                            strokeWidth="3"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M5 7 L35 28 L65 7"
                            fill="#FDE047"
                            stroke="#1E1B4B"
                            strokeWidth="3.2"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="35"
                            cy="25"
                            r="6"
                            fill="#C084FC"
                            stroke="#1E1B4B"
                            strokeWidth="2.5"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Item Label Badge */}
                  <div className="mt-1 px-2.5 py-0.5 rounded-full bg-white border-2 border-deep-ink text-[9px] sm:text-[10px] font-display font-extrabold tracking-wide text-deep-ink whitespace-nowrap shadow-sm">
                    {item.title}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================= DRESSED SISTER AVATAR CHARACTER (Z-20) ================= */}
          <div
            className="absolute z-20 w-14 h-16 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-75"
            style={{
              left: `${playerPos.x}%`,
              top: `${playerPos.y}%`,
            }}
          >
            <div
              className="w-full h-full relative"
              style={{
                transform: `scaleX(${facing === 'left' ? -1 : 1}) rotate(${wobbleDeg}deg)`,
              }}
            >
              <svg
                viewBox="0 0 100 120"
                className="w-full h-full overflow-visible drop-shadow-[0_4px_3px_rgba(30,27,75,0.22)]"
              >
                {/* Ground shadow */}
                <ellipse cx="50" cy="110" rx="22" ry="5" fill="rgba(30,27,75,0.25)" />
                {/* Walking Legs */}
                <path d="M38 95 L36 108" stroke="#D97706" strokeWidth="4" strokeLinecap="round" />
                <path d="M62 95 L64 108" stroke="#D97706" strokeWidth="4" strokeLinecap="round" />
                {/* Body */}
                <ellipse cx="50" cy="66" rx="26" ry="30" fill="#FACC15" stroke="#1E1B4B" strokeWidth="4" />
                {/* Birthday Dress Trim */}
                <path d="M25 74 Q50 84 75 74" fill="none" stroke="#FF6B8B" strokeWidth="5" strokeLinecap="round" />
                <circle cx="50" cy="77" r="4" fill="#FF6B8B" stroke="#1E1B4B" strokeWidth="2.5" />
                {/* Arms */}
                <path d="M24 66 Q14 70 16 60" fill="none" stroke="#1E1B4B" strokeWidth="4" strokeLinecap="round" />
                <path d="M76 66 Q88 56 88 48" fill="none" stroke="#1E1B4B" strokeWidth="4" strokeLinecap="round" />
                {/* Eyes */}
                <circle cx="40" cy="55" r="6" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="3" />
                <circle cx="41.5" cy="55" r="2.8" fill="#1E1B4B" />
                <circle cx="60" cy="55" r="6" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="3" />
                <circle cx="61.5" cy="55" r="2.8" fill="#1E1B4B" />
                {/* Smile & Rosy Cheeks */}
                <ellipse cx="32" cy="62" rx="4" ry="2" fill="#FB7185" />
                <ellipse cx="68" cy="62" rx="4" ry="2" fill="#FB7185" />
                <path d="M45 63 Q50 68 55 63" fill="none" stroke="#1E1B4B" strokeWidth="3" strokeLinecap="round" />
                {/* Birthday Party Hat */}
                <polygon
                  points="35,38 50,10 65,38"
                  fill="#FF6B8B"
                  stroke="#1E1B4B"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />
                <path d="M40 28 L60 28" stroke="#FDE047" strokeWidth="4" />
                <circle cx="50" cy="9" r="5" fill="#2DD4BF" stroke="#1E1B4B" strokeWidth="2.5" />
              </svg>
            </div>
          </div>

          {/* ================= ON-SCREEN VIRTUAL JOYSTICK (Z-30) ================= */}
          <div
            ref={joystickBaseRef}
            onPointerDown={handleJoystickPointerDown}
            onPointerMove={handleJoystickPointerMove}
            onPointerUp={handleJoystickPointerUp}
            onPointerCancel={handleJoystickPointerUp}
            className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 border-[2.5px] sm:border-[3.5px] border-deep-ink shadow-[2.5px_2.5px_0px_#1E1B4B] flex items-center justify-center z-30 touch-none cursor-grab active:cursor-grabbing"
            title="Touch or Drag to walk"
          >
            <div
              ref={joystickKnobRef}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-turquoise border-[2px] sm:border-[2.5px] border-deep-ink shadow-inner pointer-events-none transition-transform duration-75"
            />
          </div>

          {/* ================= FLOATING INTERACTION "OPEN" BUTTONS (Z-40: TOP-MOST ABOVE PLAYER & ALL ELEMENTS) ================= */}
          <div className="absolute inset-0 z-40 pointer-events-none">
            {items.map((item) => {
              const dist = Math.hypot(playerPos.x - item.x, playerPos.y - item.y);
              const isNear = dist < 14;
              const canOpen = item.type === 'present' || (item.type === 'envelope' && allPresentsUnlocked);

              if (!isNear || !canOpen) return null;

              return (
                <div
                  key={`action-btn-${item.id}`}
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-[135%] flex flex-col items-center pointer-events-auto z-40"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemInteraction(item);
                    }}
                    className="open-item-btn neo-btn px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-coral hover:bg-coral-dark text-white font-display font-extrabold text-xs sm:text-sm tracking-wider uppercase animate-bounce cursor-pointer shadow-[3px_3px_0px_#1E1B4B] active:translate-y-0.5"
                    style={{ touchAction: 'manipulation' }}
                  >
                    {item.unlocked ? 'OPEN AGAIN' : 'OPEN'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Desktop Controls Helper Badge (Bottom-Right) */}
          <div className="hidden sm:flex items-center gap-1.5 absolute bottom-4 right-4 bg-white/90 neo-btn px-3 py-1.5 rounded-full text-[11px] font-bold text-deep-ink z-20 pointer-events-none">
            <span>🕹️ Drag Joystick, use <b>WASD / Arrows</b>, or <b>Click floor</b> to walk!</span>
          </div>
        </div>
      </div>

      {/* 3D Present Reveal Modal */}
      {activePresent && (
        <PresentBoxModal
          key={activePresent.id}
          present={activePresent}
          onClose={handlePresentCollect}
        />
      )}

      {/* 3D Cinematic Envelope & Origami Tri-Fold Letter Modal */}
      {envelopeModalOpen && (
        <CinematicEnvelopeModal
          onClose={() => setEnvelopeModalOpen(false)}
        />
      )}
    </div>
  );
};

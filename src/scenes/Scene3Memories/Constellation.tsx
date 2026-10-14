import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useAdventure } from '../../context/AdventureContext';
import { BIRTHDAY_DATA } from '../../config/birthdayData';
import { Sparkles, Heart, Star, Feather, Check } from 'lucide-react';

export const Constellation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { exploredMemoryIds, openMemoryModal } = useAdventure();
  const pointerPos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    // 1. Background Starlight Field (180 stars)
    const starCount = 180;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 16;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;

      // Mix of soft champagne gold, ivory, and faint rose
      const colorChoice = Math.random();
      if (colorChoice < 0.6) {
        starColors[i * 3] = 0.97;
        starColors[i * 3 + 1] = 0.94;
        starColors[i * 3 + 2] = 0.90; // Ivory
      } else if (colorChoice < 0.85) {
        starColors[i * 3] = 0.85;
        starColors[i * 3 + 1] = 0.72;
        starColors[i * 3 + 2] = 0.47; // Gold
      } else {
        starColors[i * 3] = 0.85;
        starColors[i * 3 + 1] = 0.64;
        starColors[i * 3 + 2] = 0.67; // Rose
      }
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 2. Constellation Connecting Lines
    // Coordinates for the 4 memory nodes
    const nodeCoords = [
      new THREE.Vector3(-2.2, 0.8, 0),
      new THREE.Vector3(1.8, 1.3, -0.4),
      new THREE.Vector3(2.0, -0.8, 0.3),
      new THREE.Vector3(-1.0, -1.4, 0.2),
    ];

    const linePoints = [
      nodeCoords[0],
      nodeCoords[1],
      nodeCoords[1],
      nodeCoords[2],
      nodeCoords[2],
      nodeCoords[3],
      nodeCoords[3],
      nodeCoords[0],
      nodeCoords[0],
      nodeCoords[2], // Cross filament
    ];

    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xd9b779,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const constellationLines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(constellationLines);

    // Pointer Parallax Handler
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointerPos.current.targetX = x * 0.6;
      pointerPos.current.targetY = y * 0.4;
    };

    window.addEventListener('pointermove', handlePointerMove);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth camera tilt
      pointerPos.current.x += (pointerPos.current.targetX - pointerPos.current.x) * 0.05;
      pointerPos.current.y += (pointerPos.current.targetY - pointerPos.current.y) * 0.05;

      camera.position.x = pointerPos.current.x;
      camera.position.y = pointerPos.current.y;
      camera.lookAt(0, 0, 0);

      // Star field subtle drift & twinkle
      starField.rotation.y = elapsed * 0.02;
      constellationLines.rotation.y = elapsed * 0.01;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 360;
      const newH = container.clientHeight || 450;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      starGeo.dispose();
      starMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const getMemoryIcon = (icon?: string) => {
    switch (icon) {
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-gold-400" />;
      case 'heart':
        return <Heart className="w-5 h-5 text-rose-400" />;
      case 'feather':
        return <Feather className="w-5 h-5 text-gold-300" />;
      default:
        return <Star className="w-5 h-5 text-amber-400" />;
    }
  };

  // 4 Memory Nodes mapped onto responsive positions
  // Desktop / Mobile layouts
  const nodePositions = [
    { top: '22%', left: '16%' },
    { top: '18%', right: '16%' },
    { bottom: '26%', right: '18%' },
    { bottom: '24%', left: '20%' },
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[28rem] sm:h-[34rem] max-w-2xl mx-auto flex items-center justify-center select-none"
    >
      {/* Interactive Floating Memory Badges on Constellation */}
      {BIRTHDAY_DATA.memories.map((mem, idx) => {
        const isExplored = exploredMemoryIds.includes(mem.id);
        const pos = nodePositions[idx] || { top: '50%', left: '50%' };

        return (
          <button
            key={mem.id}
            onClick={() => openMemoryModal(mem)}
            style={pos}
            className={`group absolute z-20 flex flex-col items-center transition-all duration-500 focus:outline-none focus:scale-110 active:scale-95 ${
              isExplored ? 'opacity-95' : 'opacity-100 animate-soft-float'
            }`}
            aria-label={`Inspect memory: ${mem.title}`}
          >
            {/* Luminous Node Orb */}
            <div
              className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-xl ${
                isExplored
                  ? 'bg-plum-900/90 border-2 border-gold-400 shadow-gold-400/20'
                  : 'bg-plum-800/80 border-2 border-amber-400/60 shadow-amber-400/30 group-hover:border-gold-300 group-hover:scale-110 animate-pulse'
              }`}
            >
              {/* Outer pulsing ring for unread memories */}
              {!isExplored && (
                <div className="absolute inset-0 rounded-full border border-amber-400/40 animate-ping opacity-60" />
              )}

              {/* Explored checkmark badge */}
              {isExplored && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold-400 text-plum-950 flex items-center justify-center shadow">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              {getMemoryIcon(mem.accentIcon)}
            </div>

            {/* Label Underneath Node */}
            <div className="mt-2 text-center max-w-[120px]">
              <span className="block text-[11px] sm:text-xs font-serif font-semibold text-ivory tracking-wide group-hover:text-gold-300 transition-colors drop-shadow-md">
                {mem.title}
              </span>
              <span className="block text-[9px] uppercase tracking-wider text-gold-400/70 font-sans">
                {mem.subtitle || 'Chapter'}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

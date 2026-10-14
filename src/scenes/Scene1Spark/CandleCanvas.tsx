import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

interface CandleCanvasProps {
  isExtinguished: boolean;
  onExtinguish: () => void;
}

export const CandleCanvas: React.FC<CandleCanvasProps> = ({ isExtinguished, onExtinguish }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerPos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const isExtinguishedRef = useRef(isExtinguished);
  isExtinguishedRef.current = isExtinguished;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 6.2);
    camera.lookAt(0, 0.3, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0x281932, 1.2);
    scene.add(ambientLight);

    const flameLight = new THREE.PointLight(0xf3bd70, 3.2, 12);
    flameLight.position.set(0, 1.3, 0.2);
    scene.add(flameLight);

    const softRimLight = new THREE.DirectionalLight(0xd9b779, 0.8);
    softRimLight.position.set(2, 4, 3);
    scene.add(softRimLight);

    // 3. Candle Group
    const candleGroup = new THREE.Group();
    scene.add(candleGroup);

    // Candle Wax Body (Tapered cylinder)
    const waxGeo = new THREE.CylinderGeometry(0.7, 0.76, 2.6, 32);
    const waxMat = new THREE.MeshStandardMaterial({
      color: 0xf8f0e5,
      roughness: 0.3,
      metalness: 0.05,
    });
    const waxMesh = new THREE.Mesh(waxGeo, waxMat);
    waxMesh.position.y = -0.5;
    candleGroup.add(waxMesh);

    // Wax top rim depression
    const rimGeo = new THREE.TorusGeometry(0.68, 0.06, 16, 32);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xf3ebd7,
      roughness: 0.4,
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 0.8;
    candleGroup.add(rimMesh);

    // Candle Wick
    const wickGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.35, 12);
    const wickMat = new THREE.MeshBasicMaterial({ color: 0x1f1715 });
    const wickMesh = new THREE.Mesh(wickGeo, wickMat);
    wickMesh.position.set(0, 0.95, 0);
    wickMesh.rotation.z = 0.08;
    candleGroup.add(wickMesh);

    // 4. Layered Organic Flame
    const flameGroup = new THREE.Group();
    flameGroup.position.set(0, 1.15, 0);
    candleGroup.add(flameGroup);

    // Outer warm halo flame
    const outerFlameGeo = new THREE.ConeGeometry(0.24, 0.8, 24);
    outerFlameGeo.translate(0, 0.4, 0);
    const outerFlameMat = new THREE.MeshBasicMaterial({
      color: 0xe07a5f,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const outerFlame = new THREE.Mesh(outerFlameGeo, outerFlameMat);
    flameGroup.add(outerFlame);

    // Core bright golden flame
    const coreFlameGeo = new THREE.ConeGeometry(0.16, 0.65, 24);
    coreFlameGeo.translate(0, 0.325, 0);
    const coreFlameMat = new THREE.MeshBasicMaterial({
      color: 0xf3bd70,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const coreFlame = new THREE.Mesh(coreFlameGeo, coreFlameMat);
    flameGroup.add(coreFlame);

    // Inner white hot spark
    const innerHotGeo = new THREE.ConeGeometry(0.08, 0.35, 16);
    innerHotGeo.translate(0, 0.175, 0);
    const innerHotMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const innerHot = new THREE.Mesh(innerHotGeo, innerHotMat);
    flameGroup.add(innerHot);

    // 5. Smoke Particles Setup
    const smokeCount = 35;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePositions = new Float32Array(smokeCount * 3);
    const smokeAlphas = new Float32Array(smokeCount);
    const smokeVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < smokeCount; i++) {
      smokePositions[i * 3] = 0;
      smokePositions[i * 3 + 1] = 1.0;
      smokePositions[i * 3 + 2] = 0;
      smokeAlphas[i] = 0.0;
      smokeVelocities.push({
        x: (Math.random() - 0.5) * 0.015,
        y: 0.025 + Math.random() * 0.03,
        z: (Math.random() - 0.5) * 0.015,
      });
    }

    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
    const smokeMat = new THREE.PointsMaterial({
      color: 0xd9b779,
      size: 0.18,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const smokeParticles = new THREE.Points(smokeGeo, smokeMat);
    scene.add(smokeParticles);

    // 6. Glowing Ember Point (remains after extinguishing)
    const emberGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const emberMat = new THREE.MeshBasicMaterial({
      color: 0xf3bd70,
      transparent: true,
      opacity: 0,
    });
    const emberMesh = new THREE.Mesh(emberGeo, emberMat);
    emberMesh.position.set(0, 1.02, 0);
    candleGroup.add(emberMesh);

    // Handle Pointer Movement for Parallax & Flame Tilt
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointerPos.current.targetX = x * 0.4;
      pointerPos.current.targetY = y * 0.3;
    };

    window.addEventListener('pointermove', handlePointerMove);

    // Extinguish Animation Coordinator
    let smokeActive = false;
    const triggerExtinguishAnimation = () => {
      // 1. Shrink and flicker out flame
      gsap.to(flameGroup.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 0.3,
        ease: 'power3.in',
      });
      gsap.to(flameLight, {
        intensity: 0.2,
        duration: 0.4,
        ease: 'power2.out',
      });

      // 2. Activate smoke particles
      smokeActive = true;
      gsap.to(smokeMat, {
        opacity: 0.45,
        duration: 0.5,
      });

      // 3. Reveal and pulse glowing ember
      gsap.to(emberMat, {
        opacity: 1,
        duration: 0.6,
        delay: 0.2,
        onComplete: () => {
          gsap.to(emberMesh.scale, {
            x: 2.5,
            y: 2.5,
            z: 2.5,
            duration: 1.2,
            repeat: 1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        },
      });
    };

    // Render Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth pointer interpolation
      pointerPos.current.x += (pointerPos.current.targetX - pointerPos.current.x) * 0.06;
      pointerPos.current.y += (pointerPos.current.targetY - pointerPos.current.y) * 0.06;

      candleGroup.rotation.y = pointerPos.current.x * 0.35;
      candleGroup.rotation.x = -pointerPos.current.y * 0.2;

      // Flame organic flicker if alive
      if (!isExtinguishedRef.current) {
        const noise = Math.sin(elapsed * 9) * 0.08 + Math.cos(elapsed * 17) * 0.04;
        const scaleFlicker = 1.0 + Math.sin(elapsed * 12) * 0.05;

        flameGroup.scale.set(
          scaleFlicker,
          scaleFlicker * (1.0 + noise * 0.5),
          scaleFlicker
        );

        // Flame leans with pointer inertia
        flameGroup.rotation.z = -pointerPos.current.x * 0.4 + noise * 0.15;
        flameGroup.rotation.x = pointerPos.current.y * 0.3 + Math.sin(elapsed * 14) * 0.05;
        flameLight.intensity = 3.0 + noise * 0.8;
      } else if (smokeActive) {
        // Animate rising smoke
        const posAttr = smokeGeo.attributes.position as THREE.BufferAttribute;
        const posArray = posAttr.array as Float32Array;

        for (let i = 0; i < smokeCount; i++) {
          posArray[i * 3 + 1] += smokeVelocities[i].y;
          posArray[i * 3] += Math.sin(elapsed * 3 + i) * 0.005 + smokeVelocities[i].x;
          posArray[i * 3 + 2] += Math.cos(elapsed * 3 + i) * 0.005 + smokeVelocities[i].z;

          if (posArray[i * 3 + 1] > 3.2) {
            posArray[i * 3 + 1] = 1.0;
            posArray[i * 3] = (Math.random() - 0.5) * 0.05;
            posArray[i * 3 + 2] = (Math.random() - 0.5) * 0.05;
          }
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Check prop changes
    const checkExtinguish = () => {
      if (isExtinguishedRef.current) {
        triggerExtinguishAnimation();
      }
    };
    checkExtinguish();

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 320;
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
      waxGeo.dispose();
      waxMat.dispose();
      rimGeo.dispose();
      rimMat.dispose();
      wickGeo.dispose();
      wickMat.dispose();
      outerFlameGeo.dispose();
      outerFlameMat.dispose();
      coreFlameGeo.dispose();
      coreFlameMat.dispose();
      innerHotGeo.dispose();
      innerHotMat.dispose();
      smokeGeo.dispose();
      smokeMat.dispose();
      emberGeo.dispose();
      emberMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Watch for isExtinguished state update from parent
  useEffect(() => {
    isExtinguishedRef.current = isExtinguished;
  }, [isExtinguished]);

  return (
    <div
      ref={containerRef}
      onClick={!isExtinguished ? onExtinguish : undefined}
      className={`relative w-full h-80 sm:h-96 max-w-sm mx-auto flex items-center justify-center cursor-pointer transition-transform duration-500 ${
        !isExtinguished ? 'hover:scale-105 active:scale-95' : 'pointer-events-none'
      }`}
      aria-label={isExtinguished ? "Candle is extinguished" : "Interactive candle: tap or click to blow out"}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (!isExtinguished && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onExtinguish();
        }
      }}
    />
  );
};

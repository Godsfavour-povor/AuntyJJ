import React, { useMemo } from 'react';

interface FlowerPetal {
  id: number;
  type: 'cherry' | 'daisy' | 'coral' | 'violet' | 'leaf' | 'sparkle';
  left: number; // percentage 1-98
  size: number; // px 16-34
  fallDuration: number; // seconds
  fallDelay: number; // seconds
  swayDuration: number; // seconds
  swayOffset: number; // px
  initialRotation: number; // degrees
}

export const InfiniteFlowerShower: React.FC = () => {
  // Generate 42 varied falling floral elements with staggered delays for continuous flow
  const flowers = useMemo<FlowerPetal[]>(() => {
    const types: FlowerPetal['type'][] = ['cherry', 'daisy', 'coral', 'violet', 'leaf', 'sparkle'];
    return Array.from({ length: 42 }).map((_, i) => ({
      id: i,
      type: types[i % types.length],
      left: Math.random() * 94 + 3,
      size: Math.floor(Math.random() * 16) + 18, // 18px to 34px
      fallDuration: Math.random() * 2.5 + 3.5, // 3.5s to 6.0s
      fallDelay: (i / 42) * 5.0, // Staggered delays create instant continuous stream
      swayDuration: Math.random() * 1.5 + 2.0, // 2s to 3.5s
      swayOffset: Math.random() * 30 + 15,
      initialRotation: Math.floor(Math.random() * 360),
    }));
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-40 overflow-hidden"
      aria-hidden="true"
    >
      {flowers.map((f) => (
        <div
          key={f.id}
          className="absolute top-0"
          style={{
            left: `${f.left}%`,
            animation: `flowerFall ${f.fallDuration}s linear infinite`,
            animationDelay: `-${f.fallDelay}s`, // Negative delay makes them already raining on mount!
          }}
        >
          <div
            style={{
              animation: `flowerSway ${f.swayDuration}s ease-in-out infinite alternate`,
              transform: `rotate(${f.initialRotation}deg)`,
            }}
          >
            {/* Flower Type 1: 5-Petal Cherry Blossom */}
            {f.type === 'cherry' && (
              <svg width={f.size} height={f.size} viewBox="0 0 40 40" className="drop-shadow-sm">
                <circle cx="20" cy="11" r="7" fill="#FDA4AF" />
                <circle cx="28" cy="17" r="7" fill="#FDA4AF" />
                <circle cx="25" cy="27" r="7" fill="#FDA4AF" />
                <circle cx="15" cy="27" r="7" fill="#FDA4AF" />
                <circle cx="12" cy="17" r="7" fill="#FDA4AF" />
                <circle cx="20" cy="20" r="4.5" fill="#FDE047" stroke="#FB7185" strokeWidth="1" />
              </svg>
            )}

            {/* Flower Type 2: Golden Daisy */}
            {f.type === 'daisy' && (
              <svg width={f.size} height={f.size} viewBox="0 0 40 40" className="drop-shadow-sm">
                <circle cx="20" cy="10" r="5.5" fill="#FFFFFF" />
                <circle cx="27" cy="13" r="5.5" fill="#FFFFFF" />
                <circle cx="30" cy="20" r="5.5" fill="#FFFFFF" />
                <circle cx="27" cy="27" r="5.5" fill="#FFFFFF" />
                <circle cx="20" cy="30" r="5.5" fill="#FFFFFF" />
                <circle cx="13" cy="27" r="5.5" fill="#FFFFFF" />
                <circle cx="10" cy="20" r="5.5" fill="#FFFFFF" />
                <circle cx="13" cy="13" r="5.5" fill="#FFFFFF" />
                <circle cx="20" cy="20" r="6" fill="#FACC15" />
              </svg>
            )}

            {/* Flower Type 3: Coral Hibiscus Petal */}
            {f.type === 'coral' && (
              <svg width={f.size} height={f.size} viewBox="0 0 30 30" className="drop-shadow-sm">
                <path
                  d="M 15,3 C 24,5 28,16 22,25 C 16,28 7,22 5,14 C 4,9 10,2 15,3 Z"
                  fill="#FB7185"
                  opacity="0.9"
                />
                <path d="M 15,5 Q 16,16 19,23" stroke="#F43F5E" strokeWidth="1.5" fill="none" />
              </svg>
            )}

            {/* Flower Type 4: Violet / Lilac Floating Petal */}
            {f.type === 'violet' && (
              <svg width={f.size} height={f.size} viewBox="0 0 30 30" className="drop-shadow-sm">
                <ellipse cx="15" cy="15" rx="7" ry="12" fill="#C084FC" opacity="0.85" />
                <ellipse cx="15" cy="15" rx="3.5" ry="7" fill="#E9D5FF" />
              </svg>
            )}

            {/* Flower Type 5: Mint Fresh Spring Leaf */}
            {f.type === 'leaf' && (
              <svg width={f.size} height={f.size} viewBox="0 0 30 30" className="drop-shadow-sm">
                <path
                  d="M 5,25 Q 10,8 25,5 Q 22,22 5,25 Z"
                  fill="#4ADE80"
                  opacity="0.85"
                />
                <path d="M 5,25 Q 15,16 25,5" stroke="#16A34A" strokeWidth="1" fill="none" />
              </svg>
            )}

            {/* Flower Type 6: Golden Celebration Sparkle */}
            {f.type === 'sparkle' && (
              <svg width={f.size * 0.8} height={f.size * 0.8} viewBox="0 0 24 24">
                <path
                  d="M 12,0 Q 12,12 24,12 Q 12,12 12,24 Q 12,12 0,12 Q 12,12 12,0 Z"
                  fill="#FBBF24"
                  opacity="0.9"
                />
              </svg>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

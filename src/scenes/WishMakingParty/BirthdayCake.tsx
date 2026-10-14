import React from 'react';

interface BirthdayCakeProps {
  candlesBlown: boolean;
  isBlowing?: boolean;
  onBlowCandles: () => void;
}

export const BirthdayCake: React.FC<BirthdayCakeProps> = ({
  candlesBlown,
  isBlowing = false,
  onBlowCandles,
}) => {
  return (
    <div
      onClick={!candlesBlown ? onBlowCandles : undefined}
      className={`relative w-72 sm:w-80 h-72 mx-auto flex items-center justify-center select-none cursor-pointer transition-transform duration-300 ${
        !candlesBlown ? 'hover:scale-105 active:scale-95' : ''
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (!candlesBlown && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onBlowCandles();
        }
      }}
      aria-label={candlesBlown ? "Birthday cake with extinguished candles" : "Birthday cake: blow out candles"}
    >
      <svg
        viewBox="0 0 280 260"
        className="w-full h-full drop-shadow-2xl overflow-visible"
      >
        {/* Ceramic Cake Pedestal Stand */}
        <ellipse cx="140" cy="242" rx="72" ry="12" fill="#E2E8F0" stroke="#1E1B4B" strokeWidth="3" />
        <path d="M 125,242 L 122,210 L 158,210 L 155,242 Z" fill="#F8FAFC" stroke="#1E1B4B" strokeWidth="3" />
        <ellipse cx="140" cy="210" rx="98" ry="16" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="3.5" />

        {/* Tier 1: Bottom Cake Layer (Warm Peach / Vanilla) */}
        <path
          d="M 52,150 L 52,204 C 52,222 228,222 228,204 L 228,150 Z"
          fill="#FDBA74"
          stroke="#1E1B4B"
          strokeWidth="3.5"
        />
        {/* Tier 1 Top Oval */}
        <ellipse cx="140" cy="150" rx="88" ry="20" fill="#FED7AA" stroke="#1E1B4B" strokeWidth="3.5" />

        {/* Tier 1 Decorative Frosting Drips */}
        <path
          d="M 52,150 C 65,168 80,168 95,152 C 110,172 130,172 145,152 C 160,170 180,170 195,152 C 210,168 220,165 228,150"
          fill="#FFFDF8"
          stroke="#1E1B4B"
          strokeWidth="3"
        />

        {/* Sprinkles on Tier 1 */}
        <circle cx="85" cy="185" r="3" fill="#FB7185" />
        <circle cx="115" cy="192" r="3" fill="#2DD4BF" />
        <circle cx="165" cy="188" r="3" fill="#C084FC" />
        <circle cx="195" cy="190" r="3" fill="#FDE047" />

        {/* Tier 2: Top Cake Layer (Butter Yellow) */}
        <path
          d="M 80,95 L 80,145 C 80,160 200,160 200,145 L 200,95 Z"
          fill="#FDE047"
          stroke="#1E1B4B"
          strokeWidth="3.5"
        />
        {/* Tier 2 Top Oval */}
        <ellipse cx="140" cy="95" rx="60" ry="16" fill="#FEF08A" stroke="#1E1B4B" strokeWidth="3.5" />

        {/* Tier 2 Frosting Drips */}
        <path
          d="M 80,95 C 92,112 108,112 120,97 C 132,114 148,114 160,97 C 172,112 188,112 200,95"
          fill="#FFFDF8"
          stroke="#1E1B4B"
          strokeWidth="3"
        />

        {/* Sprinkles on Tier 2 */}
        <circle cx="110" cy="125" r="2.8" fill="#FB7185" />
        <circle cx="140" cy="132" r="2.8" fill="#2DD4BF" />
        <circle cx="170" cy="128" r="2.8" fill="#C084FC" />

        {/* Physical Wind Stream Lines during blow */}
        {isBlowing && (
          <g stroke="#38BDF8" strokeWidth="3" fill="none" strokeLinecap="round" className="animate-pulse">
            <path d="M 40,40 Q 80,30 130,42 T 220,38" opacity="0.8" />
            <path d="M 60,55 Q 110,48 160,52 T 240,48" opacity="0.9" />
            <path d="M 30,70 Q 90,62 150,68 T 230,62" opacity="0.7" />
          </g>
        )}

        {/* 3 Birthday Candles */}
        {[
          { x: 110, y: 55, color: '#FB7185' },
          { x: 140, y: 50, color: '#2DD4BF' },
          { x: 170, y: 55, color: '#C084FC' },
        ].map((candle, i) => (
          <g key={i}>
            {/* Candle Body */}
            <rect
              x={candle.x - 4}
              y={candle.y}
              width="8"
              height="38"
              rx="3"
              fill={candle.color}
              stroke="#1E1B4B"
              strokeWidth="2.5"
            />
            {/* Candle Stripes */}
            <line x1={candle.x - 4} y1={candle.y + 10} x2={candle.x + 4} y2={candle.y + 14} stroke="#FFFFFF" strokeWidth="2" />
            <line x1={candle.x - 4} y1={candle.y + 22} x2={candle.x + 4} y2={candle.y + 26} stroke="#FFFFFF" strokeWidth="2" />

            {/* Candle Wick */}
            <line x1={candle.x} y1={candle.y} x2={candle.x} y2={candle.y - 6} stroke="#1E1B4B" strokeWidth="2" />

            {/* Candle Flame (If not extinguished) */}
            {!candlesBlown ? (
              <g
                className={`transition-transform duration-200 ${
                  isBlowing
                    ? 'origin-bottom scale-75 -skew-x-12'
                    : 'animate-pulse'
                }`}
                style={{
                  transformOrigin: `${candle.x}px ${candle.y - 6}px`,
                }}
              >
                {/* Outer flame glow */}
                <ellipse cx={candle.x} cy={candle.y - 15} rx="8" ry="12" fill="#F59E0B" opacity="0.4" />
                {/* Core Flame */}
                <path
                  d={`M ${candle.x},${candle.y - 25} C ${candle.x + 6},${candle.y - 14} ${candle.x + 5},${candle.y - 7} ${candle.x},${candle.y - 6} C ${candle.x - 5},${candle.y - 7} ${candle.x - 6},${candle.y - 14} ${candle.x},${candle.y - 25} Z`}
                  fill="#FDE047"
                  stroke="#1E1B4B"
                  strokeWidth="1.8"
                />
                {/* White hot inner spark */}
                <ellipse cx={candle.x} cy={candle.y - 12} rx="2" ry="4" fill="#FFFFFF" />
              </g>
            ) : (
              /* Wisps of rising smoke when blown */
              <g stroke="#94A3B8" strokeWidth="2.2" fill="none" strokeLinecap="round" className="animate-fade-in">
                <path d={`M ${candle.x},${candle.y - 7} Q ${candle.x - 5},${candle.y - 18} ${candle.x + 4},${candle.y - 32}`} opacity="0.8" />
                <path d={`M ${candle.x + 1},${candle.y - 14} Q ${candle.x + 6},${candle.y - 24} ${candle.x - 2},${candle.y - 38}`} opacity="0.6" />
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

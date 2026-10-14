import React from 'react';

interface BirthdayCakeProps {
  blownCandles: [boolean, boolean, boolean]; // States for Candle 1, 2, 3
  isBlowing: boolean; // Wind breath active
  onBlowCandles: () => void;
}

export const BirthdayCake: React.FC<BirthdayCakeProps> = ({
  blownCandles,
  isBlowing,
  onBlowCandles,
}) => {
  const allBlown = blownCandles[0] && blownCandles[1] && blownCandles[2];

  return (
    <div
      onClick={!allBlown ? onBlowCandles : undefined}
      className="relative w-80 sm:w-96 h-80 sm:h-96 mx-auto flex items-center justify-center select-none cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label="3-Tier Birthday Cake"
    >
      <svg
        viewBox="0 0 320 300"
        className="w-full h-full drop-shadow-2xl overflow-visible"
      >
        {/* Ornate Ceramic Cake Pedestal Stand */}
        <ellipse cx="160" cy="272" rx="85" ry="14" fill="#E2E8F0" stroke="#1E1B4B" strokeWidth="3.5" />
        <path d="M 140,272 L 138,235 L 182,235 L 180,272 Z" fill="#F8FAFC" stroke="#1E1B4B" strokeWidth="3.5" />
        <ellipse cx="160" cy="235" rx="120" ry="20" fill="#FFFFFF" stroke="#1E1B4B" strokeWidth="4" />
        {/* Stand Decorative Rim Scallops */}
        <path
          d="M 45,235 Q 60,248 75,235 Q 90,248 105,235 Q 120,248 135,235 Q 150,248 165,235 Q 180,248 195,235 Q 210,248 225,235 Q 240,248 255,235 Q 270,248 275,235"
          fill="none"
          stroke="#CBD5E1"
          strokeWidth="2.5"
        />

        {/* ================= TIER 1: BOTTOM DECK (Warm Peach/Vanilla with Strawberry Drips) ================= */}
        <path
          d="M 50,170 L 50,230 C 50,250 270,250 270,230 L 270,170 Z"
          fill="#FB923C"
          stroke="#1E1B4B"
          strokeWidth="4"
        />
        {/* Tier 1 Top Oval */}
        <ellipse cx="160" cy="170" rx="110" ry="24" fill="#FDBA74" stroke="#1E1B4B" strokeWidth="4" />

        {/* Tier 1 Frosting Glaze Drips */}
        <path
          d="M 50,170 C 65,195 85,195 100,174 C 115,198 135,198 150,174 C 165,198 185,198 200,174 C 215,198 235,198 250,174 C 262,192 268,188 270,170"
          fill="#FDA4AF"
          stroke="#1E1B4B"
          strokeWidth="3"
        />

        {/* Tier 1 Sprinkles & Pearls */}
        <circle cx="85" cy="210" r="3.5" fill="#38BDF8" />
        <circle cx="115" cy="218" r="3.5" fill="#FDE047" />
        <circle cx="160" cy="215" r="3.5" fill="#FFFFFF" />
        <circle cx="205" cy="218" r="3.5" fill="#C084FC" />
        <circle cx="235" cy="210" r="3.5" fill="#2DD4BF" />

        {/* ================= TIER 2: MIDDLE DECK (Buttercream Yellow with Scallop Piping) ================= */}
        <path
          d="M 80,115 L 80,165 C 80,185 240,185 240,165 L 240,115 Z"
          fill="#FDE047"
          stroke="#1E1B4B"
          strokeWidth="3.8"
        />
        {/* Tier 2 Top Oval */}
        <ellipse cx="160" cy="115" rx="80" ry="20" fill="#FEF08A" stroke="#1E1B4B" strokeWidth="3.8" />

        {/* Tier 2 Frosting Scallops */}
        <path
          d="M 80,115 C 95,135 115,135 130,118 C 145,136 165,136 180,118 C 195,136 215,136 230,118 C 238,130 240,122 240,115"
          fill="#FFFDF8"
          stroke="#1E1B4B"
          strokeWidth="2.8"
        />

        {/* Sprinkles on Tier 2 */}
        <circle cx="110" cy="145" r="3" fill="#FB7185" />
        <circle cx="145" cy="152" r="3" fill="#2DD4BF" />
        <circle cx="175" cy="152" r="3" fill="#C084FC" />
        <circle cx="210" cy="145" r="3" fill="#38BDF8" />

        {/* ================= TIER 3: TOP DECK (Soft Turquoise with Golden Stars) ================= */}
        <path
          d="M 110,65 L 110,110 C 110,126 210,126 210,110 L 210,65 Z"
          fill="#2DD4BF"
          stroke="#1E1B4B"
          strokeWidth="3.5"
        />
        {/* Tier 3 Top Oval */}
        <ellipse cx="160" cy="65" rx="50" ry="15" fill="#5EEAD4" stroke="#1E1B4B" strokeWidth="3.5" />

        {/* Tier 3 Piped Cream Border */}
        <path
          d="M 110,65 Q 120,78 135,67 Q 150,78 165,67 Q 180,78 195,67 Q 205,78 210,65"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
        />

        {/* Stars on Top Deck */}
        <circle cx="135" cy="90" r="2.5" fill="#FDE047" />
        <circle cx="160" cy="95" r="2.5" fill="#FFFFFF" />
        <circle cx="185" cy="90" r="2.5" fill="#FB7185" />

        {/* ================= FACING WIND GUST (From Front / Bottom Upward Towards Candles) ================= */}
        {isBlowing && (
          <g stroke="#38BDF8" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.9" className="transition-all">
            {/* Streamlines rushing forward from viewer */}
            <path d="M 130,290 C 130,210 135,130 135,35" strokeDasharray="16 8" />
            <path d="M 160,295 C 160,200 160,110 160,25" strokeDasharray="20 10" strokeWidth="4.5" />
            <path d="M 190,290 C 190,210 185,130 185,35" strokeDasharray="16 8" />
            {/* Wind expansion puffs */}
            <path d="M 115,50 Q 135,35 155,50" />
            <path d="M 165,45 Q 185,30 205,45" />
          </g>
        )}

        {/* ================= 3 CANDLES (Left, Center, Right) ================= */}
        {[
          { id: 0, x: 135, y: 30, color: '#FB7185', blown: blownCandles[0] },
          { id: 1, x: 160, y: 22, color: '#38BDF8', blown: blownCandles[1] },
          { id: 2, x: 185, y: 30, color: '#FDE047', blown: blownCandles[2] },
        ].map((candle) => (
          <g key={candle.id}>
            {/* Candle Body */}
            <rect
              x={candle.x - 4}
              y={candle.y}
              width="8"
              height="36"
              rx="3"
              fill={candle.color}
              stroke="#1E1B4B"
              strokeWidth="2.5"
            />
            {/* Candle Spiral Stripes */}
            <line x1={candle.x - 4} y1={candle.y + 8} x2={candle.x + 4} y2={candle.y + 12} stroke="#FFFFFF" strokeWidth="2" />
            <line x1={candle.x - 4} y1={candle.y + 18} x2={candle.x + 4} y2={candle.y + 22} stroke="#FFFFFF" strokeWidth="2" />

            {/* Candle Wick */}
            <line x1={candle.x} y1={candle.y} x2={candle.x} y2={candle.y - 6} stroke="#1E1B4B" strokeWidth="2" />

            {/* Candle Flame (If not extinguished) */}
            {!candle.blown ? (
              <g
                className={`transition-all duration-300 ${
                  isBlowing ? 'scale-75 -translate-y-1 opacity-80' : ''
                }`}
                style={{
                  transformOrigin: `${candle.x}px ${candle.y - 6}px`,
                }}
              >
                {/* Outer flame glow */}
                <ellipse cx={candle.x} cy={candle.y - 16} rx="8" ry="13" fill="#F59E0B" opacity="0.45" />
                {/* Core Flame */}
                <path
                  d={`M ${candle.x},${candle.y - 28} C ${candle.x + 6},${candle.y - 16} ${candle.x + 5},${candle.y - 7} ${candle.x},${candle.y - 6} C ${candle.x - 5},${candle.y - 7} ${candle.x - 6},${candle.y - 16} ${candle.x},${candle.y - 28} Z`}
                  fill="#FDE047"
                  stroke="#1E1B4B"
                  strokeWidth="1.8"
                />
                {/* White hot inner spark */}
                <ellipse cx={candle.x} cy={candle.y - 14} rx="2.5" ry="5" fill="#FFFFFF" />
              </g>
            ) : (
              /* Wisps of rising smoke when blown */
              <g stroke="#94A3B8" strokeWidth="2" fill="none" strokeLinecap="round" className="animate-fade-in">
                <path d={`M ${candle.x},${candle.y - 7} Q ${candle.x - 5},${candle.y - 20} ${candle.x + 4},${candle.y - 35}`} opacity="0.8" />
                <path d={`M ${candle.x + 1},${candle.y - 14} Q ${candle.x + 6},${candle.y - 26} ${candle.x - 3},${candle.y - 42}`} opacity="0.6" />
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

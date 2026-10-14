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
  const targetCandleIndex = !blownCandles[0] ? 0 : !blownCandles[1] ? 1 : !blownCandles[2] ? 2 : null;

  return (
    <div
      onClick={!allBlown ? onBlowCandles : undefined}
      className="relative w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 mx-auto flex items-center justify-center select-none cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label="Delicious 3-Tier Birthday Cake"
    >
      <svg
        viewBox="0 0 340 320"
        className="w-full h-full drop-shadow-2xl overflow-visible"
      >
        <defs>
          {/* Porcelain Plate Gradient */}
          <linearGradient id="plateGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          {/* Tier 1 (Bottom) Sponge Gradient */}
          <linearGradient id="tier1Grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="25%" stopColor="#FB923C" />
            <stop offset="65%" stopColor="#FDBA74" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>

          {/* Tier 1 Strawberry Glaze Drip Gradient */}
          <linearGradient id="glazeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDA4AF" />
            <stop offset="60%" stopColor="#FB7185" />
            <stop offset="100%" stopColor="#F43F5E" />
          </linearGradient>

          {/* Tier 2 (Middle) Buttercream Gradient */}
          <linearGradient id="tier2Grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#CA8A04" />
            <stop offset="30%" stopColor="#FDE047" />
            <stop offset="70%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#CA8A04" />
          </linearGradient>

          {/* Tier 3 (Top) Pistachio / Turquoise Gradient */}
          <linearGradient id="tier3Grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0D9488" />
            <stop offset="30%" stopColor="#2DD4BF" />
            <stop offset="70%" stopColor="#5EEAD4" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>

          {/* Flame Core Radial Glow */}
          <radialGradient id="flameGlow">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#FEF08A" />
            <stop offset="70%" stopColor="#F59E0B" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Drop Shadow underneath the Stand */}
        <ellipse cx="170" cy="298" rx="100" ry="12" fill="#0F172A" opacity="0.12" />

        {/* ================= ORNATE PEDESTAL STAND ================= */}
        <ellipse cx="170" cy="285" rx="80" ry="12" fill="#E2E8F0" stroke="#1E1B4B" strokeWidth="3" />
        <path d="M 148,285 L 146,248 L 194,248 L 192,285 Z" fill="#F8FAFC" stroke="#1E1B4B" strokeWidth="3" />
        {/* Porcelain Tray */}
        <ellipse cx="170" cy="248" rx="130" ry="22" fill="url(#plateGrad)" stroke="#1E1B4B" strokeWidth="3.5" />
        {/* Decorative Scalloped Plate Rim */}
        <path
          d="M 45,248 Q 62,262 79,248 Q 96,262 113,248 Q 130,262 147,248 Q 164,262 181,248 Q 198,262 215,248 Q 232,262 249,248 Q 266,262 283,248 Q 295,258 295,248"
          fill="none"
          stroke="#94A3B8"
          strokeWidth="2"
        />

        {/* ================= TIER 1: BOTTOM DECK (Velvet Sponge with Gloss Strawberry Glaze) ================= */}
        <path
          d="M 55,180 L 55,242 C 55,264 285,264 285,242 L 285,180 Z"
          fill="url(#tier1Grad)"
          stroke="#1E1B4B"
          strokeWidth="3.5"
        />
        <ellipse cx="170" cy="180" rx="115" ry="24" fill="#FED7AA" stroke="#1E1B4B" strokeWidth="3.5" />

        {/* Tier 1 Thick Strawberry Glaze Drips */}
        <path
          d="M 55,180 C 70,208 90,208 105,184 C 120,212 145,212 160,185 C 175,212 200,212 215,185 C 230,210 250,210 265,184 C 278,202 284,196 285,180 Z"
          fill="url(#glazeGrad)"
          stroke="#1E1B4B"
          strokeWidth="2.8"
        />
        {/* Strawberry Glaze Highlight Sheen */}
        <path
          d="M 68,185 C 78,198 88,198 96,187 M 125,188 C 135,202 145,202 152,188 M 180,188 C 190,202 200,202 208,188"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Fresh Strawberries on Bottom Tier */}
        {[
          { cx: 80, cy: 195 },
          { cx: 135, cy: 202 },
          { cx: 205, cy: 202 },
          { cx: 260, cy: 195 },
        ].map((berry, i) => (
          <g key={`berry-${i}`} transform={`translate(${berry.cx - 10}, ${berry.cy - 10}) scale(0.75)`}>
            <path d="M 12,2 Q 22,2 20,16 Q 18,26 12,28 Q 6,26 4,16 Q 2,2 12,2 Z" fill="#E11D48" stroke="#1E1B4B" strokeWidth="2" />
            <circle cx="10" cy="10" r="1" fill="#FEF08A" />
            <circle cx="15" cy="12" r="1" fill="#FEF08A" />
            <circle cx="12" cy="18" r="1" fill="#FEF08A" />
            <circle cx="8" cy="16" r="1" fill="#FEF08A" />
            <path d="M 6,3 Q 12,-3 12,2 Q 18,-3 18,3 Q 12,6 6,3 Z" fill="#22C55E" stroke="#1E1B4B" strokeWidth="1.5" />
          </g>
        ))}

        {/* Pearlescent Sugar Pearls on Base */}
        <circle cx="105" cy="225" r="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
        <circle cx="170" cy="230" r="4" fill="#FDE047" stroke="#CA8A04" strokeWidth="1" />
        <circle cx="235" cy="225" r="4" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />

        {/* ================= TIER 2: MIDDLE DECK (Buttercream with Piped Scallops) ================= */}
        <path
          d="M 88,125 L 88,175 C 88,196 252,196 252,175 L 252,125 Z"
          fill="url(#tier2Grad)"
          stroke="#1E1B4B"
          strokeWidth="3.2"
        />
        <ellipse cx="170" cy="125" rx="82" ry="19" fill="#FEF9C3" stroke="#1E1B4B" strokeWidth="3.2" />

        {/* Tier 2 Piped Shell Border */}
        <path
          d="M 88,125 C 102,144 122,144 136,128 C 150,146 170,146 184,128 C 198,146 218,146 232,128 C 244,142 250,134 252,125"
          fill="#FFFDF8"
          stroke="#1E1B4B"
          strokeWidth="2.5"
        />
        {/* Tier 2 Sprinkles */}
        <circle cx="118" cy="154" r="3" fill="#FB7185" />
        <circle cx="152" cy="160" r="3" fill="#2DD4BF" />
        <circle cx="188" cy="160" r="3" fill="#C084FC" />
        <circle cx="222" cy="154" r="3" fill="#38BDF8" />

        {/* ================= TIER 3: TOP DECK (Soft Turquoise Pistachio Tier) ================= */}
        <path
          d="M 118,72 L 118,118 C 118,134 222,134 222,118 L 222,72 Z"
          fill="url(#tier3Grad)"
          stroke="#1E1B4B"
          strokeWidth="3"
        />
        <ellipse cx="170" cy="72" rx="52" ry="14" fill="#99F6E4" stroke="#1E1B4B" strokeWidth="3" />

        {/* Piped Vanilla Rosettes Border around Top Rim */}
        <path
          d="M 118,72 Q 130,85 145,74 Q 160,85 175,74 Q 190,85 205,74 Q 216,84 222,72"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Golden Confetti Stars on Top Tier */}
        <circle cx="145" cy="98" r="3" fill="#FDE047" stroke="#CA8A04" strokeWidth="1" />
        <circle cx="170" cy="102" r="3" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
        <circle cx="195" cy="98" r="3" fill="#FB7185" stroke="#E11D48" strokeWidth="1" />

        {/* ================= 3 CANDLES WITH WIND-PHYSICS LIGHT & RISING SMOKE ================= */}
        {[
          { id: 0, x: 142, y: 35, color: '#FB7185', stripe: '#FFFFFF', blown: blownCandles[0], anim: 'animate-flame-1' },
          { id: 1, x: 170, y: 25, color: '#38BDF8', stripe: '#FDE047', blown: blownCandles[1], anim: 'animate-flame-2' },
          { id: 2, x: 198, y: 35, color: '#FACC15', stripe: '#FFFFFF', blown: blownCandles[2], anim: 'animate-flame-3' },
        ].map((candle) => {
          const isTargetBlowout = isBlowing && candle.id === targetCandleIndex;
          const isOtherGust = isBlowing && !candle.blown && candle.id !== targetCandleIndex;

          return (
            <g key={`candle-${candle.id}`}>
              {/* Candle Cream Dollop Support */}
              <ellipse cx={candle.x} cy={candle.y + 36} rx="6" ry="2.5" fill="#FFFFFF" opacity="0.9" />

              {/* Candle Body */}
              <rect
                x={candle.x - 4}
                y={candle.y}
                width="8"
                height="36"
                rx="3"
                fill={candle.color}
                stroke="#1E1B4B"
                strokeWidth="2.2"
              />
              {/* Spiral Stripes on Candle */}
              <line x1={candle.x - 4} y1={candle.y + 8} x2={candle.x + 4} y2={candle.y + 13} stroke={candle.stripe} strokeWidth="2" strokeLinecap="round" />
              <line x1={candle.x - 4} y1={candle.y + 18} x2={candle.x + 4} y2={candle.y + 23} stroke={candle.stripe} strokeWidth="2" strokeLinecap="round" />

              {/* Candle Wick */}
              <line x1={candle.x} y1={candle.y} x2={candle.x} y2={candle.y - 7} stroke="#1E1B4B" strokeWidth="2.2" strokeLinecap="round" />

              {/* WIND PHYSICS ON THE CANDLE LIGHT ITSELF */}
              {!candle.blown ? (
                <g
                  className={
                    isTargetBlowout
                      ? 'animate-flame-blowout'
                      : isOtherGust
                      ? 'animate-flame-gust'
                      : candle.anim
                  }
                  style={{
                    transformOrigin: `${candle.x}px ${candle.y - 7}px`,
                  }}
                >
                  {/* Outer Warm Glowing Halo */}
                  <ellipse cx={candle.x} cy={candle.y - 18} rx="9" ry="14" fill="url(#flameGlow)" />

                  {/* Main Flame Teardrop Body */}
                  <path
                    d={`M ${candle.x},${candle.y - 30} C ${candle.x + 6},${candle.y - 17} ${candle.x + 5},${candle.y - 8} ${candle.x},${candle.y - 7} C ${candle.x - 5},${candle.y - 8} ${candle.x - 6},${candle.y - 17} ${candle.x},${candle.y - 30} Z`}
                    fill="#FBBF24"
                    stroke="#EA580C"
                    strokeWidth="1.5"
                  />

                  {/* Inner Brilliant Core */}
                  <ellipse cx={candle.x} cy={candle.y - 14} rx="3" ry="6" fill="#FEF08A" />

                  {/* White Hot Spark */}
                  <ellipse cx={candle.x} cy={candle.y - 11} rx="1.5" ry="3.5" fill="#FFFFFF" />

                  {/* Blue Wick Ember Base */}
                  <ellipse cx={candle.x} cy={candle.y - 7} rx="2" ry="1" fill="#38BDF8" opacity="0.8" />
                </g>
              ) : (
                /* REALISTIC RISING CARTOON SMOKE (Curling puffs floating from top of candlestick wick) */
                <g className="pointer-events-none">
                  {/* Smoldering Ember right on top of the candlestick wick */}
                  <circle cx={candle.x} cy={candle.y - 6} r="1.5" fill="#EF4444" className="animate-pulse" />
                  <circle cx={candle.x} cy={candle.y - 6} r="3.5" fill="#F97316" opacity="0.4" className="animate-pulse" />

                  {/* Left Curling Smoke Plume */}
                  <g className="animate-smoke-1" style={{ transformOrigin: `${candle.x}px ${candle.y - 6}px` }}>
                    <path
                      d={`M ${candle.x},${candle.y - 6} C ${candle.x - 6},${candle.y - 18} ${candle.x - 2},${candle.y - 30} ${candle.x - 8},${candle.y - 48} C ${candle.x - 14},${candle.y - 60} ${candle.x - 6},${candle.y - 70} ${candle.x - 12},${candle.y - 82}`}
                      stroke="#94A3B8"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      opacity="0.75"
                    />
                    <circle cx={candle.x - 4} cy={candle.y - 25} r="3.5" fill="#CBD5E1" opacity="0.65" />
                    <circle cx={candle.x - 8} cy={candle.y - 45} r="5" fill="#E2E8F0" opacity="0.5" />
                    <circle cx={candle.x - 12} cy={candle.y - 68} r="6.5" fill="#F1F5F9" opacity="0.35" />
                  </g>

                  {/* Right Curling Smoke Plume */}
                  <g className="animate-smoke-2" style={{ transformOrigin: `${candle.x}px ${candle.y - 6}px` }}>
                    <path
                      d={`M ${candle.x},${candle.y - 6} C ${candle.x + 6},${candle.y - 20} ${candle.x + 2},${candle.y - 34} ${candle.x + 8},${candle.y - 52} C ${candle.x + 14},${candle.y - 64} ${candle.x + 6},${candle.y - 74} ${candle.x + 10},${candle.y - 86}`}
                      stroke="#CBD5E1"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      opacity="0.65"
                    />
                    <circle cx={candle.x + 5} cy={candle.y - 28} r="3" fill="#E2E8F0" opacity="0.6" />
                    <circle cx={candle.x + 9} cy={candle.y - 50} r="4.5" fill="#F1F5F9" opacity="0.45" />
                    <circle cx={candle.x + 11} cy={candle.y - 72} r="6" fill="#FFFFFF" opacity="0.3" />
                  </g>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

import React from 'react';

export type CrewmateColor = 'red' | 'cyan' | 'lime' | 'pink' | 'yellow' | 'orange' | 'purple' | 'blue' | 'white' | 'black';
export type CrewmateHat = 'none' | 'sticky' | 'plant' | 'egg' | 'crown' | 'pompom' | 'toilet' | 'viking' | 'chef';

interface CrewmateSpriteProps {
  color: CrewmateColor;
  hat: CrewmateHat;
  isMoving: boolean;
  direction: 'left' | 'right';
  className?: string;
  size?: number;
  name?: string;
}

// Color palettes matching actual Among Us colors
export const CREWMATE_COLORS: Record<CrewmateColor, { fill: string; shadow: string; name: string }> = {
  red: { fill: '#C51111', shadow: '#7A0808', name: 'Red' },
  cyan: { fill: '#38FEDE', shadow: '#1FADB3', name: 'Cyan' },
  lime: { fill: '#50F01E', shadow: '#329A13', name: 'Lime' },
  pink: { fill: '#ED54BA', shadow: '#AB3288', name: 'Pink' },
  yellow: { fill: '#F5F557', shadow: '#BAA21B', name: 'Yellow' },
  orange: { fill: '#F07D0D', shadow: '#9F5004', name: 'Orange' },
  purple: { fill: '#6B2FBC', shadow: '#441880', name: 'Purple' },
  blue: { fill: '#132ED1', shadow: '#09158E', name: 'Blue' },
  white: { fill: '#D6E0F0', shadow: '#8394A7', name: 'White' },
  black: { fill: '#3F474E', shadow: '#212529', name: 'Black' },
};

export const CREWMATE_HATS: Record<CrewmateHat, { name: string; emoji: string }> = {
  none: { name: 'No Hat', emoji: '🧑‍🚀' },
  sticky: { name: 'Sticky Note', emoji: '📝' },
  plant: { name: 'Leaf Sprout', emoji: '🌱' },
  egg: { name: 'Fried Egg', emoji: '🍳' },
  crown: { name: 'Golden Crown', emoji: '👑' },
  pompom: { name: 'Pom Pom', emoji: '🎈' },
  toilet: { name: 'Toilet Paper', emoji: '🧻' },
  viking: { name: 'Viking Horns', emoji: '🪖' },
  chef: { name: 'Chef Hat', emoji: '👨‍🍳' },
};

export default function CrewmateSprite({
  color,
  hat,
  isMoving,
  direction,
  className = '',
  size = 64,
  name,
}: CrewmateSpriteProps) {
  const selectedColor = CREWMATE_COLORS[color] || CREWMATE_COLORS.red;

  // Render hat SVGs / styles overlaid on top of the crewmate body
  const renderHat = () => {
    switch (hat) {
      case 'sticky':
        return (
          <g transform={`translate(${direction === 'right' ? '18' : '10'}, -10)`} className="origin-bottom">
            {/* Sticky Yellow Square */}
            <path d="M 0 0 L 16 0 L 16 14 L 3 14 L 0 11 Z" fill="#FFE14C" stroke="#000000" strokeWidth="2.5" />
            <path d="M 0 11 L 3 11 L 3 14" fill="#E0C233" stroke="#000000" strokeWidth="2.5" />
            {/* Hand-drawn "DUM" text */}
            <text x="3" y="10" fontFamily='"Fira Code", monospace' fontSize="5" fontWeight="bold" fill="#000000">DUM</text>
          </g>
        );

      case 'plant':
        return (
          <g transform={`translate(${direction === 'right' ? '21' : '15'}, -14)`}>
            {/* Sprout stem */}
            <path d="M 5 14 Q 5 10 2 6 Q 0 4 -2 5" fill="none" stroke="#228B22" strokeWidth="3.5" strokeLinecap="round" />
            {/* Left leaf */}
            <path d="M 2 6 C 0 3 -4 2 -6 6 C -5 9 -1 8 2 6" fill="#4CD137" stroke="#000000" strokeWidth="2" />
            {/* Right leaf */}
            <path d="M 2 6 C 5 3 9 2 11 6 C 10 9 6 8 2 6" fill="#4CD137" stroke="#000000" strokeWidth="2" />
          </g>
        );

      case 'egg':
        return (
          <g transform={`translate(${direction === 'right' ? '12' : '8'}, -12)`}>
            {/* White egg pancake */}
            <path d="M -4 10 Q -6 6 0 5 Q 7 3 12 5 Q 18 6 16 10 Q 14 13 8 13 Q -2 13 -4 10 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />
            {/* Yellow yolk */}
            <circle cx="6" cy="7.5" r="4" fill="#FFC048" stroke="#000000" strokeWidth="2" />
            {/* Yolk reflection */}
            <circle cx="5" cy="6" r="1" fill="#FFFFFF" />
          </g>
        );

      case 'crown':
        return (
          <g transform={`translate(${direction === 'right' ? '12' : '8'}, -15)`}>
            {/* Gold Crown */}
            <path d="M 0 10 L 0 2 L 4 6 L 8 1 L 12 6 L 16 2 L 16 10 Z" fill="#F1C40F" stroke="#000000" strokeWidth="2.5" />
            <rect x="0" y="8" width="16" height="2" fill="#D68910" stroke="#000000" strokeWidth="1" />
            {/* Jewels */}
            <circle cx="4" cy="7" r="1" fill="#E74C3C" />
            <circle cx="12" cy="7" r="1" fill="#2980B9" />
          </g>
        );

      case 'pompom':
        return (
          <g transform={`translate(${direction === 'right' ? '22' : '14'}, -24)`}>
            {/* Balloon string */}
            <path d="M 0 24 Q -2 16 0 10" fill="none" stroke="#2c3e50" strokeWidth="2" />
            {/* Red balloon sphere */}
            <circle cx="0" cy="5" r="7.5" fill="#E74C3C" stroke="#000000" strokeWidth="2.5" />
            <circle cx="-2" cy="3" r="2" fill="#FFFFFF" opacity="0.3" />
            {/* Balloon knot */}
            <polygon points="-1,10 1,10 0,12" fill="#C0392B" stroke="#000000" strokeWidth="1" />
          </g>
        );

      case 'toilet':
        return (
          <g transform={`translate(${direction === 'right' ? '12' : '8'}, -12)`}>
            {/* Toilet Paper Roll */}
            <rect x="0" y="2" width="15" height="10" rx="2" fill="#ECF0F1" stroke="#000000" strokeWidth="2.5" />
            <ellipse cx="15" cy="7" rx="2.5" ry="5" fill="#BDC3C7" stroke="#000000" strokeWidth="2" />
            {/* Trailing paper */}
            <path d="M 0 11 Q -5 14 -7 20 Q -4 21 -2 20 Q 0 15 0 11 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.5" />
          </g>
        );

      case 'viking':
        return (
          <g transform={`translate(${direction === 'right' ? '12' : '6'}, -11)`}>
            {/* Dome helmet */}
            <path d="M -2 10 A 10 10 0 0 1 18 10 Z" fill="#7F8C8D" stroke="#000000" strokeWidth="2.5" />
            {/* Left horn */}
            <path d="M -2 7 Q -10 4 -12 -3 Q -6 -2 -2 5 Z" fill="#FDFEFE" stroke="#000000" strokeWidth="2" />
            {/* Right horn */}
            <path d="M 18 7 Q 26 4 28 -3 Q 22 -2 18 5 Z" fill="#FDFEFE" stroke="#000000" strokeWidth="2" />
          </g>
        );

      case 'chef':
        return (
          <g transform={`translate(${direction === 'right' ? '12' : '8'}, -18)`}>
            {/* Puffy Chef Hat */}
            <path d="M 0 16 F 0 10 Q -4 8 -2 5 Q 0 0 8 2 Q 16 0 18 5 Q 20 8 16 10 L 16 16 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="2.5" />
            {/* Base cylinder band */}
            <rect x="0" y="11" width="16" height="5" fill="#EAEDED" stroke="#000000" strokeWidth="2" />
          </g>
        );

      default:
        return null;
    }
  };

  // Walk cycle frame values calculated based on isMoving
  const walkBounceClass = isMoving ? 'animate-bounce-subtle' : '';
  const legCycleClass1 = isMoving ? 'animate-leg-left' : '';
  const legCycleClass2 = isMoving ? 'animate-leg-right' : '';
  const wobbleClass = isMoving ? 'wobble-walk' : '';

  return (
    <div
      className={`relative select-none flex flex-col items-center justify-center ${className} ${wobbleClass}`}
      style={{ width: `${size}px`, height: `${size + 15}px`, transition: 'all 0.15s ease' }}
    >
      {/* Floating Name Overlay */}
      {name && (
        <span
          className="absolute -top-7 text-[9px] sm:text-[10px] font-mono select-none px-2 py-0.5 whitespace-nowrap leading-none rounded bg-[#000000bf] text-white border border-[#ffffff15]"
          style={{ fontFamily: '"Press Start 2P", courier, monospace' }}
        >
          {name}
        </span>
      )}

      {/* Main Crewmate SVG container */}
      <svg
        viewBox="-15 -30 70 85"
        className={`w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.55)] ${walkBounceClass}`}
        style={{ transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)' }}
      >
        <defs>
          {/* Glass Visor Gradient */}
          <radialGradient id="visorGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ADF5FF" />
            <stop offset="40%" stopColor="#38E3FD" />
            <stop offset="90%" stopColor="#1E93AF" />
            <stop offset="100%" stopColor="#0B4B5A" />
          </radialGradient>
          {/* Custom leg animations inside SVG paths via CSS */}
          <style>{`
            @keyframes legLeft {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50% { transform: translateY(-4px) rotate(-22deg); }
            }
            @keyframes legRight {
              0%, 100% { transform: translateY(-4px) rotate(22deg); }
              50% { transform: translateY(0) rotate(0deg); }
            }
            @keyframes bounceCrew {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-5px); }
            }
            .animate-leg-left {
              animation: legLeft 0.175s infinite linear;
              transform-origin: 5px 24px;
            }
            .animate-leg-right {
              animation: legRight 0.175s infinite linear;
              transform-origin: 26px 24px;
            }
            .animate-bounce-subtle {
              animation: bounceCrew 0.175s infinite linear;
            }
          `}</style>
        </defs>

        {/* 1. Oxygen Tank (Placed behind body) */}
        {/* Border / Outline */}
        <rect x="-10" y="0" width="12" height="24" rx="4" fill="#000000" />
        {/* Base shadow & fill */}
        <rect x="-9" y="1" width="10" height="22" rx="3" fill={selectedColor.shadow} />
        {/* Main highlight color */}
        <rect x="-9" y="1" width="7" height="22" rx="2" fill={selectedColor.fill} />

        {/* 2. Left Leg (Back Leg) */}
        <g className={legCycleClass1}>
          {/* Outer stroke */}
          <rect x="0" y="24" width="12" height="15" rx="5" fill="#000000" />
          {/* Inner fill */}
          <rect x="1" y="25" width="10" height="13" rx="4" fill={selectedColor.shadow} />
        </g>

        {/* 3. Right Leg (Front Leg) */}
        <g className={legCycleClass2}>
          {/* Outer stroke */}
          <rect x="20" y="24" width="12" height="15" rx="5" fill="#000000" />
          {/* Inner fill */}
          <rect x="21" y="25" width="10" height="13" rx="4" fill={selectedColor.fill} />
          {/* Minor shading bottom */}
          <path d="M 21 34 Q 26 38 31 34 L 31 37 Q 26 39 21 37 Z" fill={selectedColor.shadow} />
        </g>

        {/* 4. Main Body */}
        {/* Outer body boundary outline */}
        <path
          d="M 5 28 A 16 16 0 0 1 5 -4 L 27 -4 A 16 16 0 0 1 27 28 Z"
          fill="#000000"
          stroke="#000000"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Shadow body background */}
        <path
          d="M 6 27 A 15 15 0 0 1 6 -3 L 26 -3 A 15 15 0 0 1 26 27 Z"
          fill={selectedColor.shadow}
        />
        {/* Secondary main highlight body block */}
        <path
          d="M 6 12 A 15 15 0 0 1 6 -3 L 26 -3 A 15 15 0 0 1 26 12 Z"
          fill={selectedColor.fill}
        />

        {/* 5. Glass Visor (Window) */}
        <g transform="translate(13, -1)">
          {/* Outer border shape */}
          <path
            d="M 4 14 Q -1 14 -1 7 Q -1 0 4 0 L 18 0 Q 23 0 23 7 Q 23 14 18 14 Z"
            fill="#000000"
            stroke="#000000"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Visor gradient filling */}
          <path
            d="M 4 13 Q 1 13 1 7 Q 1 1 4 1 L 18 1 Q 21 1 21 7 Q 21 13 18 13 Z"
            fill="url(#visorGrad)"
          />
          {/* White Reflection Streak */}
          <path
            d="M 6 3 Q 12 3 16 3 Q 15 7 11 7 Q 7 7 6 3 Z"
            fill="#FFFFFF"
            opacity="0.65"
          />
        </g>

        {/* 6. Hat (Placed on top of the head) */}
        {renderHat()}
      </svg>
    </div>
  );
}

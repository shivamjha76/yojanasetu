import React from "react";

export const ParliamentWatermark: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <svg
      viewBox="0 0 400 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="domeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#cde4d6" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#e3f0e8" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="baseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d5e8dc" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#eef6f1" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Gentle Landscape Mound */}
      <path
        d="M -20 240 Q 180 200 420 230 L 420 240 L -20 240 Z"
        fill="#e6f2eb"
        opacity="0.6"
      />

      {/* Flagpole on Central Dome */}
      <line x1="200" y1="28" x2="200" y2="78" stroke="#8fae9b" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="200" cy="27" r="2.5" fill="#8fae9b" />

      {/* Indian National Flag (Tricolor) */}
      <path d="M 201 29 Q 212 26 224 29 Q 214 34 201 34 Z" fill="#ff9933" />
      <path d="M 201 34 Q 212 31 224 34 Q 214 39 201 39 Z" fill="#ffffff" stroke="#c0d7c9" strokeWidth="0.3" />
      <path d="M 201 39 Q 212 36 224 39 Q 214 44 201 44 Z" fill="#138808" />
      {/* Ashoka Chakra Blue Dot */}
      <circle cx="212" cy="35" r="1.2" fill="#000080" />

      {/* Central Grand Dome */}
      {/* Upper Cupola / Chhatri finial */}
      <path
        d="M 194 78 C 194 72 206 72 206 78 Z"
        fill="#9abfa9"
      />
      <rect x="191" y="77" width="18" height="4" rx="1.5" fill="#a8cbb6" />

      {/* Main Dome Body */}
      <path
        d="M 168 126 C 168 88 182 78 200 78 C 218 78 232 88 232 126 Z"
        fill="url(#domeGrad)"
        stroke="#9dbfa9"
        strokeWidth="1.5"
      />

      {/* Dome Rib Lines */}
      <path d="M 184 125 C 184 96 193 84 200 78" stroke="#b0cfbd" strokeWidth="1" />
      <path d="M 216 125 C 216 96 207 84 200 78" stroke="#b0cfbd" strokeWidth="1" />
      <line x1="200" y1="78" x2="200" y2="126" stroke="#b0cfbd" strokeWidth="1" />

      {/* Dome Drum / Base with decorative arched windows */}
      <rect x="162" y="125" width="76" height="14" rx="2" fill="#c3ddce" stroke="#9bbfa8" strokeWidth="1" />
      <line x1="162" y1="131" x2="238" y2="131" stroke="#9bbfa8" strokeWidth="0.8" />
      {/* Windows on drum */}
      <rect x="174" y="133" width="5" height="5" rx="1" fill="#8fae9b" opacity="0.6" />
      <rect x="186" y="133" width="5" height="5" rx="1" fill="#8fae9b" opacity="0.6" />
      <rect x="198" y="133" width="5" height="5" rx="1" fill="#8fae9b" opacity="0.6" />
      <rect x="210" y="133" width="5" height="5" rx="1" fill="#8fae9b" opacity="0.6" />
      <rect x="222" y="133" width="5" height="5" rx="1" fill="#8fae9b" opacity="0.6" />

      {/* Middle Tier Archway Entablature */}
      <rect x="142" y="138" width="116" height="10" rx="1.5" fill="#d2e7db" stroke="#9bbfa8" strokeWidth="1" />

      {/* Main Colonnade (Pillared Hallway - Samvidhan Sadan / Parliament Circular Colonnade) */}
      <rect x="40" y="152" width="320" height="8" rx="1.5" fill="#bdd9c8" stroke="#96bba4" strokeWidth="1" />
      
      {/* Individual Classical Pillars */}
      {Array.from({ length: 32 }).map((_, i) => {
        const x = 48 + i * 9.5;
        return (
          <g key={i}>
            <rect x={x} y="160" width="4" height="42" fill="#c9e2d3" rx="0.5" />
            <line x1={x + 1} y1="160" x2={x + 1} y2="202" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
            <rect x={x - 0.5} y="159.5" width="5" height="2" fill="#9dbfa9" />
            <rect x={x - 0.5} y="201" width="5" height="2" fill="#9dbfa9" />
          </g>
        );
      })}

      {/* Colonnade Basement / Podium Base */}
      <rect x="36" y="202" width="328" height="12" rx="1" fill="url(#baseGrad)" stroke="#98bda6" strokeWidth="1" />
      <line x1="36" y1="207" x2="364" y2="207" stroke="#98bda6" strokeWidth="0.8" />
      <rect x="30" y="214" width="340" height="8" fill="#d8ebd0" opacity="0.5" />
    </svg>
  );
};

import React from 'react';

export const Studio1Floorplan: React.FC = () => {
  return (
    <svg
      id="floorplan-svg"
      className="absolute top-0 left-0 pointer-events-none"
      width="1500"
      height="1200"
      viewBox="0 0 1500 1200"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="#a0aec0" strokeWidth="10" fill="none">
        {/* Outer Walls */}
        <path
          d="M 100 100 L 1400 100 L 1400 1100 L 100 1100 L 100 100 Z"
          fill="#f8fafc"
          stroke="#4a5568"
          strokeWidth="15"
        />

        {/* Central Divider */}
        <rect
          x="600"
          y="100"
          width="40"
          height="1000"
          fill="#e2e8f0"
          stroke="#cbd5e0"
          strokeWidth="2"
        />
        <path
          d="M 620 120 L 620 1080"
          stroke="#a0aec0"
          strokeWidth="3"
          strokeDasharray="15 15"
        />
        
        {/* Right side structure (simulated) */}
        <rect
            x="1400"
            y="100"
            width="30"
            height="1000"
            fill="#e2e8f0"
            stroke="#cbd5e0"
            strokeWidth="2"
        />
      </g>
    </svg>
  );
};
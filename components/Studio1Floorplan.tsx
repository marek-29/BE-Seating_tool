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
        {/* Outer Walls with integrated protrusions */}
        <path
          d="M 100 100 L 475 100 L 475 225 L 490 225 L 490 100 L 1400 100 L 1400 1100 L 490 1100 L 490 1000 L 475 1000 L 475 1100 L 100 1100 L 100 100 Z"
          fill="#f8fafc"
          stroke="#4a5568"
          strokeWidth="15"
        />
      </g>
    </svg>
  );
};
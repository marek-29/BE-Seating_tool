import React from 'react';
import { Participant } from '../types';

interface ChairProps {
  chairId: string;
  seatNumber: number;
  assignedParticipant: Participant | null;
  style: React.CSSProperties;
  rotation: number;
  placement: 'top' | 'bottom' | 'left' | 'right';
  onParticipantMouseDown?: (e: React.MouseEvent, participantId: string) => void;
}

export const Chair: React.FC<ChairProps> = ({ chairId, seatNumber, assignedParticipant, style, rotation, placement, onParticipantMouseDown }) => {
  const nameParts = assignedParticipant?.name.split(' ') || [];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const getNameStyle = (): React.CSSProperties => {
    const baseTransform = `rotate(${-rotation}deg)`;
    switch (placement) {
      case 'top':
        return {
          bottom: '100%',
          left: '50%',
          transform: `translateX(-50%) ${baseTransform}`,
          marginBottom: '8px',
        };
      case 'bottom':
        return {
          top: '100%',
          left: '50%',
          transform: `translateX(-50%) ${baseTransform}`,
          marginTop: '8px',
        };
      case 'left':
        return {
          right: '100%',
          top: '50%',
          transform: `translateY(-50%) ${baseTransform}`,
          marginRight: '8px',
        };
      case 'right':
        return {
          left: '100%',
          top: '50%',
          transform: `translateY(-50%) ${baseTransform}`,
          marginLeft: '8px',
        };
      default:
        return {};
    }
  };

  const nameStyle = getNameStyle();

  const getContainerAlignment = () => {
    switch (placement) {
      case 'left':
        return 'items-end text-right';
      case 'right':
        return 'items-start text-left';
      default:
        return 'items-center text-center';
    }
  };


  return (
    <div
      id={chairId}
      className={`absolute w-6 h-6 ${assignedParticipant ? 'cursor-grab' : ''}`}
      style={style}
      onMouseDown={(e) => {
        if (assignedParticipant && onParticipantMouseDown) {
          e.stopPropagation();
          onParticipantMouseDown(e, assignedParticipant.id);
        }
      }}
    >
      {assignedParticipant && (
        <div
          className={`absolute w-max flex flex-col justify-center text-xs text-slate-700 leading-tight ${getContainerAlignment()}`}
          style={nameStyle}
        >
          <span className="font-semibold">{firstName}</span>
          <span>{lastName}</span>
        </div>
      )}
      <div
        className={`relative w-full h-full rounded-md border-2 font-bold text-sm transition-colors ${
          assignedParticipant
            ? 'bg-[#729282] border-[#5a7568] text-white'
            : 'bg-white border-slate-400 text-slate-500'
        }`}
      >
        {/*
          Using an SVG to render the seat number. This is far more robust for PDF
          exporting libraries like html2canvas, which can struggle with accurately
          rendering complex CSS layouts (like flex/grid centering or line-height)
          especially inside transformed (rotated) elements. The SVG provides an
          unambiguous, vector-based instruction for placing the text.
        */}
        <svg
          viewBox="0 0 20 20"
          className="absolute inset-0 w-full h-full"
        >
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            dy="0.5"
            style={{
              fill: 'currentColor',
              fontSize: '11px',
              fontWeight: 'bold',
              fontFamily: 'sans-serif',
            }}
          >
            {seatNumber}
          </text>
        </svg>
      </div>
    </div>
  );
};
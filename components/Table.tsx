import React, { useState, useEffect } from 'react';
import { Table as TableType, Participant } from '../types';
import { Chair } from './Chair';
import { TrashIcon, RotateIcon } from './icons';

type Handle = 'tl' | 'tr' | 'bl' | 'br';

interface TableProps {
  table: TableType;
  participants: Participant[];
  assignments: { [chairId: string]: string | null };
  onUpdate: (table: Partial<TableType> & { id: string }) => void;
  onDelete: (id: string) => void;
  onMouseDown: (e: React.MouseEvent, tableId: string) => void;
  onRotateMouseDown: (e: React.MouseEvent, tableId: string) => void;
  onResizeMouseDown: (e: React.MouseEvent, tableId: string, handle: Handle) => void;
  onParticipantMouseDown: (e: React.MouseEvent, participantId: string) => void;
  isSelected: boolean;
}

export const Table: React.FC<TableProps> = ({
  table,
  participants,
  assignments,
  onUpdate,
  onDelete,
  onMouseDown,
  onRotateMouseDown,
  onResizeMouseDown,
  onParticipantMouseDown,
  isSelected,
}) => {
  const [name, setName] = useState(table.name);
  const [chairCount, setChairCount] = useState(table.chairs);

  useEffect(() => {
    setName(table.name);
    setChairCount(table.chairs);
  }, [table]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };
  
  const handleNameBlur = () => {
    onUpdate({ id: table.id, name });
  };
  
  const handleChairChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = Math.max(0, parseInt(e.target.value) || 0);
    setChairCount(count);
  };
  
  const handleChairBlur = () => {
    onUpdate({ id: table.id, chairs: chairCount });
  };

  const renderChairs = () => {
    const chairsOnLongSide = Math.ceil(chairCount / 2);
    const chairElements: React.ReactElement[] = [];
    const chairGap = 15;
    const chairSize = 24;

    for (let i = 0; i < chairCount; i++) {
      const isTopSide = i < chairsOnLongSide;
      const sideIndex = isTopSide ? i : i - chairsOnLongSide;
      const chairsOnThisSide = isTopSide ? chairsOnLongSide : chairCount - chairsOnLongSide;
      const sideSpacing = table.width / (chairsOnThisSide + 1);

      const x = (sideIndex + 1) * sideSpacing - (chairSize / 2);
      const y = isTopSide ? -chairSize - chairGap : table.height + chairGap;

      const seatNumber = i + 1;
      const chairId = `${table.id}_${seatNumber}`;
      const participantId = assignments[chairId];
      const participant = participantId ? participants.find(p => p.id === participantId) : null;

      chairElements.push(
        <Chair
          key={chairId}
          chairId={chairId}
          seatNumber={seatNumber}
          assignedParticipant={participant || null}
          style={{ left: `${x}px`, top: `${y}px` }}
          rotation={table.rotation}
          isTopSide={isTopSide}
          onParticipantMouseDown={onParticipantMouseDown}
        />
      );
    }
    return chairElements;
  };

  return (
    <div
      id={`table_${table.id}`}
      className="absolute select-none cursor-move"
      style={{
        left: table.x,
        top: table.y,
        width: table.width,
        height: table.height,
        transform: `rotate(${table.rotation}deg)`,
        transformOrigin: 'center center',
      }}
      onMouseDown={(e) => onMouseDown(e, table.id)}
    >
      <div className={`relative w-full h-full bg-white border-2 rounded-lg shadow-lg flex items-center justify-center p-1 ${isSelected ? 'border-blue-500' : 'border-slate-300'}`}>
        {isSelected ? (
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            className="text-center font-bold text-slate-700 bg-transparent w-full p-2 outline-none"
            onMouseDown={(e) => e.stopPropagation()}
            autoFocus
            onFocus={(e) => e.target.select()}
          />
        ) : (
          <div className="text-center font-bold text-slate-700 p-2 select-none">
            {table.name}
          </div>
        )}

        {isSelected && (
          <>
            <button
              onClick={() => onDelete(table.id)}
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 z-10"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
            <div
              onMouseDown={(e) => onRotateMouseDown(e, table.id)}
              className="absolute -top-3 -left-3 w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center cursor-alias hover:bg-green-600 z-10"
            >
              <RotateIcon className="w-4 h-4" />
            </div>
            
            {/* Resize Handles */}
            <div onMouseDown={(e) => onResizeMouseDown(e, table.id, 'tl')} className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize z-20"></div>
            <div onMouseDown={(e) => onResizeMouseDown(e, table.id, 'tr')} className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize z-20"></div>
            <div onMouseDown={(e) => onResizeMouseDown(e, table.id, 'bl')} className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-nesw-resize z-20"></div>
            <div onMouseDown={(e) => onResizeMouseDown(e, table.id, 'br')} className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-nwse-resize z-20"></div>

            <div className="absolute -bottom-10 left-0 w-full flex items-center justify-center" onMouseDown={e => e.stopPropagation()}>
                <div style={{ transform: `rotate(${-table.rotation}deg)` }} className="bg-white px-2 py-1 rounded-md shadow-md flex items-center text-sm">
                    <label htmlFor={`chairs_${table.id}`} className="mr-2 font-medium text-slate-600">Chairs:</label>
                    <input
                        id={`chairs_${table.id}`}
                        type="number"
                        value={chairCount}
                        onChange={handleChairChange}
                        onBlur={handleChairBlur}
                        className="w-12 text-center border border-slate-300 rounded"
                    />
                </div>
            </div>
          </>
        )}
      </div>
      {renderChairs()}
    </div>
  );
};
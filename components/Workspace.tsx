import React from 'react';
import { SeatingPlan } from '../types';
import { Table } from './Table';
import { Toolbar } from './Toolbar';
import { Studio1Floorplan } from './Studio1Floorplan';

type Handle = 'tl' | 'tr' | 'bl' | 'br';

interface WorkspaceProps {
  state: SeatingPlan;
  dispatch: React.Dispatch<any>;
  selectedTableId: string | null;
  setSelectedTableId: (id: string | null) => void;
  onTableMouseDown: (e: React.MouseEvent, tableId: string) => void;
  onRotateMouseDown: (e: React.MouseEvent, tableId: string) => void;
  onResizeMouseDown: (e: React.MouseEvent, tableId: string, handle: Handle) => void;
  onParticipantMouseDown: (e: React.MouseEvent, participantId: string) => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}

export const Workspace = React.forwardRef<HTMLDivElement, WorkspaceProps>(({
  state,
  dispatch,
  selectedTableId,
  setSelectedTableId,
  onTableMouseDown,
  onRotateMouseDown,
  onResizeMouseDown,
  onParticipantMouseDown,
  zoom,
  onZoomChange,
  canUndo,
  canRedo,
  undo,
  redo,
}, ref) => {
  const { tables, participants, assignments, floorplan } = state;
  
  const handleWorkspaceClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Deselect if the click is on the container, the workspace grid, or the floorplan SVG
    if (target.id === 'workspace-container' || target.id === 'workspace' || target.closest('#floorplan-svg')) {
        setSelectedTableId(null);
    }
  };

  const gridStyle = {
    '--grid-color': 'rgba(203, 213, 225, 0.5)',
    '--grid-size': `${50 * zoom}px`,
    backgroundImage: `
      linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
      linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px)
    `,
    backgroundColor: 'white',
  };

  return (
    <div ref={ref} id="workspace-container" className="flex-grow h-full bg-slate-100 relative overflow-auto" onClick={handleWorkspaceClick}>
      <Toolbar
        onAddTable={() => dispatch({ type: 'ADD_TABLE' })}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        zoom={zoom}
        onZoomChange={onZoomChange}
      />
      <div
        id="workspace"
        className="absolute top-0 left-0"
        style={{...gridStyle, width: '10000px', height: '10000px'}}
      >
        <div 
          id="seating-plan" 
          className="relative origin-top-left" 
          style={{ transform: `scale(${zoom})`, width: `${100/zoom}%`, height: `${100/zoom}%`}}
        >
          {floorplan === 'studio1' && <Studio1Floorplan />}
          {tables.map(table => (
            <Table
              key={table.id}
              table={table}
              participants={participants}
              assignments={assignments}
              onUpdate={(updatedTable) => dispatch({ type: 'UPDATE_TABLE', table: updatedTable })}
              onDelete={(id) => dispatch({ type: 'DELETE_TABLE', id })}
              onMouseDown={onTableMouseDown}
              onRotateMouseDown={onRotateMouseDown}
              onResizeMouseDown={onResizeMouseDown}
              onParticipantMouseDown={onParticipantMouseDown}
              isSelected={selectedTableId === table.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

Workspace.displayName = 'Workspace';
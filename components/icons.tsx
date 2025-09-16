import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Workspace } from './components/Workspace';
import { useSeatingPlanState } from './hooks/useSeatingPlanState';
import { exportToPDF } from './lib/fileUtils';
import { Table as TableType } from './types';

type Handle = 'tl' | 'tr' | 'bl' | 'br';

type DragItem = 
  | { type: 'participant'; id: string; name: string }
  | { type: 'table'; id: string; offsetX: number; offsetY: number; }
  | { type: 'rotate'; id: string; centerX: number; centerY: number }
  | { type: 'resize'; id: string; handle: Handle; originalTable: TableType };

function App() {
  const { state, dispatch, canUndo, canRedo, undo, redo } = useSeatingPlanState();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const workspaceRef = useRef<HTMLDivElement>(null);
  
  const handleExportPDF = useCallback(() => {
    // Deselect table first to hide handles in the PDF
    setSelectedTableId(null);
    // Use a timeout to wait for the UI to re-render before capturing
    setTimeout(() => {
        const element = workspaceRef.current;
        if (element) {
            exportToPDF(element);
        }
    }, 100);
  }, []);

  const handleParticipantMouseDown = (e: React.MouseEvent, participantId: string) => {
    e.preventDefault();
    const participant = state.participants.find(p => p.id === participantId);
    if (participant) {
      setDragItem({ type: 'participant', id: participant.id, name: participant.name });
      setDragPosition({ x: e.clientX, y: e.clientY });
    }
  };
  
  const handleTableMouseDown = (e: React.MouseEvent, tableId: string) => {
    e.stopPropagation();
    setSelectedTableId(tableId);
    const table = state.tables.find(t => t.id === tableId);
    if (table) {
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const offsetX = (e.clientX - rect.left) / zoom;
      const offsetY = (e.clientY - rect.top) / zoom;
      setDragItem({ type: 'table', id: tableId, offsetX, offsetY });
    }
  };

  const handleRotateMouseDown = (e: React.MouseEvent, tableId: string) => {
    e.stopPropagation();
    const tableElement = document.getElementById(`table_${tableId}`);
    if (tableElement) {
        const rect = tableElement.getBoundingClientRect();
        const centerX = rect.left + (rect.width / 2);
        const centerY = rect.top + (rect.height / 2);
        setDragItem({ type: 'rotate', id: tableId, centerX, centerY });
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent, tableId: string, handle: Handle) => {
    e.stopPropagation();
    const table = state.tables.find(t => t.id === tableId);
    if (table) {
      setDragItem({ type: 'resize', id: tableId, handle, originalTable: table });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragItem) return;
    setDragPosition({ x: e.clientX, y: e.clientY });

    const workspaceRect = workspaceRef.current?.getBoundingClientRect();
    if (!workspaceRect) return;

    if (dragItem.type === 'table') {
        const x = (e.clientX - workspaceRect.left) / zoom - dragItem.offsetX;
        const y = (e.clientY - workspaceRect.top) / zoom - dragItem.offsetY;
        dispatch({ type: 'UPDATE_TABLE', table: { id: dragItem.id, x, y } });
    } else if (dragItem.type === 'rotate') {
        const dx = e.clientX - dragItem.centerX;
        const dy = e.clientY - dragItem.centerY;
        const rotation = Math.atan2(dy, dx) * (180 / Math.PI);
        dispatch({ type: 'UPDATE_TABLE', table: { id: dragItem.id, rotation } });
    } else if (dragItem.type === 'resize') {
        const { originalTable, handle } = dragItem;
        const { x, y, width, height, rotation } = originalTable;
        
        const mouseX = (e.clientX - workspaceRect.left) / zoom;
        const mouseY = (e.clientY - workspaceRect.top) / zoom;

        const rad = rotation * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const center = { x: x + width / 2, y: y + height / 2 };

        const getCorner = (cx: number, cy: number, w: number, h: number, corner: Handle) => {
            const relX = (corner.includes('l') ? -w : w) / 2;
            const relY = (corner.includes('t') ? -h : h) / 2;
            return {
                x: cx + (relX * cos - relY * sin),
                y: cy + (relX * sin + relY * cos),
            };
        };

        const oppositeCornerMap: { [key in Handle]: Handle } = { tl: 'br', tr: 'bl', bl: 'tr', br: 'tl' };
        const fixedCorner = getCorner(center.x, center.y, width, height, oppositeCornerMap[handle]);
        
        const diagonalVec = { x: mouseX - fixedCorner.x, y: mouseY - fixedCorner.y };
        
        const unrotRad = -rad;
        const unrotCos = Math.cos(unrotRad);
        const unrotSin = Math.sin(unrotRad);

        let newWidth = diagonalVec.x * unrotCos - diagonalVec.y * unrotSin;
        let newHeight = diagonalVec.x * unrotSin + diagonalVec.y * unrotCos;

        if (handle.includes('l')) newWidth = -newWidth;
        if (handle.includes('t')) newHeight = -newHeight;

        const minSize = 40;
        newWidth = Math.max(minSize, newWidth);
        newHeight = Math.max(minSize, newHeight);

        const oppositeHandle = oppositeCornerMap[handle];
        const relX_n = (oppositeHandle.includes('l') ? -newWidth : newWidth) / 2;
        const relY_n = (oppositeHandle.includes('t') ? -newHeight : newHeight) / 2;

        const newCenterX = fixedCorner.x - (relX_n * cos - relY_n * sin);
        const newCenterY = fixedCorner.y - (relX_n * sin + relY_n * cos);

        const newX = newCenterX - newWidth / 2;
        const newY = newCenterY - newHeight / 2;

        dispatch({
            type: 'UPDATE_TABLE',
            table: { id: dragItem.id, x: newX, y: newY, width: newWidth, height: newHeight },
        });
    }
  }, [dragItem, dispatch, zoom]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!dragItem) return;

    if (dragItem.type === 'participant') {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const chairElement = el?.closest('[id^="t_"]');

      if (chairElement) {
        const idParts = chairElement.id.split('_');
        if (idParts.length >= 3) {
          const seatNumberStr = idParts.pop();
          if (typeof seatNumberStr === 'string') {
            const tableId = idParts.join('_');
            const seatNumber = parseInt(seatNumberStr, 10);
    
            if (tableId && !isNaN(seatNumber)) {
              dispatch({ type: 'ASSIGN_SEAT', participantId: dragItem.id, tableId, seatNumber });
            }
          }
        }
      } else {
        const isOverSidebar = e.clientX < 320; // 320px is sidebar width
        if (!isOverSidebar) {
            dispatch({ type: 'UNASSIGN_SEAT', participantId: dragItem.id });
        }
      }
    }
    setDragItem(null);
  }, [dragItem, dispatch]);

  useEffect(() => {
    if (dragItem) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragItem, handleMouseMove, handleMouseUp]);

  return (
    <div className="flex h-screen font-sans bg-slate-100">
      <Sidebar state={state} dispatch={dispatch} onParticipantMouseDown={handleParticipantMouseDown} />
      <Workspace
        ref={workspaceRef}
        state={state}
        dispatch={dispatch}
        selectedTableId={selectedTableId}
        setSelectedTableId={setSelectedTableId}
        onTableMouseDown={handleTableMouseDown}
        onRotateMouseDown={handleRotateMouseDown}
        onResizeMouseDown={handleResizeMouseDown}
        onParticipantMouseDown={handleParticipantMouseDown}
        zoom={zoom}
        onZoomChange={setZoom}
        canUndo={canUndo}
        canRedo={canRedo}
        undo={undo}
        redo={redo}
        onExportPDF={handleExportPDF}
      />
      {dragItem?.type === 'participant' && (
        <div
          className="fixed pointer-events-none z-50 bg-blue-500 text-white px-3 py-1 rounded-md shadow-lg"
          style={{ left: dragPosition.x + 10, top: dragPosition.y + 10 }}
        >
          {dragItem.name}
        </div>
      )}
    </div>
  );
}

export default App;

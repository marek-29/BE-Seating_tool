
import React from 'react';
import { AddIcon, UndoIcon, RedoIcon, PdfIcon, ZoomInIcon, ZoomOutIcon, TableIcon } from './icons';

interface ToolbarProps {
  onAddTable: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExportPDF: () => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
}

const ToolButton: React.FC<{ onClick?: () => void; disabled?: boolean; children: React.ReactNode; title: string }> = ({ onClick, disabled, children, title }) => (
    <button
        title={title}
        onClick={onClick}
        disabled={disabled}
        className="flex items-center justify-center p-2 h-10 w-10 bg-white rounded-md shadow-md text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
        {children}
    </button>
);

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddTable,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExportPDF,
  zoom,
  onZoomChange,
}) => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-lg flex items-center space-x-2">
      <ToolButton onClick={onAddTable} title="Add Table">
        <TableIcon className="w-5 h-5" />
      </ToolButton>
      
      <div className="w-px h-6 bg-slate-300 mx-1"></div>

      <ToolButton onClick={onUndo} disabled={!canUndo} title="Undo">
        <UndoIcon className="w-5 h-5" />
      </ToolButton>
      <ToolButton onClick={onRedo} disabled={!canRedo} title="Redo">
        <RedoIcon className="w-5 h-5" />
      </ToolButton>

      <div className="w-px h-6 bg-slate-300 mx-1"></div>

      <ToolButton onClick={() => onZoomChange(Math.max(0.2, zoom - 0.1))} title="Zoom Out">
        <ZoomOutIcon className="w-5 h-5" />
      </ToolButton>
      <span className="text-sm font-medium text-slate-600 w-12 text-center">{(zoom * 100).toFixed(0)}%</span>
      <ToolButton onClick={() => onZoomChange(Math.min(2, zoom + 0.1))} title="Zoom In">
        <ZoomInIcon className="w-5 h-5" />
      </ToolButton>
      
      <div className="w-px h-6 bg-slate-300 mx-1"></div>

      <ToolButton onClick={onExportPDF} title="Export as PDF">
        <PdfIcon className="w-5 h-5" />
      </ToolButton>
    </div>
  );
};

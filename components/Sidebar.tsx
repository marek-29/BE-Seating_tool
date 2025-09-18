import React, { useState, useRef } from 'react';
import { SeatingPlan, Participant, Action } from '@/types';
import { AddIcon, TrashIcon, UploadIcon, DownloadIcon, PdfIcon } from './icons';
import { importFromExcel, exportToExcel, importPlanFromJSON, exportPlanToJSON } from '@/lib/fileUtils';
import { studio1Template } from '@/lib/templates';

interface ParticipantItemProps {
  participant: Participant;
  assignment: { table: string; seat: string } | null;
  onDelete: (id: string) => void;
  onMouseDown: (e: React.MouseEvent, participantId: string) => void;
}

const ParticipantItem: React.FC<ParticipantItemProps> = ({ participant, assignment, onDelete, onMouseDown }) => {
  const isAssigned = !!assignment;
  return (
    <div
      onMouseDown={(e) => onMouseDown(e, participant.id)}
      className={`flex items-center justify-between p-2 rounded-md cursor-grab transition-colors ${
        isAssigned ? 'bg-[#729282]/20' : 'bg-slate-50 hover:bg-slate-100'
      }`}
    >
      <div>
        <p className="font-medium text-slate-800">{participant.name}</p>
        {isAssigned && (
          <p className="text-xs text-[#5a7568]">{`${assignment.table}, Seat ${assignment.seat}`}</p>
        )}
      </div>
      <button onClick={() => onDelete(participant.id)} className="text-slate-400 hover:text-red-500 p-1">
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  );
};


interface SidebarProps {
  state: SeatingPlan;
  dispatch: React.Dispatch<Action>;
  onParticipantMouseDown: (e: React.MouseEvent, participantId: string) => void;
  onExportPDF: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ state, dispatch, onParticipantMouseDown, onExportPDF }) => {
  const [newParticipantName, setNewParticipantName] = useState('');
  const participantFileInputRef = useRef<HTMLInputElement>(null);
  const planFileInputRef = useRef<HTMLInputElement>(null);

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'ADD_PARTICIPANT', name: newParticipantName });
    setNewParticipantName('');
  };

  const handleImportParticipants = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const participants = await importFromExcel(file);
        dispatch({ type: 'IMPORT_PARTICIPANTS', participants });
      } catch (error) {
        console.error("Failed to import participants:", error);
        alert("Error importing file. Please check the format.");
      }
    }
  };
  
  const handleLoadPlan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const plan = await importPlanFromJSON(file);
        dispatch({ type: 'LOAD_PLAN', plan });
      } catch (error) {
        console.error("Failed to load plan:", error);
        alert("Error loading plan file. Please select a valid plan file.");
      }
    }
  };

  const getParticipantAssignment = (participantId: string) => {
    const chairId = Object.keys(state.assignments).find(
      key => state.assignments[key] === participantId
    );
    if (!chairId) return null;

    const idParts = chairId.split('_');
    // A valid ID is like 't_12345_1', which has at least 3 parts.
    if (idParts.length < 3) return null;

    const seatNumber = idParts.pop(); // last part is seat number
    const tableId = idParts.join('_'); // re-join the rest for table ID
    const table = state.tables.find(t => t.id === tableId);
    
    return { table: table?.name || '?', seat: seatNumber || '?' };
  };

  return (
    <div className="w-80 bg-white h-screen flex flex-col border-r border-slate-200 shadow-md">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <img 
            src="https://berlinevent.de/wp-content/uploads/2025/01/cropped-Favicon-Berlievent.png"
            alt="Berlinevent Logo"
            className="h-8 w-8"
          />
          <div>
            <h1 className="text-xl font-bold text-slate-800">Berlin Event Seating Tool</h1>
            <p className="text-sm text-slate-500">Participant Management</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-b border-slate-200">
        <form onSubmit={handleAddParticipant} className="flex items-center space-x-2">
          <input
            type="text"
            value={newParticipantName}
            onChange={(e) => setNewParticipantName(e.target.value)}
            placeholder="Add new participant"
            className="flex-grow p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-[#729282] focus:border-[#729282] outline-none"
          />
          <button type="submit" className="p-2 bg-[#002C5F] text-white rounded-md hover:bg-[#00224a] disabled:bg-slate-300" disabled={!newParticipantName.trim()}>
            <AddIcon className="w-5 h-5" />
          </button>
        </form>
        <div className="flex items-center space-x-2 mt-3">
          <button onClick={() => participantFileInputRef.current?.click()} className="flex-1 flex items-center justify-center p-2 bg-[#002C5F] text-white rounded-md text-sm hover:bg-[#00224a]">
            <UploadIcon className="w-4 h-4 mr-2" />
            Import (.xlsx)
          </button>
          <input type="file" ref={participantFileInputRef} onChange={handleImportParticipants} accept=".xlsx, .xls" className="hidden"/>
          <button onClick={() => exportToExcel(state)} className="flex-1 flex items-center justify-center p-2 bg-[#729282] text-white rounded-md text-sm hover:bg-[#617c6e]">
            <DownloadIcon className="w-4 h-4 mr-2" />
            Export (.xlsx)
          </button>
        </div>
         <div className="mt-3">
            <button
                onClick={onExportPDF}
                className="w-full flex items-center justify-center p-2 bg-slate-200 text-slate-700 rounded-md text-sm hover:bg-slate-300"
            >
                <PdfIcon className="w-4 h-4 mr-2" />
                PDF exportieren
            </button>
        </div>
      </div>
      
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-700 mb-3">Plan Management</h2>
        <div className="flex items-center space-x-2">
            <button onClick={() => planFileInputRef.current?.click()} className="flex-1 flex items-center justify-center p-2 bg-[#002C5F] text-white rounded-md text-sm hover:bg-[#00224a]">
                <UploadIcon className="w-4 h-4 mr-2" />
                Bestuhlungsplan laden
            </button>
            <input type="file" ref={planFileInputRef} onChange={handleLoadPlan} accept=".json" className="hidden"/>
            <button onClick={() => exportPlanToJSON(state)} className="flex-1 flex items-center justify-center p-2 bg-[#729282] text-white rounded-md text-sm hover:bg-[#617c6e]">
                <DownloadIcon className="w-4 h-4 mr-2" />
                Bestuhlungsplan speichern
            </button>
        </div>
      </div>
      
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-700 mb-3">Vorlagen</h2>
        <button 
          onClick={() => dispatch({ type: 'LOAD_TEMPLATE', template: studio1Template })}
          className="w-full flex items-center justify-center p-2 bg-white border border-slate-300 text-slate-700 rounded-md text-sm hover:bg-slate-50"
        >
          Studio 1 laden
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-2">
        <h2 className="text-lg font-semibold text-slate-700 mb-2">Participant List ({state.participants.length})</h2>
        {state.participants.map(p => (
          <ParticipantItem
            key={p.id}
            participant={p}
            assignment={getParticipantAssignment(p.id)}
            onDelete={(id) => dispatch({ type: 'DELETE_PARTICIPANT', id })}
            onMouseDown={onParticipantMouseDown}
          />
        ))}
      </div>
    </div>
  );
};
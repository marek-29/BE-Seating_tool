
import React, { useState } from 'react';
import { SeatingPlan, Participant, Action } from '../types';
import { AddIcon, TrashIcon } from './icons';

interface ParticipantItemProps {
  participant: Participant;
  assignment: { table: string; seat: string } | null;
  onDelete: (id: string) => void;
  onMouseDown: (e: React.MouseEvent, participantId: string) => void;
}

const ParticipantItem: React.FC<ParticipantItemProps> = ({ participant, assignment, onDelete, onMouseDown }) => {
  const isAssigned = !!assignment;

  const handleDeleteClick = () => {
    // Confirmation dialog removed as per user request
    onDelete(participant.id);
  };

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
          <p className="text-xs text-[#5a7568]">{`${assignment.table}, Platz ${assignment.seat}`}</p>
        )}
      </div>
      <button 
        onClick={handleDeleteClick} 
        onMouseDown={(e) => e.stopPropagation()} // Stop propagation to prevent drag
        className="text-slate-400 hover:text-red-500 p-1">
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  );
};


interface SidebarProps {
  state: SeatingPlan;
  dispatch: React.Dispatch<Action>;
  onParticipantMouseDown: (e: React.MouseEvent, participantId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ state, dispatch, onParticipantMouseDown }) => {
  const [newParticipantName, setNewParticipantName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'ADD_PARTICIPANT', name: newParticipantName });
    setNewParticipantName('');
  };

  const getParticipantAssignment = (participantId: string) => {
    const chairId = Object.keys(state.assignments).find(
      key => state.assignments[key] === participantId
    );
    if (!chairId) return null;

    const idParts = chairId.split('_');
    if (idParts.length < 3) return null;

    const seatNumber = idParts.pop();
    const tableId = idParts.join('_');
    const table = state.tables.find(t => t.id === tableId);
    
    return { table: table?.name || '?', seat: seatNumber || '?' };
  };

  const filteredParticipants = state.participants.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 bg-white h-full flex flex-col border-r border-slate-200 shadow-md">
      <div className="p-4 border-b border-slate-200">
        <h1 className="text-lg font-semibold text-slate-700 mb-3">Participant Management</h1>
        <form onSubmit={handleAddParticipant} className="flex items-center space-x-2">
          <input
            type="text"
            value={newParticipantName}
            onChange={(e) => setNewParticipantName(e.target.value)}
            placeholder="Neuen Teilnehmer hinzufügen"
            className="flex-grow p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-[#729282] focus:border-[#729282] outline-none"
          />
          <button type="submit" className="p-2 bg-[#002C5F] text-white rounded-md hover:bg-[#00224a] disabled:bg-slate-300" disabled={!newParticipantName.trim()}>
            <AddIcon className="w-5 h-5" />
          </button>
        </form>
      </div>

      <div className="p-4 border-b border-slate-200">
        <input
          type="text"
          placeholder="Teilnehmer suchen..."
          className="w-full p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-[#729282] focus:border-[#729282] outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-2">
         <h2 className="text-base font-semibold text-slate-700 mb-2 sticky top-0 bg-white py-1">
          Teilnehmerliste ({filteredParticipants.length} / {state.participants.length})
         </h2>
        {filteredParticipants.map(p => (
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

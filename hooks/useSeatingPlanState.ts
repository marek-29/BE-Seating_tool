
import { useReducer, useCallback } from 'react';
import { SeatingPlan, Action, Participant, Table } from '../types';

const initialState: SeatingPlan = {
  tables: [],
  participants: [],
  assignments: {},
  floorplan: null,
};

type StateWithHistory = {
  past: SeatingPlan[];
  present: SeatingPlan;
  future: SeatingPlan[];
};

const initialHistoryState: StateWithHistory = {
  past: [],
  present: initialState,
  future: [],
};

const reducer = (state: StateWithHistory, action: Action): StateWithHistory => {
  const { past, present, future } = state;

  if (action.type === 'UNDO') {
    if (past.length === 0) return state;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    return {
      past: newPast,
      present: previous,
      future: [present, ...future],
    };
  }

  if (action.type === 'REDO') {
    if (future.length === 0) return state;
    const next = future[0];
    const newFuture = future.slice(1);
    return {
      past: [...past, present],
      present: next,
      future: newFuture,
    };
  }
  
  if (action.type === 'RESET') {
      return {
          past: [...past, present],
          present: initialState,
          future: []
      };
  }

  // For other actions, we update the present state and history
  const newPresent = produceNewState(present, action);

  if (present === newPresent) {
    return state; // No change
  }

  return {
    past: [...past, present],
    present: newPresent,
    future: [],
  };
};

const produceNewState = (currentState: SeatingPlan, action: Action): SeatingPlan => {
  switch (action.type) {
    case 'ADD_PARTICIPANT': {
      if (!action.name.trim()) return currentState;
      const newParticipant: Participant = { id: `p_${Date.now()}`, name: action.name };
      return {
        ...currentState,
        participants: [...currentState.participants, newParticipant],
      };
    }
    case 'DELETE_PARTICIPANT': {
      // Also unassign participant if they are seated
      const newAssignments = { ...currentState.assignments };
      Object.keys(newAssignments).forEach(key => {
        if (newAssignments[key] === action.id) {
          newAssignments[key] = null;
        }
      });
      return {
        ...currentState,
        participants: currentState.participants.filter(p => p.id !== action.id),
        assignments: newAssignments,
      };
    }
    case 'IMPORT_PARTICIPANTS': {
        const newParticipants = action.participants.filter(p => !currentState.participants.some(ep => ep.name === p.name));
        return { ...currentState, participants: [...currentState.participants, ...newParticipants] };
    }
    case 'ADD_TABLE': {
      const newTable: Table = {
        id: `t_${Date.now()}`,
        name: `Tisch ${currentState.tables.length + 1}`,
        x: 100, y: 100,
        width: 80, height: 204,
        rotation: 0,
        chairs: 8,
      };
      return { ...currentState, tables: [...currentState.tables, newTable] };
    }
    case 'DELETE_TABLE': {
        const newAssignments = { ...currentState.assignments };
        Object.keys(newAssignments).forEach(key => {
            if(key.startsWith(`${action.id}_`)){
                delete newAssignments[key];
            }
        });
        return {
            ...currentState,
            tables: currentState.tables.filter(t => t.id !== action.id),
            assignments: newAssignments
        };
    }
    case 'UPDATE_TABLE': {
      return {
        ...currentState,
        tables: currentState.tables.map(t =>
          t.id === action.table.id ? { ...t, ...action.table } : t
        ),
      };
    }
    case 'ASSIGN_SEAT': {
      const { participantId, tableId, seatNumber } = action;
      const targetChairId = `${tableId}_${seatNumber}`;

      const currentSeat = Object.entries(currentState.assignments).find(([, pId]) => pId === participantId);
      if (currentSeat && currentSeat[0] === targetChairId) {
        return currentState;
      }

      const newAssignments = { ...currentState.assignments };
      
      const occupantInTargetChairId = newAssignments[targetChairId] || null;
      const originalChairIdOfDraggedParticipant = Object.keys(newAssignments).find(key => newAssignments[key] === participantId);
      
      newAssignments[targetChairId] = participantId;
      
      if (originalChairIdOfDraggedParticipant) {
        newAssignments[originalChairIdOfDraggedParticipant] = occupantInTargetChairId;
      }

      return { ...currentState, assignments: newAssignments };
    }
    case 'UNASSIGN_SEAT': {
      const { participantId } = action;
      const newAssignments = { ...currentState.assignments };
       Object.keys(newAssignments).forEach(key => {
        if (newAssignments[key] === participantId) {
          newAssignments[key] = null;
        }
      });
      return { ...currentState, assignments: newAssignments };
    }
    case 'LOAD_PLAN': {
      return { ...action.plan, floorplan: action.plan.floorplan || null };
    }
    case 'LOAD_TEMPLATE': {
        return {
            ...currentState, // Keep existing participants
            tables: action.template.tables,
            assignments: action.template.assignments, // Reset assignments
            floorplan: action.template.floorplan,
        }
    }
    default:
      return currentState;
  }
};

export const useSeatingPlanState = () => {
  const [state, dispatch] = useReducer(reducer, initialHistoryState);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);

  return { state: state.present, dispatch, canUndo, canRedo, undo, redo };
};
export interface Participant {
  id: string;
  name: string;
}

export interface Chair {
  id: string;
  seatNumber: number;
}

export interface Table {
  id:string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  chairs: number;
}

export interface Assignment {
  [chairId: string]: string | null; // participantId
}

export interface SeatingPlan {
  tables: Table[];
  participants: Participant[];
  assignments: Assignment;
}

export type Action =
  | { type: 'ADD_PARTICIPANT'; name: string }
  | { type: 'DELETE_PARTICIPANT'; id: string }
  | { type: 'IMPORT_PARTICIPANTS'; participants: Participant[] }
  | { type: 'ADD_TABLE' }
  | { type: 'DELETE_TABLE'; id: string }
  | { type: 'UPDATE_TABLE'; table: Partial<Table> & { id: string } }
  | { type: 'ASSIGN_SEAT'; participantId: string; tableId: string; seatNumber: number }
  | { type: 'UNASSIGN_SEAT'; participantId: string }
  | { type: 'LOAD_PLAN'; plan: SeatingPlan }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET' };
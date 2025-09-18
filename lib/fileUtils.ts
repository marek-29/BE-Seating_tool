import { Participant, SeatingPlan, Table } from '@/types';

declare var XLSX: any;
declare var jspdf: any;
declare var html2canvas: any;

export const importFromExcel = (file: File): Promise<Participant[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const participants: Participant[] = json
          .slice(1) // Skip header row
          .map((row: any) => ({
            id: `p_${Date.now()}_${Math.random()}`,
            name: row[0] || '',
          }))
          .filter(p => p.name.trim() !== '');
          
        resolve(participants);
      } catch (e) {
        console.error("Error reading Excel file:", e);
        reject(new Error("Fehler beim Lesen der Excel-Datei."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

export const exportToExcel = (state: SeatingPlan) => {
  const data: any[] = [['Name', 'Tisch', 'Platz']];
  const participantMap = new Map(state.participants.map((p: Participant) => [p.id, p.name]));
  const tableMap = new Map(state.tables.map((t: Table) => [t.id, t.name]));

  const assignedParticipants = new Set<string>();

  Object.entries(state.assignments).forEach(([chairId, participantId]) => {
    if (participantId) {
      const idParts = chairId.split('_');
      // A valid ID has at least 3 parts: 't', timestamp, seatNumber
      if (idParts.length >= 3) {
        const seatNumber = idParts.pop();
        const tableId = idParts.join('_');
        
        const participantName = participantMap.get(participantId);
        const tableName = tableMap.get(tableId);

        if (participantName && tableName && seatNumber) {
          data.push([participantName, tableName, seatNumber ?? '']);
          assignedParticipants.add(participantId);
        }
      }
    }
  });

  // Add unassigned participants
  state.participants.forEach((p: Participant) => {
    if (!assignedParticipants.has(p.id)) {
      data.push([p.name, 'Nicht zugewiesen', '']);
    }
  });

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Seating Plan');
  XLSX.writeFile(workbook, 'seating_plan.xlsx');
};


export const exportToPDF = async (viewportElement: HTMLElement) => {
    if (!viewportElement) {
        console.error("Viewport element not provided for PDF export!");
        return;
    }

    // The element with the grid that we want to capture
    const captureTarget = viewportElement.querySelector<HTMLElement>('#workspace');
    // The toolbar that we want to hide
    const toolbar = viewportElement.querySelector<HTMLElement>(':scope > div[class*="absolute top-4"]');

    if (!captureTarget) {
        console.error("Workspace element to capture not found!");
        return;
    }

    if (toolbar) {
        toolbar.style.visibility = 'hidden';
    }

    try {
        const canvas = await html2canvas(captureTarget, {
            scale: 2, // Higher resolution
            useCORS: true,
            backgroundColor: '#ffffff', // Explicitly set background
            // Cropping coordinates are relative to the capture target
            x: viewportElement.scrollLeft,
            y: viewportElement.scrollTop,
            width: viewportElement.clientWidth,
            height: viewportElement.clientHeight,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save("seating_plan.pdf");

    } catch (error) {
        console.error("Error exporting to PDF:", error);
    } finally {
        if (toolbar) {
            toolbar.style.visibility = 'visible';
        }
    }
};

export const exportPlanToJSON = (state: SeatingPlan) => {
  try {
    const jsonString = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'seating_plan.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting plan to JSON:", error);
    alert("Fehler beim Speichern des Plans.");
  }
};

export const importPlanFromJSON = (file: File): Promise<SeatingPlan> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        const plan: SeatingPlan = JSON.parse(jsonString);
        // Basic validation
        if (plan && Array.isArray(plan.tables) && Array.isArray(plan.participants) && typeof plan.assignments === 'object') {
          resolve(plan);
        } else {
          reject(new Error("Ungültige JSON-Struktur für einen Bestuhlungsplan."));
        }
      } catch (e) {
        console.error("Error parsing JSON file:", e);
        reject(new Error("Fehler beim Lesen der JSON-Datei."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};
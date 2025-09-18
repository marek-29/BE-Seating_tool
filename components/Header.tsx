import React, { useState, useRef, useEffect } from 'react';
import { UploadIcon, DownloadIcon, PdfIcon } from './icons';

interface HeaderProps {
    onImportParticipants: () => void;
    onExportParticipants: () => void;
    onSavePlan: () => void;
    onLoadPlan: () => void;
    onExportPDF: () => void;
    onLoadTemplate: () => void;
}

const DropdownMenu: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const node = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (node.current?.contains(e.target as Node)) {
                return;
            }
            setIsOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={node}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#729282]"
            >
                {title}
            </button>
            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-30">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

const MenuItem: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <button
        onClick={onClick}
        className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 text-left"
        role="menuitem"
    >
        {children}
    </button>
);


export const Header: React.FC<HeaderProps> = ({
    onImportParticipants,
    onExportParticipants,
    onSavePlan,
    onLoadPlan,
    onExportPDF,
    onLoadTemplate,
}) => {
    return (
        <header className="flex items-center justify-between p-2 h-16 bg-white border-b border-slate-200 shadow-sm z-30">
             <div className="flex items-center space-x-3">
                <img 
                    src="https://berlinevent.de/wp-content/uploads/2025/01/cropped-Favicon-Berlievent.png"
                    alt="Berlinevent Logo"
                    className="h-8 w-8"
                />
                <h1 className="text-xl font-bold text-slate-800 hidden sm:block">Berlin Event Seating Tool</h1>
            </div>
            <nav className="flex items-center space-x-2">
                <DropdownMenu title="Teilnehmer">
                    <MenuItem onClick={onImportParticipants}>
                        <UploadIcon className="w-4 h-4 mr-3" />
                        Import (.xlsx)
                    </MenuItem>
                    <MenuItem onClick={onExportParticipants}>
                        <DownloadIcon className="w-4 h-4 mr-3" />
                        Export (.xlsx)
                    </MenuItem>
                </DropdownMenu>
                <DropdownMenu title="Bestuhlungsplan">
                     <MenuItem onClick={onSavePlan}>
                        <DownloadIcon className="w-4 h-4 mr-3" />
                        Speichern (.json)
                    </MenuItem>
                    <MenuItem onClick={onLoadPlan}>
                        <UploadIcon className="w-4 h-4 mr-3" />
                        Laden (.json)
                    </MenuItem>
                    <MenuItem onClick={onExportPDF}>
                        <PdfIcon className="w-4 h-4 mr-3" />
                        PDF exportieren
                    </MenuItem>
                </DropdownMenu>
                 <DropdownMenu title="Vorlagen">
                    <MenuItem onClick={onLoadTemplate}>
                        Studio 1 laden
                    </MenuItem>
                </DropdownMenu>
            </nav>
        </header>
    );
};
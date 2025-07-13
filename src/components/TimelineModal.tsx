
import React from 'react';
import type { TimelineEvent } from '../types';

interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: TimelineEvent[];
  isLoading: boolean;
  error: string | null;
}

export const TimelineModal: React.FC<TimelineModalProps> = ({ isOpen, onClose, events, isLoading, error }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md md:max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Event Timeline</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="p-6 overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full py-10">
              <svg className="animate-spin h-8 w-8 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 text-gray-400">Building event timeline...</p>
            </div>
          )}
          {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-md">{error}</div>}

          {!isLoading && !error && events.length > 0 && (
            <div className="relative border-l-2 border-gray-600 pl-6">
              {events.map((item, index) => (
                <div key={index} className="mb-8 last:mb-0">
                  <div className="absolute -left-[11px] h-5 w-5 rounded-full bg-cyan-500 ring-8 ring-gray-800"></div>
                  <p className="text-sm font-semibold text-cyan-400">{item.date}</p>
                  <p className="mt-1 text-gray-300">{item.event}</p>
                </div>
              ))}
            </div>
          )}

          {!isLoading && !error && events.length === 0 && (
            <p className="text-gray-500 text-center py-10">No clear timeline could be constructed from the available articles.</p>
          )}
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import type { Briefing, Language } from '../types';

interface BriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  briefing: Briefing | null;
  isLoading: boolean;
  error: string | null;
  language: Language;
}

export const BriefingModal: React.FC<BriefingModalProps> = ({ isOpen, onClose, briefing, isLoading, error, language }) => {
  
  const createMarkup = (text: string) => {
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Process markdown links first
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:underline">$1</a>')
      // Process bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
      // Process bullet points
      .replace(/^\s*\*\s(.*?)$/gm, '<li>$1</li>')
      // Wrap consecutive list items in <ul>
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      // Merge adjacent <ul> tags that might result from the previous replacement
      .replace(/<\/ul>\s*<ul>/g, '')
      // Finally, replace newlines with <br>
      .replace(/\n/g, '<br />');

    // Clean up <br> tags around lists
    html = html.replace(/<br \/><ul>/g, '<ul>').replace(/<\/ul><br \/>/g, '</ul>');
    
    return { __html: html };
  };
  
  if (!isOpen) {
    return null;
  }

  const summary = (language === 'zh' && briefing?.summary_zh) ? briefing.summary_zh : briefing?.summary_en;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md md:max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Daily Intelligence Briefing</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        
        <div className="p-6 overflow-y-auto min-h-[150px]">
          {(isLoading && !summary) && (
            <div className="flex flex-col items-center justify-center h-full">
              <svg className="animate-spin h-8 w-8 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 text-gray-400">Generating your briefing...</p>
            </div>
          )}
          {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-md">{error}</div>}
          
          {summary && (
             <div className="prose prose-invert prose-a:text-cyan-400 prose-li:my-1 prose-ul:pl-2 leading-relaxed text-gray-300"
                  dangerouslySetInnerHTML={createMarkup(summary)} />
          )}
        </div>
      </div>
    </div>
  );
};
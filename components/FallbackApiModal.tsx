
import React, { useState } from 'react';

interface FallbackApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
}

export const FallbackApiModal: React.FC<FallbackApiModalProps> = ({ isOpen, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
      setApiKey('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg flex flex-col border border-yellow-500/50" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            API Quota Limit Reached
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        
        <div className="p-6 space-y-4">
          <p className="text-gray-300">
            You have exceeded the daily request limit for the free Google Gemini API. To continue using the app without interruption, you can provide a fallback API key from a service like OpenRouter.
          </p>
          <div>
            <label htmlFor="openrouter-key" className="block text-sm font-medium text-gray-300 mb-1">
              OpenRouter API Key
            </label>
            <input
              id="openrouter-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-..."
              className="w-full bg-gray-900 text-white px-3 py-2 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none border border-gray-600"
              autoFocus
            />
             <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline mt-1 block">
                Get an OpenRouter key here.
            </a>
          </div>
        </div>

        <footer className="p-4 bg-gray-900/50 border-t border-gray-700 flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-sm bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors"
            >
                Cancel
            </button>
            <button
                onClick={handleSave}
                disabled={!apiKey.trim()}
                className="px-4 py-2 text-sm bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Save and Retry
            </button>
        </footer>
      </div>
    </div>
  );
};
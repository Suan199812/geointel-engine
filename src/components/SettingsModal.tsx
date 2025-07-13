

import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  currentKey: string;
}

const SettingsIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.003 1.11-1.226.55-.223 1.159-.223 1.71 0 .55.223 1.02.684 1.11 1.226M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-9.75 5.613c.09-.542.56-1.004 1.11-1.227.55-.223 1.159-.223 1.71 0 .55.224 1.02.685 1.11 1.227M15 15.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v.01M12 6.75v.01M12 10.5v.01M12 14.25v.01M12 18v.01M12 21.75v.01M4.22 18.336l.008-.007M4.22 18.336l.008-.007M19.78 5.664l-.008.007M19.78 5.664l-.008.007M5.664 19.78l-.007-.008M5.664 19.78l-.007-.008M18.336 4.22l.007.008M18.336 4.22l.007.008" />
    </svg>
);

const LockIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
);


export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentKey }) => {
  const [apiKey, setApiKey] = useState('');
  const isKeyFromEnv = !!import.meta.env.VITE_OPENROUTER_API_KEY;

  useEffect(() => {
    // We don't pre-fill the input for security,
    // but we can manage the state if the modal re-opens.
    if (!isOpen) {
        setApiKey('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    if (apiKey.trim() && !isKeyFromEnv) {
      onSave(apiKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg flex flex-col border border-gray-700" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <SettingsIcon />
            Settings
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        
        <div className="p-6 space-y-4">
          <p className="text-gray-300">
            Configure a fallback API key to use when the primary Google API's free quota is exceeded. This helps ensure uninterrupted service.
          </p>
          {isKeyFromEnv ? (
             <div className="bg-blue-900/50 border border-blue-700 text-blue-300 px-4 py-3 rounded-lg text-sm flex items-center" role="status">
                <LockIcon />
                <span>OpenRouter key is configured via an environment variable.</span>
            </div>
          ) : currentKey ? (
            <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-lg text-sm" role="status">
                An OpenRouter API key is already configured. You can enter a new key below to update it.
            </div>
          ) : null}
          <div>
            <label htmlFor="settings-openrouter-key" className="block text-sm font-medium text-gray-300 mb-1">
              OpenRouter API Key
            </label>
            <input
              id="settings-openrouter-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={currentKey ? 'Enter new key to update' : 'sk-or-...'}
              className="w-full bg-gray-900 text-white px-3 py-2 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none border border-gray-600 disabled:bg-gray-700/50 disabled:cursor-not-allowed"
              autoFocus
              disabled={isKeyFromEnv}
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
                disabled={!apiKey.trim() || isKeyFromEnv}
                className="px-4 py-2 text-sm bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isKeyFromEnv ? 'Saved' : 'Save'}
            </button>
        </footer>
      </div>
    </div>
  );
};
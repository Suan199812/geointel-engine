
import React from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';
import type { Language } from '../types';

const GlobeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mr-3 text-cyan-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c1.355 0 2.707-.158 4.007-.462M12 21c-1.355 0-2.707-.158-4.007-.462m0 0A9.004 9.004 0 0 1 12 3c1.355 0 2.707.158 4.007.462m-8.014 0A9.004 9.004 0 0 0 12 3c1.355 0 2.707.158 4.007.462m0 0A9.004 9.004 0 0 1 12 21m0 0a9.004 9.004 0 0 0 4.007-7.238M12 21a9.004 9.004 0 0 1-4.007-7.238m0 0A9.004 9.004 0 0 1 12 3m0 0a9.004 9.004 0 0 0-4.007 7.238m8.014 0a9.004 9.004 0 0 0-4.007-7.238" />
    </svg>
);

const BriefingIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    </svg>
);

const TimelineIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18" />
    </svg>
);

const SettingsIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.003 1.11-1.226.55-.223 1.159-.223 1.71 0 .55.223 1.02.684 1.11 1.226M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-9.75 5.613c.09-.542.56-1.004 1.11-1.227.55-.223 1.159-.223 1.71 0 .55.224 1.02.685 1.11 1.227M15 15.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v.01M12 6.75v.01M12 10.5v.01M12 14.25v.01M12 18v.01M12 21.75v.01M4.22 18.336l.008-.007M4.22 18.336l.008-.007M19.78 5.664l-.008.007M19.78 5.664l-.008.007M5.664 19.78l-.007-.008M5.664 19.78l-.007-.008M18.336 4.22l.007.008M18.336 4.22l.007.008" />
    </svg>
);


interface HeaderProps {
    language: Language;
    onLanguageChange: (language: Language) => void;
    isLoading: boolean;
    onOpenBriefing: () => void;
    onOpenTimeline: () => void;
    isActionDisabled: boolean;
    onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ language, onLanguageChange, isLoading, onOpenBriefing, onOpenTimeline, isActionDisabled, onOpenSettings }) => {
  return (
    <header className="bg-gray-900/70 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-20">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
            <GlobeIcon />
            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Geopolitical Intelligence Engine
            </h1>
        </div>
        <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
                <button
                    onClick={onOpenBriefing}
                    disabled={isLoading || isActionDisabled}
                    title={isActionDisabled ? "Select a topic with articles first" : "Generate Daily Briefing"}
                    className="flex items-center px-4 py-2 text-sm font-semibold bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <BriefingIcon />
                    Briefing
                </button>
                <button
                    onClick={onOpenTimeline}
                    disabled={isLoading || isActionDisabled}
                    title={isActionDisabled ? "Select a topic with articles first" : "Generate Event Timeline"}
                    className="flex items-center px-4 py-2 text-sm font-semibold bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <TimelineIcon />
                    Timeline
                </button>
            </div>
            <LanguageSwitcher
                currentLanguage={language}
                onLanguageChange={onLanguageChange}
                disabled={isLoading}
            />
            <button
                onClick={onOpenSettings}
                disabled={isLoading}
                title="Settings"
                className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50"
            >
                <SettingsIcon />
            </button>
        </div>
      </div>
    </header>
  );
};
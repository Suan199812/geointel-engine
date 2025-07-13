
import React from 'react';
import type { UpcomingMeeting, Language } from '../types';
import { MeetingCard } from './MeetingCard';
import { MeetingCardSkeleton } from './MeetingCardSkeleton';

interface MeetingsListProps {
    meetings: UpcomingMeeting[];
    isLoading: boolean;
    error: string | null;
    onRefresh: () => void;
    language: Language;
}

const RefreshIcon: React.FC<{ isSpinning: boolean }> = ({ isSpinning }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001a7.5 7.5 0 0 1-1.066 2.593l-2.256 3.011a15.015 15.015 0 0 1-2.072 2.184l-.662.662a2.25 2.25 0 0 1-3.182 0l-.662-.662a15.015 15.015 0 0 1-2.072-2.184l-2.256-3.011a7.5 7.5 0 0 1-1.066-2.593v-.001h4.992" />
  </svg>
);


export const MeetingsList: React.FC<MeetingsListProps> = ({ meetings, isLoading, error, onRefresh, language }) => {
    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-300 border-l-4 border-purple-500 pl-4">
                    Upcoming Engagements
                </h2>
                <button onClick={onRefresh} disabled={isLoading} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50" title="Refresh meetings">
                    <RefreshIcon isSpinning={isLoading} />
                </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <MeetingCardSkeleton key={i} />)
                ) : error ? (
                    <p className="text-red-400 text-sm px-4 col-span-1">{error}</p>
                ) : meetings.length > 0 ? (
                    meetings.map((meeting) => (
                        <MeetingCard key={meeting.id} meeting={meeting} language={language} />
                    ))
                ) : (
                    <div className="text-center py-8 px-4 text-gray-500 bg-gray-800/50 rounded-lg col-span-1">
                        <p>Click the refresh icon above to load upcoming engagements.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
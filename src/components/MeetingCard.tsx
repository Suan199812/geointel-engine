

import React from 'react';
import type { UpcomingMeeting, Language } from '../types';

interface MeetingCardProps {
    meeting: UpcomingMeeting;
    language: Language;
}

const CalendarIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 inline-block flex-shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18" />
    </svg>
);

const LocationIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 inline-block flex-shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
);

const StarIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
        <path fillRule="evenodd" d="M10.868 2.884c.321-.662 1.215-.662 1.536 0l1.681 3.462 3.82.556c.734.107 1.03.998.494 1.503l-2.764 2.693.654 3.805c.125.73-.643 1.285-1.306.945L10 15.547l-3.419 1.798c-.663.34-1.431-.215-1.306-.945l.654-3.805L2.16 8.405c-.536-.505-.24-1.396.494-1.503l3.82-.556 1.681-3.462z" clipRule="evenodd" />
    </svg>
);

export const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, language }) => {
  
  const eventName = language === 'zh' && meeting.eventName_zh ? meeting.eventName_zh : meeting.eventName_en;
  const location = language === 'zh' && meeting.location_zh ? meeting.location_zh : meeting.location_en;
  const focus = language === 'zh' && meeting.focus_zh ? meeting.focus_zh : meeting.focus_en;

  return (
    <div className="relative bg-gray-800/70 backdrop-blur-sm rounded-lg border border-gray-700/50 p-4 flex flex-col gap-3 animate-fade-in transition-all duration-300 hover:bg-gray-700/60 hover:shadow-purple-500/10 hover:border-purple-600/50">
        {meeting.involvesChina && (
            <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-bold text-yellow-100 bg-yellow-600/80 rounded-full flex items-center gap-1 ring-1 ring-yellow-500/50">
                <StarIcon />
                {language === 'en' ? 'China-Related' : '涉华'}
            </span>
        )}
        <h3 className="font-bold text-base text-gray-100 pr-4">{eventName}</h3>
        
        <div className="text-sm text-gray-400 space-y-1.5">
            <div className="flex items-center">
                <CalendarIcon />
                <span>{meeting.dateText}</span>
            </div>
            <div className="flex items-center">
                <LocationIcon />
                <span>{location}</span>
            </div>
        </div>

        <div className="border-t border-gray-700/50 pt-3">
             <p className="text-sm text-gray-300 leading-relaxed">{focus}</p>
        </div>

        <div>
             <h4 className="text-xs font-semibold uppercase text-gray-500 tracking-wider mb-2">{language === 'en' ? 'Participants' : '参与方'}</h4>
            <div className="flex flex-wrap gap-2">
                {meeting.participants.map(p => (
                    <span key={p} className="px-2 py-1 text-xs font-medium rounded-md bg-purple-900/50 text-purple-300 ring-1 ring-inset ring-purple-500/50">
                        {p}
                    </span>
                ))}
            </div>
        </div>
    </div>
  );
};
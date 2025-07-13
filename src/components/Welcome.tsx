

import React from 'react';

const IntelligenceCoreIcon: React.FC = () => (
    <div className="relative w-24 h-24 mx-auto">
        <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-pulse"></div>
        <div className="absolute inset-2 rounded-full bg-cyan-500/20 animate-pulse delay-200"></div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute inset-0 w-full h-full text-cyan-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c1.355 0 2.707-.158 4.007-.462M12 21c-1.355 0-2.707-.158-4.007-.462m0 0A9.004 9.004 0 0 1 12 3c1.355 0 2.707.158 4.007.462m-8.014 0A9.004 9.004 0 0 0 12 3c1.355 0 2.707.158 4.007.462m0 0A9.004 9.004 0 0 1 12 21m0 0a9.004 9.004 0 0 0 4.007-7.238M12 21a9.004 9.004 0 0 1-4.007-7.238m0 0A9.004 9.004 0 0 1 12 3m0 0a9.004 9.004 0 0 0-4.007 7.238m8.014 0a9.004 9.004 0 0 0-4.007-7.238" />
        </svg>
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="absolute inset-6 w-12 h-12 text-cyan-400/70 animate-spin-slow">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
        </svg>
    </div>
);


interface WelcomeProps {
    title: string;
    message: string;
}

export const Welcome: React.FC<WelcomeProps> = ({ title, message }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center py-16 px-4 text-gray-500 bg-gray-800/20 rounded-lg">
            <IntelligenceCoreIcon />
            <h2 className="mt-8 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-cyan-400">{title}</h2>
            <p className="mt-2 max-w-xl mx-auto text-gray-400">
                {message}
            </p>
        </div>
    );
};
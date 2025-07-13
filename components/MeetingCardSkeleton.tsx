
import React from 'react';

export const MeetingCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-800/70 rounded-lg border border-gray-700/50 p-4 flex flex-col gap-3 animate-pulse">
        <div className="h-5 bg-gray-700 rounded w-3/4"></div>
        
        <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
        </div>

        <div className="border-t border-gray-700/50 pt-3 space-y-2">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>

        <div>
            <div className="h-4 bg-gray-600 rounded w-1/4 mb-2"></div>
            <div className="flex flex-wrap gap-2">
                <div className="h-6 bg-gray-700 rounded-md w-20"></div>
                <div className="h-6 bg-gray-700 rounded-md w-24"></div>
            </div>
        </div>
    </div>
  );
};

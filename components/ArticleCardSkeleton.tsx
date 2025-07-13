
import React from 'react';

export const ArticleCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-800/70 rounded-lg shadow-lg border border-gray-700/50 p-5 animate-pulse">
      <div className="flex justify-between items-start gap-4">
        <div className="h-6 bg-gray-700 rounded w-3/4"></div>
        <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
      </div>
      
      <div className="h-4 bg-gray-700 rounded w-1/4 mt-2 mb-4"></div>
      
      <div className="space-y-3">
        <div className="h-4 bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
      </div>
      
      <div className="mt-4 border-t border-gray-700 pt-3">
        <div className="h-4 bg-gray-600 rounded w-1/5 mb-3"></div>
        <div className="flex flex-wrap gap-2">
            <div className="h-6 bg-gray-700 rounded-md w-24"></div>
            <div className="h-6 bg-gray-700 rounded-md w-32"></div>
            <div className="h-6 bg-gray-700 rounded-md w-28"></div>
        </div>
      </div>
    </div>
  );
};

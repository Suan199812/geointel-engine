
import React from 'react';
import { ArticleCardSkeleton } from './ArticleCardSkeleton';

export const ArticleListSkeleton: React.FC = () => {
    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-semibold text-gray-300 border-l-4 border-cyan-500 pl-4">
          Analyzing Intelligence...
        </h2>
        {Array.from({ length: 3 }).map((_, index) => (
          <ArticleCardSkeleton key={index} />
        ))}
      </div>
    );
};
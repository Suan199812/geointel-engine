

import React from 'react';
import { ArticleCard } from './ArticleCard';
import type { Article, Language, Entity } from '../types';

interface ArticleListProps {
  articles: Article[];
  language: Language;
  onEntitySelect: (entity: Entity) => void;
  onArticleSelect: (article: Article) => void;
  onDiscoverMore?: () => void;
  isLoadingMore?: boolean;
  moreHeadlinesError?: string | null;
  onToggleBookmark: (article: Article) => void;
  bookmarkedArticles: Article[];
}

export const ArticleList: React.FC<ArticleListProps> = ({ articles, language, onEntitySelect, onArticleSelect, onDiscoverMore, isLoadingMore, moreHeadlinesError, onToggleBookmark, bookmarkedArticles }) => {
  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-semibold text-gray-300 border-l-4 border-cyan-500 pl-4">
        {onDiscoverMore ? 'Intelligence Feed' : 'Bookmarked Articles'}
      </h2>
      {articles.map((article, index) => (
        <ArticleCard 
            key={`${article.url}-${index}`} 
            article={article} 
            language={language} 
            onEntitySelect={onEntitySelect}
            onArticleSelect={onArticleSelect}
            onToggleBookmark={onToggleBookmark}
            isBookmarked={bookmarkedArticles.some(b => b.url === article.url)}
        />
      ))}
      {onDiscoverMore && <div className="mt-6 text-center">
        <button
            onClick={onDiscoverMore}
            disabled={isLoadingMore}
            className="w-full sm:w-auto px-6 py-3 border-2 border-dashed border-gray-600 text-gray-400 font-semibold rounded-lg hover:bg-gray-800 hover:border-gray-500 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:border-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
        >
             {isLoadingMore ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                </>
             ) : 'Discover More Developments'}
        </button>
        {moreHeadlinesError && <p className="text-red-400 text-sm mt-2">{moreHeadlinesError}</p>}
      </div>}
    </div>
  );
};
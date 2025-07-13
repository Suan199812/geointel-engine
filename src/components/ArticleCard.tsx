

import React from 'react';
import type { Article, Language, Entity, EntityType } from '../types';

interface ArticleCardProps {
  article: Article;
  language: Language;
  onEntitySelect: (entity: Entity) => void;
  onArticleSelect: (article: Article) => void;
  isBookmarked: boolean;
  onToggleBookmark: (article: Article) => void;
}

const BookmarkIcon: React.FC<{isBookmarked: boolean}> = ({ isBookmarked }) => (
    isBookmarked ? (
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-400">
            <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 group-hover:text-yellow-400 transition-colors">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
        </svg>
    )
);

const LinkIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors duration-200">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
);

const CalendarIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 inline-block">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18" />
    </svg>
);

const GlobeAltIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 inline-block">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c1.355 0 2.707-.158 4.007-.462M12 21c-1.355 0-2.707-.158-4.007-.462m0 0A9.004 9.004 0 0 1 12 3c1.355 0 2.707.158 4.007.462m-8.014 0A9.004 9.004 0 0 0 12 3c1.355 0 2.707.158 4.007.462m0 0A9.004 9.004 0 0 1 12 21m0 0a9.004 9.004 0 0 0 4.007-7.238M12 21a9.004 9.004 0 0 1-4.007-7.238m0 0A9.004 9.004 0 0 1 12 3m0 0a9.004 9.004 0 0 0-4.007 7.238m8.014 0a9.004 9.004 0 0 0-4.007-7.238" />
    </svg>
);

const WandIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-2.255-1.002L7.2 21l-3.086-3.086a3 3 0 0 0-1.002-2.255l-1.414-1.414a3 3 0 0 0 0-4.242l1.414-1.414a3 3 0 0 0 2.255-1.002L5.25 3l3.086 3.086a3 3 0 0 0 1.002 2.255l1.414 1.414a3 3 0 0 0 0 4.242l-1.414 1.414a3 3 0 0 0-2.255 1.002Z" />
    </svg>
);

const entityColors: Record<EntityType, string> = {
    Person: 'bg-blue-900/50 text-blue-300 ring-blue-500/50',
    Organization: 'bg-purple-900/50 text-purple-300 ring-purple-500/50',
    Location: 'bg-green-900/50 text-green-300 ring-green-500/50',
    Policy: 'bg-yellow-900/50 text-yellow-300 ring-yellow-500/50',
    Event: 'bg-red-900/50 text-red-300 ring-red-500/50',
    Other: 'bg-gray-700 text-gray-400 ring-gray-600',
};

const formatRelativeTime = (dateString: string | null, lang: Language): string | null => {
    if (!dateString) return null;
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 0) {
            return date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US');
        }

        if (diffInSeconds < 2) {
             return lang === 'zh' ? '刚刚' : 'Just now';
        }

        const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });

        if (diffInSeconds < 60) {
            return rtf.format(-diffInSeconds, 'second');
        }
        const diffInMinutes = Math.round(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return rtf.format(-diffInMinutes, 'minute');
        }
        const diffInHours = Math.round(diffInMinutes / 60);
        if (diffInHours < 24) {
            return rtf.format(-diffInHours, 'hour');
        }
        const diffInDays = Math.round(diffInHours / 24);
         if (diffInDays < 7) {
            return rtf.format(-diffInDays, 'day');
        }
        
        return date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch (e) {
        console.warn("Could not format date:", dateString, e);
        return dateString;
    }
};


export const ArticleCard: React.FC<ArticleCardProps> = ({ article, language, onEntitySelect, onArticleSelect, isBookmarked, onToggleBookmark }) => {
  const summary = (language === 'zh' && article.summary_zh) ? article.summary_zh : article.summary_en;
  
  const summaryLabel = language === 'en' ? 'AI Summary' : 'AI 概要';
  const labelId = React.useId();

  const formattedDate = formatRelativeTime(article.publishedAt, language);

  return (
    <article 
        className={`bg-gray-800/70 backdrop-blur-sm rounded-lg transition-all duration-300 hover:bg-gray-700/60 shadow-lg hover:shadow-cyan-500/10 border border-gray-700/50 hover:border-cyan-600/50 animate-fade-in ${!article.isAnalyzed ? 'border-dashed' : ''}`}
    >
      <div className="p-5">
        <div className="flex justify-between items-start gap-4">
            <h3 className="text-lg font-bold text-gray-100 flex-1 cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => onArticleSelect(article)}>
                {article.title}
            </h3>
            <div className="flex items-center flex-shrink-0 -mt-1 -mr-1">
                <button onClick={() => onToggleBookmark(article)} title={isBookmarked ? "Remove bookmark" : "Add bookmark"} className="group p-1 rounded-full hover:bg-gray-700">
                    <BookmarkIcon isBookmarked={isBookmarked} />
                </button>
                <a href={article.url} target="_blank" rel="noopener noreferrer" title="Go to source" className="group p-1 rounded-full hover:bg-gray-700">
                    <LinkIcon />
                </a>
            </div>
        </div>
        
        <div className="text-xs text-gray-500 mb-3 -mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
            <div className="flex items-center">
                <CalendarIcon />
                <span>{formattedDate || 'Date not available'}</span>
            </div>
             <div className="flex items-center">
                <GlobeAltIcon />
                <span>Sourced via Web Search</span>
            </div>
        </div>
        
        {!article.isAnalyzed && (
            <div className="border-t border-gray-700/50 pt-3 mt-3">
                 <button onClick={() => onArticleSelect(article)} className="flex items-center text-sm text-cyan-400 font-semibold hover:text-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                     <WandIcon />
                     Analyze
                 </button>
            </div>
        )}

        {article.isAnalyzed && summary && (
            <div role="region" aria-labelledby={labelId} className="border-t border-gray-700/50 pt-3 mt-3">
                <span id={labelId} className="text-xs font-semibold uppercase text-gray-500 tracking-wider">{summaryLabel}</span>
                <p className="text-gray-300 leading-relaxed mt-1">
                {summary}
                </p>
            </div>
        )}
        
        {article.isAnalyzed && article.entities && article.entities.length > 0 && (
            <div className="mt-4 border-t border-gray-700 pt-3">
                 <h4 className="text-xs font-semibold uppercase text-gray-500 tracking-wider mb-2">Key Entities</h4>
                 <div className="flex flex-wrap gap-2">
                    {article.entities.map(entity => (
                        <button key={entity.id} onClick={() => onEntitySelect(entity)} className={`px-2 py-1 text-xs font-medium rounded-md cursor-pointer ring-1 ring-inset transition-colors duration-200 hover:ring-cyan-400 ${entityColors[entity.type]}`}>
                            {entity.name}
                        </button>
                    ))}
                 </div>
            </div>
        )}
      </div>
    </article>
  );
};
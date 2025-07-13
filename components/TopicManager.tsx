


import React, { useState, useEffect } from 'react';
import type { Topic } from '../types';

interface TopicManagerProps {
  topics: Topic[];
  activeTopic: Topic | undefined;
  onSelectTopic: (id: string) => void;
  onAddTopic: (query: string) => void;
  onRemoveTopic: (id: string) => void;
  onUpdateTopicQuery: (id: string, query: string) => void;
  onFetchRelatedSuggestions: () => void;
  relatedSuggestions: string[];
  isSuggestingRelated: boolean;
  onFetchTrendingSuggestions: () => void;
  trendingSuggestions: string[];
  isSuggestingTrending: boolean;
  disabled?: boolean;
}

const RemoveIcon: React.FC<{onClick: (e: React.MouseEvent) => void}> = ({ onClick }) => (
    <svg onClick={onClick} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors duration-200 cursor-pointer">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const AddIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const SparklesIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

const FireIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.25 8.25 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.048 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.362-3.797 8.33 8.33 0 0 1 2.362-.682A8.25 8.25 0 0 1 15.362 5.214Z" />
    </svg>
);

export const TopicManager: React.FC<TopicManagerProps> = ({ 
    topics, 
    activeTopic, 
    onSelectTopic, 
    onAddTopic, 
    onRemoveTopic,
    onUpdateTopicQuery, 
    onFetchRelatedSuggestions, 
    relatedSuggestions, 
    isSuggestingRelated,
    onFetchTrendingSuggestions,
    trendingSuggestions,
    isSuggestingTrending,
    disabled
 }) => {
  const [newTopicQuery, setNewTopicQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editedQuery, setEditedQuery] = useState('');

  useEffect(() => {
    if (activeTopic) {
        setEditedQuery(activeTopic.query);
    }
  }, [activeTopic]);

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTopicQuery.trim()) {
      onAddTopic(newTopicQuery.trim());
      setNewTopicQuery('');
      setIsAdding(false);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
      onAddTopic(suggestion);
      setNewTopicQuery('');
      setIsAdding(false);
  }

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onRemoveTopic(id);
  }

  const handleSaveQuery = () => {
    if(activeTopic && editedQuery.trim() && editedQuery !== activeTopic.query) {
        onUpdateTopicQuery(activeTopic.id, editedQuery.trim());
    }
  }

  return (
    <nav className="mb-4">
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-700 pb-3 mb-4">
        {topics.map(topic => (
          <button
            key={topic.id}
            onClick={() => onSelectTopic(topic.id)}
            disabled={disabled}
            className={`group flex items-center gap-2 pl-3 pr-2 py-1.5 text-sm font-medium rounded-full transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
              activeTopic?.id === topic.id
                ? 'bg-cyan-600 text-white shadow-md ring-2 ring-offset-2 ring-offset-gray-900 ring-cyan-500'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span>{topic.name}</span>
            {topics.length > 1 && (
                <span className="p-1 rounded-full group-hover:bg-gray-600">
                    <RemoveIcon onClick={(e) => handleRemove(e, topic.id)} />
                </span>
            )}
          </button>
        ))}
        {!isAdding && (
           <button 
                onClick={() => setIsAdding(true)}
                disabled={disabled}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-cyan-400 bg-gray-800/50 rounded-full hover:bg-gray-700/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-dashed border-gray-600 hover:border-cyan-500"
            >
                <AddIcon />
                Add Topic
            </button>
        )}
      </div>

      {activeTopic && (
        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/60 animate-fade-in">
            <label htmlFor="topic-query" className="block text-sm font-medium text-gray-300 mb-1">Monitoring Prompt for "{activeTopic.name}"</label>
            <p className="text-xs text-gray-500 mb-2">Refine the AI's content discovery. The feed refreshes on save.</p>
            <textarea
                id="topic-query"
                value={editedQuery}
                onChange={(e) => setEditedQuery(e.target.value)}
                placeholder="e.g., Latest news and policy shifts regarding US-China trade."
                className="w-full bg-gray-900 text-white px-3 py-2 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none border border-gray-600 h-24 resize-y"
                disabled={disabled}
            />
            <div className="flex justify-end gap-2 mt-2">
                <button
                    onClick={() => setEditedQuery(activeTopic.query)}
                    disabled={disabled || editedQuery === activeTopic.query}
                    className="px-4 py-1.5 text-sm bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Reset
                </button>
                <button
                    onClick={handleSaveQuery}
                    disabled={disabled || !editedQuery.trim() || editedQuery === activeTopic.query}
                    className="px-4 py-1.5 text-sm bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Save & Refresh
                </button>
            </div>
        </div>
      )}

      {isAdding && (
        <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/60 animate-fade-in">
          <form onSubmit={handleAddTopic} className="space-y-3">
            <input
              type="text"
              value={newTopicQuery}
              onChange={(e) => setNewTopicQuery(e.target.value)}
              placeholder="Enter a new topic to monitor..."
              className="w-full bg-gray-900 text-white px-3 py-2 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none border border-gray-600"
              autoFocus
            />
             <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors text-sm">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-500 transition-colors disabled:opacity-50 text-sm" disabled={!newTopicQuery.trim()}>
                  Add Topic
                </button>
            </div>
          </form>
          <div className="mt-4 border-t border-gray-700 pt-4">
             <div className="flex flex-wrap gap-2">
                <button
                    onClick={onFetchRelatedSuggestions}
                    disabled={isSuggestingRelated || isSuggestingTrending || disabled}
                    className="px-4 py-2 border border-gray-600 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center text-sm"
                >
                    {isSuggestingRelated ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : <SparklesIcon />}
                    {isSuggestingRelated ? 'Thinking...' : 'Suggest Related'}
                </button>
                 <button
                    onClick={onFetchTrendingSuggestions}
                    disabled={isSuggestingRelated || isSuggestingTrending || disabled}
                    className="px-4 py-2 border border-gray-600 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center text-sm"
                >
                    {isSuggestingTrending ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : <FireIcon />}
                    {isSuggestingTrending ? 'Scanning...' : 'Suggest Trending'}
                </button>
             </div>
            {relatedSuggestions.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Related to your topics:</h4>
                    <div className="flex flex-wrap gap-2">
                        {relatedSuggestions.map(s => (
                            <button key={s} onClick={() => handleSuggestionClick(s)} className="px-3 py-1.5 text-sm bg-cyan-900/70 text-cyan-300 rounded-full hover:bg-cyan-800/80 transition-colors">
                                + {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}
             {trendingSuggestions.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Trending globally:</h4>
                    <div className="flex flex-wrap gap-2">
                        {trendingSuggestions.map(s => (
                            <button key={s} onClick={() => handleSuggestionClick(s)} className="px-3 py-1.5 text-sm bg-purple-900/70 text-purple-300 rounded-full hover:bg-purple-800/80 transition-colors">
                                + {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
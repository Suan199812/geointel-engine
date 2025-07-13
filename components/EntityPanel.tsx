
import React from 'react';
import type { Entity, Language, Article } from '../types';

interface EntityPanelProps {
    entity: Entity;
    articles: Article[];
    onClose: () => void;
    language: Language;
}

export const EntityPanel: React.FC<EntityPanelProps> = ({ entity, articles, onClose, language }) => {
    const relevantArticles = articles.filter(a => a.entities?.some(e => e.id === entity.id));

    return (
        <aside className="bg-gray-800 rounded-lg p-5 border border-gray-700/50 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-cyan-400">{entity.name}</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-white">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <p className="text-sm text-gray-400 mb-4 font-mono border border-gray-700 bg-gray-900/50 rounded-md px-2 py-1 inline-block">Type: {entity.type}</p>
            
            <h4 className="font-semibold text-gray-300 mb-2 border-t border-gray-700 pt-3">Mentioned In:</h4>
            <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {relevantArticles.length > 0 ? relevantArticles.map(article => (
                    <li key={article.url} className="bg-gray-900/50 p-3 rounded-md hover:bg-gray-700/50 transition-colors">
                        <a href={article.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-200 hover:text-cyan-400 block mb-1">{article.title}</a>
                        <p className="text-sm text-gray-400">
                           {language === 'en' ? article.summary_en : article.summary_zh}
                        </p>
                    </li>
                )) : <p className="text-gray-500">No mentions in the current intelligence feed.</p>}
            </ul>
        </aside>
    )
}

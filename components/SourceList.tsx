
import React from 'react';
import type { GroundingChunk } from '../types';

interface SourceListProps {
  sources: GroundingChunk[];
}

const LinkIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 inline-block">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
);


export const SourceList: React.FC<SourceListProps> = ({ sources }) => {
  const uniqueSources = [
    ...sources
      .reduce((map, source) => {
        if (source.web?.uri) {
          map.set(source.web.uri, source);
        }
        return map;
      }, new Map<string, GroundingChunk>())
      .values(),
  ];

  if (uniqueSources.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold text-gray-300 border-l-4 border-blue-500 pl-4 mb-4">
        Sources
      </h2>
      <ul className="space-y-2 list-none p-0">
        {uniqueSources.map((source, index) => (
          <li key={index} className="bg-gray-800 p-3 rounded-md transition-colors duration-200 hover:bg-gray-700">
            <a
              href={source.web!.uri!}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200 text-sm break-all"
              title={source.web!.title || source.web!.uri!}
            >
             <LinkIcon />
              {source.web!.title || source.web!.uri!}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

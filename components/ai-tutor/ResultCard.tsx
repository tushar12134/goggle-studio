import React from 'react';
import { Remarkable } from 'remarkable';

interface ResultCardProps {
  title: string;
  content: string;
  isLoading: boolean;
  isCode?: boolean;
}

const md = new Remarkable({
    html: true,
    linkify: true,
    typographer: true,
});

export const ResultCard: React.FC<ResultCardProps> = ({ title, content, isLoading, isCode = false }) => {
  if (!isLoading && !content) {
    return null;
  }
  
  const renderedHtml = md.render(content);

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">{title}</h3>
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      ) : (
        <div 
          className="prose prose-sm prose-slate dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      )}
    </div>
  );
};
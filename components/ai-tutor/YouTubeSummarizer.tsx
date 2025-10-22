import React, { useState } from 'react';
import { generateText } from '../../services/geminiService';
import { ResultCard } from './ResultCard';

export const YouTubeSummarizer: React.FC = () => {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = async () => {
    if (!url.trim()) {
      setError('Please enter a valid YouTube URL.');
      return;
    }
    setError('');
    setIsLoading(true);
    setSummary('');

    const prompt = `You are an expert video summarizer. Please provide a concise, structured summary of the content of the YouTube video at this URL: ${url}. Focus on the key concepts, main arguments, and important takeaways. Format the output using markdown with headings and bullet points for clarity.`;
    
    const result = await generateText(prompt);
    setSummary(result);
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">YouTube Video Summarizer</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Paste a YouTube video link to get a quick summary of its content.</p>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=7_tKzXGWa3A"
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSummarize}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:bg-purple-400 hover:bg-purple-700 transition-all transform hover:scale-105 active:scale-100 flex items-center justify-center"
          >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Summarizing...
                </>
            ) : 'Summarize'}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
      <ResultCard title="Video Summary" content={summary} isLoading={isLoading} />
    </div>
  );
};
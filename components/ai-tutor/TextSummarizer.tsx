
import React, { useState } from 'react';
import { generateText } from '../../services/geminiService';
import { ResultCard } from './ResultCard';

export const TextSummarizer: React.FC = () => {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setText(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleSummarize = async () => {
    if (!text.trim()) {
      setError('Please enter text or upload a file to summarize.');
      return;
    }
    setError('');
    setIsLoading(true);
    setSummary('');

    const prompt = `Please provide a concise summary of the following text:\n\n---\n\n${text}\n\n---\n\nFormat the output using markdown with a title, a brief overview, and key bullet points.`;
    const result = await generateText(prompt);
    setSummary(result);
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Text & Document Summarizer</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Paste text or upload a document (.txt) to get a summary.</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your text here..."
          className="w-full h-32 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={isLoading}
        />
        <div className="flex flex-col sm:flex-row items-center justify-between mt-2 space-y-2 sm:space-y-0">
          <input
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            className="text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
            disabled={isLoading}
          />
          <button
            onClick={handleSummarize}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:bg-purple-400 hover:bg-purple-700 transition-all transform hover:scale-105 active:scale-100 flex items-center justify-center w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  {/* FIX: Corrected a typo in the SVG path data from '8_0' to '8 8'. */}
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Summarizing...
              </>
            ) : 'Summarize'}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
      <ResultCard title="Summary" content={summary} isLoading={isLoading} />
    </div>
  );
};

import React, { useState } from 'react';
import { generateText } from '../../services/geminiService';
import { ResultCard } from './ResultCard';

export const CodeEnhancer: React.FC = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [enhancedCode, setEnhancedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEnhance = async () => {
    if (!code.trim()) {
      setError('Please enter some code to enhance.');
      return;
    }
    setError('');
    setIsLoading(true);
    setEnhancedCode('');

    const prompt = `You are a senior software engineer and expert code reviewer. Please analyze the following ${language} code snippet. Your task is to:
1.  **Enhance and Optimize:** Improve the code for performance, readability, and adherence to best practices.
2.  **Verify and Debug:** Identify and fix any potential bugs or logical errors.
3.  **Add Comments:** Add clear and concise comments to explain complex parts of the logic.
4.  **Explain Changes:** Provide a brief summary of the key changes you made and why.

The output should be in markdown format. First, provide the summary of changes, then provide the full, enhanced code in a proper code block.

Here is the code:
\`\`\`${language}
${code}
\`\`\`
`;
    
    const result = await generateText(prompt, 'gemini-2.5-pro');
    setEnhancedCode(result);
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Code Enhancer</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Input code to optimize, verify, and add comments.</p>
        <div className="mb-2">
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="java">Java</option>
                <option value="csharp">C#</option>
                <option value="cpp">C++</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
            </select>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={`// Paste your ${language} code here...`}
          className="w-full h-40 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-200 dark:bg-gray-700 font-mono text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={isLoading}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleEnhance}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:bg-purple-400 hover:bg-purple-700 transition-all transform hover:scale-105 active:scale-100 flex items-center justify-center"
          >
            {isLoading ? 'Enhancing...' : 'Enhance Code'}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
      <ResultCard title="Enhanced Code" content={enhancedCode} isLoading={isLoading} isCode={true} />
    </div>
  );
};
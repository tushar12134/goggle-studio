import React, { useState } from 'react';
import { generateContentWithImage } from '../../services/geminiService';
import { ResultCard } from './ResultCard';

export const ImageAnalyzer: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) {
      setError('Please upload an image.');
      return;
    }
    if (!prompt.trim()) {
      setError('Please enter a question about the image.');
      return;
    }
    setError('');
    setIsLoading(true);
    setAnalysis('');

    const result = await generateContentWithImage(prompt, imageFile);
    setAnalysis(result);
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Image Analyzer</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Upload an image and ask a question about it.</p>
        
        <div className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
            {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
            ) : (
                <p className="text-gray-400 dark:text-gray-500">Image preview will appear here</p>
            )}
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-4 text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
                disabled={isLoading}
            />
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Explain the physics principle shown in this diagram."
          className="w-full mt-4 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={isLoading}
        />

        <div className="flex justify-end mt-2">
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !imageFile}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:bg-purple-400 hover:bg-purple-700 transition-all transform hover:scale-105 active:scale-100 flex items-center justify-center"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Image'}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
      <ResultCard title="Analysis" content={analysis} isLoading={isLoading} />
    </div>
  );
};
import React, { useState } from 'react';
import { AITutorMode } from '../types';
import { AI_TUTOR_MODES } from '../constants';
import { ChatTutor } from '../components/ai-tutor/ChatTutor';
import { YouTubeSummarizer } from '../components/ai-tutor/YouTubeSummarizer';
import { TextSummarizer } from '../components/ai-tutor/TextSummarizer';
import { CodeEnhancer } from '../components/ai-tutor/CodeEnhancer';
import { ImageAnalyzer } from '../components/ai-tutor/ImageAnalyzer';
import { VoiceTutor } from '../components/ai-tutor/VoiceTutor';
import { ScreenTutor } from '../components/ai-tutor/ScreenTutor';

export const AITutorScreen: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AITutorMode>(AITutorMode.Chat);

  const renderActiveMode = () => {
    switch (activeMode) {
      case AITutorMode.Chat:
        return <ChatTutor />;
      case AITutorMode.Voice:
        return <VoiceTutor />;
      case AITutorMode.Screen:
        return <ScreenTutor />;
      case AITutorMode.YouTube:
        return <YouTubeSummarizer />;
      case AITutorMode.Text:
        return <TextSummarizer />;
      case AITutorMode.Code:
        return <CodeEnhancer />;
      case AITutorMode.Image:
        return <ImageAnalyzer />;
      default:
        return <ChatTutor />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-4">
        <div className="flex space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg overflow-x-auto">
          {AI_TUTOR_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`flex items-center justify-center w-full px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200 whitespace-nowrap transform hover:scale-105 active:scale-100 ${
                activeMode === mode.id
                  ? 'bg-white dark:bg-gray-900 text-purple-500 dark:text-purple-400 shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {mode.icon}
              {mode.label}
            </button>
          ))}
        </div>
      </div>
      <div key={activeMode} className="flex-1 overflow-y-auto animate-fade-in">{renderActiveMode()}</div>
    </div>
  );
};
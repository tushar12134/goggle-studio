import React from 'react';
import { BrainIcon, UsersIcon, ChartIcon } from '../constants';

interface LandingScreenProps {
  onGetStarted: () => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onGetStarted }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white animate-fade-in">
      <div className="relative mb-6">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-25"></div>
        <div className="relative bg-gray-100 dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700">
            <svg className="w-16 h-16 text-gray-800 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
            </svg>
        </div>
        <span className="absolute top-0 right-0 -mt-2 -mr-2 text-3xl">✨</span>
      </div>

      <h1 className="text-5xl font-bold mb-2">Edgelearn</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">AI Powered Learning Platform</p>
      <p className="text-md text-gray-800 dark:text-gray-300 mb-10">Transform your learning journey with AI 🚀</p>

      <div className="flex justify-center space-x-4 mb-8">
        <FeatureCard icon={<BrainIcon className="w-8 h-8 mx-auto mb-2"/>} title="AI Tutor" />
        <FeatureCard icon={<UsersIcon className="w-8 h-8 mx-auto mb-2"/>} title="Teachers" />
        <FeatureCard icon={<ChartIcon className="w-8 h-8 mx-auto mb-2"/>} title="Progress" />
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-10">
        <Tag>🧠 Smart Learning</Tag>
        <Tag>⚡️ Fast Results</Tag>
        <Tag>🏆 Track Progress</Tag>
        <Tag>🤖 AI Powered</Tag>
      </div>
      
      <button 
        onClick={onGetStarted}
        className="w-full max-w-xs bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 font-semibold py-3 px-6 rounded-xl text-lg transition-transform transform hover:scale-105 active:scale-100"
      >
        Get Started ⚡️
      </button>

      <p className="mt-6 text-sm text-gray-500 dark:text-gray-500">🌟 Join 10,000+ students learning smarter</p>
    </div>
  );
};

const FeatureCard = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
  <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 w-24 text-center transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10">
    {icon}
    <span className="text-sm font-semibold">{title}</span>
  </div>
);

// FIX: Added a dedicated interface for Tag component props to fix a TypeScript error.
interface TagProps {
  children: React.ReactNode;
}

const Tag = ({ children }: TagProps) => (
    <span className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold px-3 py-1 rounded-full">{children}</span>
)

export default LandingScreen;

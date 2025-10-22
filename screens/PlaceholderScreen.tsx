import React from 'react';

interface PlaceholderScreenProps {
  title: string;
  icon: React.ReactNode;
  message?: string;
}

export const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({ title, icon, message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
      <div className="w-24 h-24 mb-4 text-gray-500 dark:text-gray-600">{icon}</div>
      <h2 className="text-2xl font-bold mb-2 text-gray-700 dark:text-gray-300">{title}</h2>
      <p className="text-center max-w-md">{message || 'This feature is coming soon!'}</p>
    </div>
  );
};
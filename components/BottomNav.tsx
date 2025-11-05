import React from 'react';
import { NAV_ITEMS } from '../constants';
import { Screen, UserProfile } from '../types';

interface BottomNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
  userProfile: UserProfile;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  // The navigation is now the same for both students and teachers.
  return (
    <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="flex justify-around items-center h-16">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveScreen(item.id)}
            className={`flex flex-col items-center justify-center w-full transition-all duration-300 ease-in-out transform hover:-translate-y-1 active:scale-90 ${
              activeScreen === item.id 
                ? 'text-purple-500' 
                : 'text-gray-500 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-300'
            }`}
          >
            {item.icon}
            <span className="text-xs font-medium mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
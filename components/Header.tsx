import React from 'react';
import { BellIcon, CogIcon, UserCircleIcon } from '../constants';
import { ThemeToggle } from './ThemeToggle';
import { Theme } from '../App';

interface HeaderProps {
  title: string;
  showDashboardIcons?: boolean;
  onNotificationClick?: () => void;
  onSettingsClick?: () => void;
  onProfileClick?: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const Header: React.FC<HeaderProps> = ({ title, showDashboardIcons, onNotificationClick, onSettingsClick, onProfileClick, theme, setTheme }) => {
  return (
    <header className="flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between h-16 px-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <div className="flex items-center space-x-2">
            <ThemeToggle theme={theme} setTheme={setTheme} />
            {showDashboardIcons && (
                <>
                    <button onClick={onNotificationClick} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="View Notifications">
                        <BellIcon className="w-6 h-6" />
                    </button>
                    <button onClick={onSettingsClick} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Open Settings">
                        <CogIcon className="w-6 h-6" />
                    </button>
                    <button onClick={onProfileClick} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="View Profile">
                        <UserCircleIcon className="w-8 h-8" />
                    </button>
                </>
            )}
        </div>
      </div>
    </header>
  );
};
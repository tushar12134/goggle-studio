import React, { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { Header } from './components/Header';
import { AITutorScreen } from './screens/AITutorScreen';
import { StudentDashboard } from './screens/StudentDashboard';
import { Screen, UserProfile, ToolType, UserRole } from './types';
import { NAV_ITEMS } from './constants';
import { Theme } from './App';
import { ProfileScreen } from './screens/ProfileScreen';
import { ReportScreen } from './screens/ReportScreen';
import { ToolsScreen } from './screens/ToolsScreen';
import { ServicesScreen } from './screens/ServicesScreen';
import SettingsModal from './components/SettingsModal';
import { TeacherDashboard } from './screens/TeacherDashboard';
import { FloatingChatbot } from './components/FloatingChatbot';

interface MainAppProps {
    userProfile: UserProfile;
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const MainApp: React.FC<MainAppProps> = ({ userProfile, theme, setTheme }) => {
  const [activeScreen, setActiveScreen] = useState<Screen>(Screen.Home);
  const [initialTool, setInitialTool] = useState<ToolType | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const navigateToTool = (tool: ToolType) => {
    setInitialTool(tool);
    setActiveScreen(Screen.Tools);
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case Screen.Home:
        if (userProfile.role === UserRole.Teacher) {
            return <TeacherDashboard userProfile={userProfile} />;
        }
        return <StudentDashboard userProfile={userProfile} setActiveScreen={setActiveScreen} navigateToTool={navigateToTool} />;
      case Screen.AITutor:
        return <AITutorScreen />;
      case Screen.Tools:
        return <ToolsScreen userProfile={userProfile} initialTool={initialTool} onToolExited={() => setInitialTool(null)} />;
      case Screen.Report:
        return <ReportScreen userProfile={userProfile} />;
      case Screen.Profile:
        return <ProfileScreen />;
      case Screen.Services:
        return <ServicesScreen userProfile={userProfile} />;
      default:
        return <StudentDashboard userProfile={userProfile} setActiveScreen={setActiveScreen} navigateToTool={navigateToTool} />;
    }
  };

  const currentScreen = NAV_ITEMS.find(item => item.id === activeScreen);
  let title = activeScreen === Screen.Home ? 'Dashboard' : currentScreen?.label || 'Edgelearn';
  if (activeScreen === Screen.Profile) {
    title = 'My Profile';
  }

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden">
      <Header 
        title={title}
        showDashboardIcons={activeScreen === Screen.Home}
        onNotificationClick={() => alert('Notifications will be shown here!')}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
        onProfileClick={() => setActiveScreen(Screen.Profile)}
        theme={theme}
        setTheme={setTheme}
      />
      <main key={activeScreen} className="flex-1 overflow-y-auto p-4 scrollbar-hide animate-fade-in">
        {renderScreen()}
      </main>
      <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} userProfile={userProfile} />

      {isSettingsModalOpen && (
        <SettingsModal 
            isOpen={isSettingsModalOpen} 
            onClose={() => setIsSettingsModalOpen(false)} 
        />
      )}
      <FloatingChatbot />
    </div>
  );
};

// Minimal scrollbar styling for webkit browsers
const style = document.createElement('style');
style.innerHTML = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;
document.head.appendChild(style);


export default MainApp;
import React, { useState } from 'react';
import { Screen, UserProfile, ToolType } from '../types';
import { ClockIcon, UsersIcon, StreakIcon, BookIcon, AITutorIcon, ToolsIcon, ReportIcon, BeakerIcon, BriefcaseIcon } from '../constants';
import InteractiveQuizModal from '../components/InteractiveQuizModal';

interface StudentDashboardProps {
  userProfile: UserProfile;
  setActiveScreen: (screen: Screen) => void;
  navigateToTool: (tool: ToolType) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ userProfile, setActiveScreen, navigateToTool }) => {
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  
  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
        return 'Good Morning';
    } else if (currentHour < 18) {
        return 'Good Afternoon';
    } else {
        return 'Good Evening';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{`${getGreeting()}, ${userProfile.name}! 👋`}</h1>
            <p className="text-purple-200 mt-1">"Education is the passport to the future"</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={<ClockIcon className="w-7 h-7" />} label="Study Hours" value="13.5h" color="text-sky-500 dark:text-sky-400" bgColor="bg-sky-500/10 dark:bg-sky-400/10" />
        <StatCard icon={<UsersIcon className="w-7 h-7" />} label="Teachers" value="3" color="text-purple-500 dark:text-purple-400" bgColor="bg-purple-500/10 dark:bg-purple-400/10" />
        <StatCard icon={<StreakIcon className="w-7 h-7" />} label="Streak" value="7" color="text-emerald-500 dark:text-emerald-400" bgColor="bg-emerald-500/10 dark:bg-emerald-400/10" />
        <StatCard icon={<BookIcon className="w-7 h-7" />} label="Subjects" value={String(userProfile.subjects.length)} color="text-amber-500 dark:text-amber-400" bgColor="bg-amber-500/10 dark:bg-amber-400/10" />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">⚡️ Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionCard label="AI Tutor" icon={<AITutorIcon className="w-8 h-8"/>} onClick={() => setActiveScreen(Screen.AITutor)}/>
            <QuickActionCard label="Tools" icon={<ToolsIcon className="w-8 h-8"/>} onClick={() => setActiveScreen(Screen.Tools)}/>
            <QuickActionCard label="Reports" icon={<ReportIcon className="w-8 h-8"/>} onClick={() => setActiveScreen(Screen.Report)}/>
            <QuickActionCard label="Services" icon={<BriefcaseIcon className="w-8 h-8"/>} onClick={() => setActiveScreen(Screen.Services)}/>
        </div>
      </div>

      {/* Engage & Learn */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">🚀 Engage & Learn</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EngagementCard 
                title="Interactive Quiz"
                description="Test your knowledge on any subject with AI-generated quizzes."
                icon={<BeakerIcon className="w-8 h-8"/>}
                onClick={() => setIsQuizModalOpen(true)}
            />
            <EngagementCard 
                title="Find a Teacher"
                description="Browse expert teachers and start a conversation for 1-on-1 help."
                icon={<UsersIcon className="w-8 h-8"/>}
                onClick={() => navigateToTool(ToolType.Communication)}
            />
        </div>
      </div>
       
      {/* My Subjects */}
       <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">📚 My Subjects</h3>
        <div className="flex gap-2 flex-wrap">
            {userProfile.subjects.map(subject => <SubjectChip key={subject}>{subject}</SubjectChip>)}
        </div>
       </div>
       
       {isQuizModalOpen && <InteractiveQuizModal isOpen={isQuizModalOpen} onClose={() => setIsQuizModalOpen(false)} />}
    </div>
  );
};

const StatCard = ({ icon, label, value, color, bgColor }: { icon: React.ReactNode, label: string, value: string, color: string, bgColor: string}) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl flex items-center space-x-4 transition-all duration-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
        <div className={`p-3 rounded-full ${bgColor} ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const QuickActionCard = ({ label, icon, onClick }: { label: string, icon: React.ReactNode, onClick: () => void }) => (
    <button onClick={onClick} className="bg-white dark:bg-gray-800 p-4 rounded-2xl text-center transition-all duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700 transform hover:-translate-y-1 active:scale-95 border border-gray-200 dark:border-gray-700">
        <div className="text-purple-500 dark:text-purple-400 w-12 h-12 mx-auto flex items-center justify-center bg-purple-500/10 dark:bg-purple-400/10 rounded-xl mb-2">
            {icon}
        </div>
        <p className="font-semibold text-gray-800 dark:text-white">{label}</p>
    </button>
);

const EngagementCard = ({ title, description, icon, onClick }: { title: string, description: string, icon: React.ReactNode, onClick: () => void }) => (
    <button onClick={onClick} className="bg-white dark:bg-gray-800 p-4 rounded-2xl text-left flex items-center space-x-4 transition-all duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700 transform hover:-translate-y-1 active:scale-95 border border-gray-200 dark:border-gray-700">
        <div className="text-purple-500 dark:text-purple-400 w-14 h-14 flex-shrink-0 flex items-center justify-center bg-purple-500/10 dark:bg-purple-400/10 rounded-xl">
            {icon}
        </div>
        <div>
            <p className="font-semibold text-gray-800 dark:text-white">{title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>
    </button>
);

// FIX: Added a dedicated interface for SubjectChip component props to fix a TypeScript error.
interface SubjectChipProps {
  children: React.ReactNode;
}

const SubjectChip = ({ children }: SubjectChipProps) => (
    <span className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
        {children}
    </span>
);
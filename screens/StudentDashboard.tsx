import React, { useState, useMemo, useEffect } from 'react';
import { Screen, UserProfile, ToolType, LearningProgress, SharedMaterial } from '../types';
import { ClockIcon, UsersIcon, StreakIcon, BookIcon, AITutorIcon, ToolsIcon, ReportIcon, BeakerIcon, BriefcaseIcon, AtomIcon, GlobeAltIcon } from '../constants';
import InteractiveQuizModal from '../components/InteractiveQuizModal';
import { getMaterialsForStudent } from '../services/firebaseService';
import { auth } from '../services/firebaseService';
import SubjectDetailModal from '../components/SubjectDetailModal';

interface StudentDashboardProps {
  userProfile: UserProfile;
  setActiveScreen: (screen: Screen) => void;
  navigateToTool: (tool: ToolType) => void;
}

// Helper function to calculate progress
const calculateOverallProgress = (progress?: LearningProgress): number => {
    if (!progress || !progress.totalAssignments || !progress.studyGoal) return 0;

    const assignmentProgress = (progress.completedAssignments / progress.totalAssignments) * 100;
    const quizProgress = progress.averageQuizScore; // Assumed to be a percentage already
    const studyProgress = (progress.studyHours / progress.studyGoal) * 100;

    // Weighted average can be more sophisticated, but a simple average is fine for now.
    const overall = (assignmentProgress + quizProgress + studyProgress) / 3;
    
    return Math.min(100, Math.round(overall)); // Cap at 100
};


export const StudentDashboard: React.FC<StudentDashboardProps> = ({ userProfile, setActiveScreen, navigateToTool }) => {
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [sharedMaterials, setSharedMaterials] = useState<SharedMaterial[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  
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
  
  const overallProgress = useMemo(() => calculateOverallProgress(userProfile.learningProgress), [userProfile.learningProgress]);

  useEffect(() => {
    if (auth.currentUser) {
        const unsubscribe = getMaterialsForStudent(auth.currentUser.uid, setSharedMaterials);
        return () => unsubscribe();
    }
  }, []);


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
      
      {/* Overall Progress */}
      <OverallProgressCard progress={overallProgress} />

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

       {/* Classroom Resources */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">🎓 Classroom Resources</h3>
        <div className="space-y-3">
          {sharedMaterials.length > 0 ? (
            sharedMaterials.map(material => <MaterialCard key={material.id} material={material} />)
          ) : (
            <div className="text-center py-8 px-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No materials shared by your teachers yet.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Connect with a teacher to get started!</p>
            </div>
          )}
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {userProfile.subjects.map(subject => (
                <SubjectCard 
                    key={subject} 
                    subject={subject} 
                    onClick={() => setSelectedSubject(subject)} 
                />
            ))}
        </div>
       </div>
       
       {isQuizModalOpen && <InteractiveQuizModal isOpen={isQuizModalOpen} onClose={() => setIsQuizModalOpen(false)} />}
       {selectedSubject && <SubjectDetailModal isOpen={!!selectedSubject} onClose={() => setSelectedSubject(null)} subject={selectedSubject} />}
    </div>
  );
};

const OverallProgressCard: React.FC<{ progress: number }> = ({ progress }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    const getProgressMessage = (p: number) => {
        if (p >= 90) return "Excellent work!";
        if (p >= 75) return "Great progress!";
        if (p >= 50) return "Keep it up!";
        return "Let's get learning!";
    };

    return (
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center space-x-4">
            <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
                <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-200 dark:text-gray-700" />
                    <circle
                        cx="56" cy="56" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent"
                        strokeDasharray={circumference} strokeDashoffset={offset}
                        className="text-purple-500 transition-all duration-1000 ease-out" strokeLinecap="round"
                    />
                </svg>
                <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">{progress}%</span>
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Overall Learning Progress</h3>
                <p className="text-gray-500 dark:text-gray-400">{getProgressMessage(progress)}</p>
            </div>
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

const MaterialCard: React.FC<{ material: SharedMaterial }> = ({ material }) => (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center space-x-3">
        <div className="w-10 h-10 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xl">
            {material.type === 'file' ? '📄' : '🔗'}
        </div>
        <div className="flex-1 overflow-hidden">
            <p className="font-bold truncate" title={material.title}>{material.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Shared by {material.teacherName}</p>
        </div>
        <a href={material.url} target="_blank" rel="noopener noreferrer" className="ml-auto flex-shrink-0 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg text-sm hover:bg-purple-700 transition-colors">
            View
        </a>
    </div>
);


const SubjectCard: React.FC<{ subject: string; onClick: () => void; }> = ({ subject, onClick }) => {
    // A simple logic to assign an icon based on subject name
    const getIcon = () => {
        const lowerSubject = subject.toLowerCase();
        if (['physics', 'chemistry', 'biology', 'science'].some(s => lowerSubject.includes(s))) {
            return <AtomIcon className="w-8 h-8"/>;
        }
        if (['history', 'geography', 'literature', 'english'].some(s => lowerSubject.includes(s))) {
            return <GlobeAltIcon className="w-8 h-8"/>;
        }
        return <BookIcon className="w-8 h-8"/>;
    };
    return (
        <button onClick={onClick} className="bg-white dark:bg-gray-800 p-4 rounded-2xl text-center transition-all duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700 transform hover:-translate-y-1 active:scale-95 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="text-purple-500 dark:text-purple-400 w-12 h-12 mx-auto flex items-center justify-center bg-purple-500/10 dark:bg-purple-400/10 rounded-xl mb-2">
                {getIcon()}
            </div>
            <p className="font-semibold text-gray-800 dark:text-white truncate">{subject}</p>
        </button>
    );
};
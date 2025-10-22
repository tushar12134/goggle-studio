import React, { useState } from 'react';
import { 
    BriefcaseIcon, 
    UsersIcon, 
    FolderIcon, 
    RocketLaunchIcon, 
    // FIX: Replaced 'ClipboardDocumentListIcon' with the correctly named 'ClipboardDocumentIcon' to resolve an import error.
    ClipboardDocumentIcon,
    ChatBubbleLeftRightIcon
} from '../constants';
import { Assignment, SharedMaterial, ClassroomInfo, ClassroomQuiz } from '../types';

// --- MOCK DATA ---
const mockHasTeacherConnection = true; // Set to false to see the "zero state"

const mockAssignments: Assignment[] = [
    { id: '1', title: 'Quantum Mechanics Problem Set 1', subject: 'Physics', dueDate: 'Oct 28, 2024', status: 'Pending' },
    { id: '2', title: 'Essay: The Elizabethan Era', subject: 'Literature', dueDate: 'Oct 25, 2024', status: 'Submitted' },
    { id: '3', title: 'Calculus Derivatives Worksheet', subject: 'Mathematics', dueDate: 'Oct 22, 2024', status: 'Graded' },
];

const mockMaterials: SharedMaterial[] = [
    { id: '1', title: 'Lecture Notes - Week 5', type: 'file', description: 'PDF covering Schrödinger\'s equation.' },
    { id: '2', title: 'Khan Academy: Integrals', type: 'link', description: 'Helpful video series on integration.' },
    { id: '3', title: 'Historical Maps Archive', type: 'link', description: 'Primary source maps for your essay.' },
];

const mockClasses: ClassroomInfo[] = [
    { id: '1', teacherName: 'Dr. Jane Doe', subject: 'Physics', nextSession: 'Tomorrow at 10:00 AM' },
    { id: '2', teacherName: 'Prof. Emily White', subject: 'Literature', nextSession: 'Friday at 2:00 PM' },
];

const mockQuizzes: ClassroomQuiz[] = [
    { id: '1', title: 'Quiz 3: Thermodynamics', subject: 'Physics', dueDate: 'Oct 20, 2024', score: 92 },
    { id: '2', title: 'Pop Quiz: Shakespearean Sonnets', subject: 'Literature', dueDate: 'Oct 18, 2024', score: null },
    { id: '3', title: 'Mid-Term Practice Quiz', subject: 'Mathematics', dueDate: 'N/A', score: null },
];
// --- END MOCK DATA ---

type ServiceView = 'dashboard' | 'classroom' | 'tutoring' | 'library' | 'guidance';

export const ServicesScreen: React.FC = () => {
    const [view, setView] = useState<ServiceView>('dashboard');

    const renderContent = () => {
        switch(view) {
            case 'classroom':
                return <ClassroomView onBack={() => setView('dashboard')} />;
            // Add cases for other services here when they are built
            // case 'tutoring':
            //     return <TutoringView onBack={() => setView('dashboard')} />;
            case 'dashboard':
            default:
                return <DashboardView onSelectService={setView} />;
        }
    };

    return <div className="animate-fade-in">{renderContent()}</div>;
};

// --- Dashboard View ---
const DashboardView: React.FC<{ onSelectService: (view: ServiceView) => void }> = ({ onSelectService }) => {
    const services = [
        { id: 'classroom', title: 'Classroom', description: 'Assignments, materials, and live classes from your teachers.', icon: <ClipboardDocumentIcon className="w-8 h-8" /> },
        { id: 'tutoring', title: 'Personalized Tutoring', description: 'Connect with expert tutors for 1-on-1 guidance.', icon: <UsersIcon className="w-8 h-8" /> },
        { id: 'library', title: 'Digital Content Library', description: 'Access exclusive e-books, videos, and study guides.', icon: <FolderIcon className="w-8 h-8" /> },
        { id: 'guidance', title: 'Career Guidance', description: 'AI-powered resume analysis and mock interviews.', icon: <RocketLaunchIcon className="w-8 h-8" /> },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Services</h1>
                <p className="text-gray-500 dark:text-gray-400">Tools to supercharge your learning and career.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map(service => (
                    <ServiceCard key={service.id} {...service} onClick={() => onSelectService(service.id as ServiceView)} />
                ))}
            </div>
        </div>
    );
};

const ServiceCard: React.FC<{ title: string, description: string, icon: React.ReactNode, onClick: () => void }> = ({ title, description, icon, onClick }) => (
    <button onClick={onClick} className="bg-white dark:bg-gray-800 p-4 rounded-2xl text-left flex items-start space-x-4 transition-all duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700 transform hover:-translate-y-1 active:scale-95 border border-gray-200 dark:border-gray-700">
        <div className="text-purple-500 dark:text-purple-400 w-14 h-14 flex-shrink-0 flex items-center justify-center bg-purple-500/10 dark:bg-purple-400/10 rounded-xl">
            {icon}
        </div>
        <div>
            <p className="font-semibold text-lg text-gray-800 dark:text-white">{title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>
    </button>
);

// --- Classroom View ---
type ClassroomTab = 'assignments' | 'materials' | 'classes' | 'quizzes';

const ClassroomView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<ClassroomTab>('assignments');

    const renderTabContent = () => {
        if (!mockHasTeacherConnection) {
            return (
                <div className="text-center py-16">
                    <ChatBubbleLeftRightIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold">No Teacher Connection</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">You need to connect with a teacher to see your classroom.</p>
                    <p className="text-gray-500 dark:text-gray-400">Use the "Find a Teacher" tool to get started.</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'assignments':
                return <div className="space-y-3">{mockAssignments.map(a => <AssignmentCard key={a.id} assignment={a} />)}</div>;
            case 'materials':
                return <div className="space-y-3">{mockMaterials.map(m => <MaterialCard key={m.id} material={m} />)}</div>;
            case 'classes':
                return <div className="space-y-3">{mockClasses.map(c => <ClassCard key={c.id} classInfo={c} />)}</div>;
            case 'quizzes':
                return <div className="space-y-3">{mockQuizzes.map(q => <QuizCard key={q.id} quiz={q} />)}</div>;
            default:
                return null;
        }
    };
    
    return (
         <div className="space-y-4">
            <button onClick={onBack} className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-semibold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                Back to Services
            </button>
            <h1 className="text-2xl font-bold">My Classroom</h1>
            
            {/* Tabs */}
            <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
                <TabButton name="Assignments" activeTab={activeTab} onClick={() => setActiveTab('assignments')} />
                <TabButton name="Materials" activeTab={activeTab} onClick={() => setActiveTab('materials')} />
                <TabButton name="Classes" activeTab={activeTab} onClick={() => setActiveTab('classes')} />
                <TabButton name="Quizzes" activeTab={activeTab} onClick={() => setActiveTab('quizzes')} />
            </div>

            {/* Content */}
            <div className="py-4">
                {renderTabContent()}
            </div>
        </div>
    );
};

const TabButton: React.FC<{name: string, activeTab: string, onClick: () => void}> = ({ name, activeTab, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors ${activeTab === name.toLowerCase() ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
        {name}
    </button>
);

// --- Classroom Item Cards ---
const AssignmentCard: React.FC<{ assignment: Assignment }> = ({ assignment }) => {
    const statusStyles = {
        Pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
        Submitted: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        Graded: 'bg-green-500/10 text-green-600 dark:text-green-400',
    };
    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold">{assignment.title}</p>
                    <p className="text-xs text-gray-500">{assignment.subject} &bull; Due: {assignment.dueDate}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[assignment.status]}`}>{assignment.status}</span>
            </div>
        </div>
    );
};
const MaterialCard: React.FC<{ material: SharedMaterial }> = ({ material }) => (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center space-x-3">
        <div className="w-8 h-8 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">📄</div>
        <div>
            <p className="font-bold">{material.title}</p>
            <p className="text-xs text-gray-500">{material.description}</p>
        </div>
        <a href="#" className="ml-auto text-purple-600 hover:underline text-sm font-semibold">View</a>
    </div>
);
const ClassCard: React.FC<{ classInfo: ClassroomInfo }> = ({ classInfo }) => (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="font-bold text-lg">{classInfo.subject}</p>
        <p className="text-sm text-gray-500">with {classInfo.teacherName}</p>
        <p className="text-xs mt-2"><strong>Next Session:</strong> {classInfo.nextSession}</p>
        <button className="w-full mt-3 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">Join Live Session</button>
    </div>
);
const QuizCard: React.FC<{ quiz: ClassroomQuiz }> = ({ quiz }) => (
     <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
            <p className="font-bold">{quiz.title}</p>
            <p className="text-xs text-gray-500">{quiz.subject} &bull; Due: {quiz.dueDate}</p>
        </div>
        {quiz.score !== null ? (
            <div className="text-right">
                <p className="text-xs text-gray-500">Score</p>
                <p className="font-bold text-xl text-green-600">{quiz.score}%</p>
            </div>
        ) : (
             <button className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg text-sm hover:bg-purple-700">Start Quiz</button>
        )}
    </div>
);
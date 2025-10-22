import React, { useState } from 'react';
import { Teacher } from '../../types';
import { MOCK_TEACHERS, UserPlusIcon, EyeIcon } from '../../constants';
import TeacherProfileModal from '../../components/TeacherProfileModal';

const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" /></svg>
);

export const FindTeacher: React.FC = () => {
    const [viewingProfile, setViewingProfile] = useState<Teacher | null>(null);
    const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

    const handleSendRequest = (teacherId: string) => {
        setSentRequests(prev => new Set(prev).add(teacherId));
    };
    
    return (
        <div className="space-y-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Find a Teacher</h1>
            <p className="text-gray-500 dark:text-gray-400">Browse experts from around the world and connect for 1-on-1 help.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_TEACHERS.map(teacher => (
                    <div key={teacher.id} className="flex flex-col p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-all transform hover:-translate-y-1">
                        <div className="flex items-center mb-3">
                            <div className="relative">
                                <img src={teacher.avatar} alt={teacher.name} className="w-16 h-16 rounded-full object-cover" />
                                <span className={`absolute bottom-0 right-0 block h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 ${teacher.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{teacher.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{teacher.subject}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-1 text-amber-500">
                                <StarIcon className="w-5 h-5" />
                                <span className="font-semibold text-gray-700 dark:text-gray-300">{teacher.rating.toFixed(1)}</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-auto">
                            <button onClick={() => setViewingProfile(teacher)} className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-semibold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                <EyeIcon className="w-4 h-4" />
                                <span>View Profile</span>
                            </button>
                            <button 
                                onClick={() => handleSendRequest(teacher.id)} 
                                disabled={sentRequests.has(teacher.id)}
                                className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-semibold bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-400 disabled:cursor-not-allowed"
                            >
                                <UserPlusIcon className="w-4 h-4" />
                                <span>{sentRequests.has(teacher.id) ? 'Request Sent' : 'Send Request'}</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {viewingProfile && (
                <TeacherProfileModal teacher={viewingProfile} onClose={() => setViewingProfile(null)} />
            )}
        </div>
    );
};
import React from 'react';
import { UserRole } from '../types';
import { GraduationCapIcon, StudentRoleIcon, TeacherRoleIcon } from '../constants';

interface RoleSelectionScreenProps {
    onSelectRole: (role: UserRole) => void;
}

const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ onSelectRole }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-full p-4 sm:p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            <div className="w-full max-w-sm space-y-8 animate-fade-in">
                <div className="text-center space-y-4">
                    <div className="inline-block p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
                        <GraduationCapIcon className="w-10 h-10 text-gray-800 dark:text-gray-200" />
                    </div>
                    <h1 className="text-3xl font-bold">Welcome to Edgelearn</h1>
                    <p className="text-gray-600 dark:text-gray-400">Choose your role to get started 🚀</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <RoleCard role={UserRole.Student} icon={<StudentRoleIcon className="text-purple-500 w-full h-full" />} onSelect={onSelectRole} description="Access AI tools, track progress, and connect with teachers." />
                    <RoleCard role={UserRole.Teacher} icon={<TeacherRoleIcon className="text-sky-500 w-full h-full" />} onSelect={onSelectRole} description="Manage students, share materials, and create assignments." />
                </div>
            </div>
        </div>
    );
};

const RoleCard = ({ role, icon, description, onSelect }: { role: UserRole, icon: React.ReactNode, description: string, onSelect: (role: UserRole) => void }) => (
    <button
        onClick={() => onSelect(role)}
        className="w-full p-6 flex flex-col items-center justify-center space-y-3 rounded-2xl border-2 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none"
    >
        <div className="w-16 h-16">{icon}</div>
        <p className="font-semibold text-xl capitalize text-gray-800 dark:text-gray-200">I am a {role}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{description}</p>
    </button>
);

export default RoleSelectionScreen;

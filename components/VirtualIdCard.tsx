import React from 'react';
import { UserRole } from '../types';

interface VirtualIdCardProps {
    name: string;
    school: string;
    grade: string;
    role: UserRole;
}

const VirtualIdCard: React.FC<VirtualIdCardProps> = ({ name, school, grade, role }) => {
    return (
        <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg my-4 overflow-hidden relative transition-all duration-300 hover:shadow-purple-500/20 hover:border-purple-500/50">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-pink-600/10 dark:bg-pink-600/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md">
                        {name ? name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{name || 'Your Name'}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{school || 'Your School'}</p>
                    </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{grade ? `Grade: ${grade}` : 'Your Grade'}</p>
                    <span className="text-xs font-semibold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300 px-2.5 py-1 rounded-full">
                        {role}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default VirtualIdCard;
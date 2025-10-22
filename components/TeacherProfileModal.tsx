import React from 'react';
import { Teacher } from '../types';

interface TeacherProfileModalProps {
  teacher: Teacher;
  onClose: () => void;
}

const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({ teacher, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg transform transition-all duration-300 animate-pop-in">
        <div className="relative p-6">
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
          
          <div className="flex items-center space-x-4 mb-4">
            <img src={teacher.avatar} alt={teacher.name} className="w-20 h-20 rounded-full object-cover" />
            <div>
              <h2 className="text-2xl font-bold">{teacher.name}</h2>
              <p className="text-md text-gray-600 dark:text-gray-400">{teacher.subject}</p>
            </div>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <div>
                <h3 className="font-semibold text-lg border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">About</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{teacher.bio}</p>
            </div>
            <div>
                <h3 className="font-semibold text-lg border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">Experience</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    {teacher.experience.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            </div>
            <div>
                <h3 className="font-semibold text-lg border-b border-gray-200 dark:border-gray-700 pb-1 mb-2">Teaching Style</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{teacher.teachingStyle}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfileModal;

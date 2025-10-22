import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { UserRole } from '../types';
import { createUserProfile } from '../services/firebaseService';
import VirtualIdCard from '../components/VirtualIdCard';

interface ProfileSetupScreenProps {
  user: User;
  onProfileComplete: () => void;
}

const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ user, onProfileComplete }) => {
  const [name, setName] = useState(user.displayName || '');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [currentSubject, setCurrentSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddSubject = () => {
    if (currentSubject.trim() && !subjects.includes(currentSubject.trim())) {
      setSubjects([...subjects, currentSubject.trim()]);
      setCurrentSubject('');
    }
  };

  const handleRemoveSubject = (subjectToRemove: string) => {
    setSubjects(subjects.filter(s => s !== subjectToRemove));
  };
  
  const handleSubmit = async () => {
    if (!name || !school || !grade || subjects.length === 0) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await createUserProfile(user.uid, {
        role: UserRole.Student, // default to student for now
        name,
        school,
        grade,
        subjects,
      });
      onProfileComplete();
    } catch (err) {
      setError('Failed to create profile. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="w-full max-w-lg p-6 space-y-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 animate-pop-in">
        <h1 className="text-2xl font-bold text-center">Complete Your Profile</h1>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400">This will help us personalize your learning experience.</p>
        
        <VirtualIdCard name={name} school={school} grade={grade} role={UserRole.Student} />

        {error && <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-md">{error}</p>}

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">School / University</label>
            <input type="text" value={school} onChange={(e) => setSchool(e.target.value)} className="w-full p-2 mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Grade / Year</label>
            <input type="text" value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full p-2 mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Subjects</label>
            <div className="flex mt-1">
                <input type="text" value={currentSubject} onChange={(e) => setCurrentSubject(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()} placeholder="e.g., Physics" className="flex-1 p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-lg text-gray-900 dark:text-white" />
                <button onClick={handleAddSubject} className="p-2 bg-purple-600 rounded-r-lg hover:bg-purple-700 text-white font-bold text-xl leading-none flex items-center justify-center">+</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                {subjects.map(s => (
                    <span key={s} className="bg-gray-200 dark:bg-gray-700 text-sm px-3 py-1.5 rounded-full flex items-center transition-colors hover:bg-gray-300 dark:hover:bg-gray-600">
                        {s}
                        <button onClick={() => handleRemoveSubject(s)} className="ml-2 -mr-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full w-5 h-5 flex items-center justify-center transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </span>
                ))}
            </div>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={isLoading} className="w-full bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg text-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors">
          {isLoading ? 'Saving...' : 'Get Started'}
        </button>
      </div>
    </div>
  );
};

export default ProfileSetupScreen;
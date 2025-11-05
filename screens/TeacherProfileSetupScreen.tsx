import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { UserRole } from '../types';
import { createUserProfile, uploadProfileImage } from '../services/firebaseService';
import VirtualIdCard from '../components/VirtualIdCard';
import { UserCircleIcon } from '../constants';

interface TeacherProfileSetupScreenProps {
  user: User;
  onProfileComplete: () => void;
}

const TeacherProfileSetupScreen: React.FC<TeacherProfileSetupScreenProps> = ({ user, onProfileComplete }) => {
  const [name, setName] = useState(user.displayName || '');
  const [institution, setInstitution] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [currentSubject, setCurrentSubject] = useState('');
  const [bio, setBio] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(user.photoURL);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

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
    if (!name || !institution || subjects.length === 0) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      let imageUrl: string | undefined = user.photoURL || undefined;
      if (profileImageFile) {
        imageUrl = await uploadProfileImage(user.uid, profileImageFile);
      }

      await createUserProfile(user.uid, {
        role: UserRole.Teacher,
        name,
        institution,
        subjects,
        bio,
        profileImageUrl: imageUrl,
      });
      onProfileComplete();
    } catch (err) {
      console.error("Failed to create teacher profile:", err);
      setError('Failed to create profile. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="w-full max-w-lg p-6 space-y-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 animate-pop-in">
        <h1 className="text-2xl font-bold text-center">Teacher Profile Setup</h1>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400">Complete your professional profile to get started.</p>
        
        <div className="flex flex-col items-center space-y-2">
            <label htmlFor="profile-image-upload" className="cursor-pointer">
                {imagePreview ? (
                    <img src={imagePreview} alt="Profile Preview" className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700" />
                ) : (
                    <UserCircleIcon className="w-24 h-24 text-gray-400" />
                )}
            </label>
            <input id="profile-image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Tap image to change</span>
        </div>

        {error && <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-md">{error}</p>}

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">University / Institution</label>
            <input type="text" value={institution} onChange={(e) => setInstitution(e.target.value)} className="w-full p-2 mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white" />
          </div>
           <div>
             <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Bio / Professional Summary</label>
             <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="e.g., Passionate physics educator with 10+ years of experience..." className="w-full p-2 mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white" rows={3}></textarea>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Subjects You Teach</label>
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
          {isLoading ? 'Saving...' : 'Complete Profile'}
        </button>
      </div>
    </div>
  );
};

export default TeacherProfileSetupScreen;
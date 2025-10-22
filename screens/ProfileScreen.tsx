import React, { useState, useEffect } from 'react';
import { auth, getUserProfile, updateUserProfile } from '../services/firebaseService';
import { UserProfile } from '../types';
import VirtualIdCard from '../components/VirtualIdCard';
import { signOut } from 'firebase/auth';

export const ProfileScreen: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // --- New state for editing ---
    const [isEditing, setIsEditing] = useState(false);
    const [editState, setEditState] = useState<Partial<UserProfile>>({});
    const [newSubject, setNewSubject] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const fetchProfile = async () => {
        if (auth.currentUser) {
            setLoading(true);
            try {
                const userProfile = await getUserProfile(auth.currentUser.uid);
                if (userProfile) {
                    setProfile(userProfile);
                    setEditState(userProfile); // Initialize edit state
                } else {
                    setError('Could not find your profile.');
                }
            } catch (err) {
                setError('Failed to fetch profile data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
            setError('You are not logged in.');
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);
    
    const handleSave = async () => {
        if (!auth.currentUser || !profile) return;
        setIsSaving(true);
        try {
            await updateUserProfile(auth.currentUser.uid, editState);
            await fetchProfile(); // Re-fetch profile to show updated data
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to save profile:", err);
            alert("Could not save your profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditState(profile || {}); // Reset edit state to original profile
        setIsEditing(false);
    };

    const handleAddSubject = () => {
        if (newSubject.trim() && !editState.subjects?.includes(newSubject.trim())) {
            setEditState(prev => ({ ...prev, subjects: [...(prev.subjects || []), newSubject.trim()]}));
            setNewSubject('');
        }
    };
    
    const handleRemoveSubject = (subjectToRemove: string) => {
        setEditState(prev => ({ ...prev, subjects: prev.subjects?.filter(s => s !== subjectToRemove) }));
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-full">Loading profile...</div>;
    }

    if (error || !profile) {
        return <div className="flex items-center justify-center h-full text-red-500">{error || 'Profile not found.'}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="animate-pop-in">
                <VirtualIdCard name={isEditing ? editState.name! : profile.name} school={isEditing ? editState.school! : profile.school} grade={isEditing ? editState.grade! : profile.grade} role={profile.role} />
            </div>
            
            {isEditing ? (
                // --- EDITING VIEW ---
                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4 animate-fade-in">
                    <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</label>
                        <input type="text" value={editState.name} onChange={(e) => setEditState({...editState, name: e.target.value})} className="w-full p-2 mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">School / University</label>
                        <input type="text" value={editState.school} onChange={(e) => setEditState({...editState, school: e.target.value})} className="w-full p-2 mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Grade / Year</label>
                        <input type="text" value={editState.grade} onChange={(e) => setEditState({...editState, grade: e.target.value})} className="w-full p-2 mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Subjects</label>
                        <div className="flex mt-1">
                            <input type="text" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()} placeholder="Add a subject" className="flex-1 p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-lg" />
                            <button onClick={handleAddSubject} className="p-2 bg-purple-600 rounded-r-lg hover:bg-purple-700 text-white font-bold text-xl leading-none flex items-center justify-center">+</button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {editState.subjects?.map(s => (
                                <span key={s} className="bg-gray-200 dark:bg-gray-600 text-sm px-3 py-1.5 rounded-full flex items-center">
                                    {s}
                                    <button onClick={() => handleRemoveSubject(s)} className="ml-2 -mr-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full w-5 h-5 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex space-x-2 pt-2">
                        <button onClick={handleCancel} className="w-full bg-gray-500 text-white font-semibold py-2 rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
                        <button onClick={handleSave} disabled={isSaving} className="w-full bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors">
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            ) : (
                // --- VIEWING VIEW ---
                <>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 animate-pop-in" style={{ animationDelay: '200ms' }}>
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">📚 My Subjects</h3>
                        <div className="flex gap-2 flex-wrap">
                            {profile.subjects.map(subject => (
                                <span key={subject} className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2 rounded-full">
                                    {subject}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="animate-pop-in" style={{ animationDelay: '300ms' }}>
                      <button
                          onClick={() => setIsEditing(true)}
                          className="w-full bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl text-lg hover:bg-gray-700 transition-colors active:scale-95"
                      >
                          Edit Profile
                      </button>
                    </div>
                </>
            )}

            <div className="animate-pop-in" style={{ animationDelay: '400ms' }}>
              <button
                  onClick={handleSignOut}
                  className="w-full bg-red-600/20 text-red-500 dark:bg-red-500/10 dark:text-red-400 font-semibold py-3 px-6 rounded-xl text-lg hover:bg-red-600/30 dark:hover:bg-red-500/20 transition-colors active:scale-95"
              >
                  Sign Out
              </button>
            </div>
        </div>
    );
};
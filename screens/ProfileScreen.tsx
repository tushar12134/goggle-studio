import React, { useState, useEffect } from 'react';
import { auth, getUserProfile, updateUserProfile } from '../services/firebaseService';
import { UserProfile } from '../types';
import VirtualIdCard from '../components/VirtualIdCard';
import { signOut } from 'firebase/auth';
import { hasBiometricCredentials, enableBiometrics, disableBiometrics } from '../services/authService';
import { ShieldCheckIcon } from '../constants';

export const ProfileScreen: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [isEditing, setIsEditing] = useState(false);
    const [editState, setEditState] = useState<Partial<UserProfile>>({});
    const [newSubject, setNewSubject] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    // State for biometrics
    const [biometricsEnabled, setBiometricsEnabled] = useState(false);
    const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);
    const [password, setPassword] = useState('');

    const fetchProfile = async () => {
        if (auth.currentUser) {
            setLoading(true);
            try {
                const userProfile = await getUserProfile(auth.currentUser.uid);
                if (userProfile) {
                    setProfile(userProfile);
                    setEditState(userProfile);
                } else {
                    setError('Could not find your profile.');
                }
            } catch (err) {
                setError('Failed to fetch profile data.');
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchProfile();
        setBiometricsEnabled(hasBiometricCredentials());
    }, []);
    
    const handleSave = async () => {
        if (!auth.currentUser || !profile) return;
        setIsSaving(true);
        try {
            await updateUserProfile(auth.currentUser.uid, editState);
            await fetchProfile();
            setIsEditing(false);
        } catch (err) {
            alert("Could not save your profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEnableBiometrics = async () => {
        if (!password) {
            alert("Please enter your password to confirm.");
            return;
        }
        setIsSaving(true);
        const { success, message } = await enableBiometrics(password);
        alert(message);
        if (success) {
            setBiometricsEnabled(true);
            setIsBiometricModalOpen(false);
            setPassword('');
        }
        setIsSaving(false);
    };

    const handleDisableBiometrics = () => {
        disableBiometrics();
        setBiometricsEnabled(false);
        alert("Biometric sign-in has been disabled.");
    };

    const handleSignOut = async () => {
        await signOut(auth);
    };

    if (loading) return <div className="text-center p-8">Loading profile...</div>;
    if (error || !profile) return <div className="text-center p-8 text-red-500">{error || 'Profile not found.'}</div>;

    const renderViewMode = () => (
        <>
            {profile.bio && (
                 <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 animate-pop-in">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">About Me</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{profile.bio}"</p>
                </div>
            )}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 animate-pop-in" style={{ animationDelay: '100ms' }}>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">My Subjects</h3>
                <div className="flex gap-2 flex-wrap">
                    {profile.subjects.map(subject => (
                        <span key={subject} className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2 rounded-full">
                            {subject}
                        </span>
                    ))}
                </div>
            </div>
            <div className="animate-pop-in" style={{ animationDelay: '200ms' }}>
              <button onClick={() => setIsEditing(true)} className="w-full bg-gray-600 text-white font-semibold py-3 rounded-xl text-lg hover:bg-gray-700">Edit Profile</button>
            </div>
        </>
    );

    const renderEditMode = () => (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4 animate-fade-in">
            <input type="text" value={editState.name} onChange={(e) => setEditState({...editState, name: e.target.value})} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg" placeholder="Full Name" />
            <textarea value={editState.bio} onChange={e => setEditState({...editState, bio: e.target.value})} placeholder="Your Bio" className="w-full p-2 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg" />
            <div className="flex space-x-2 pt-2">
                <button onClick={() => setIsEditing(false)} className="w-full bg-gray-500 text-white font-semibold py-2 rounded-lg hover:bg-gray-600">Cancel</button>
                <button onClick={handleSave} disabled={isSaving} className="w-full bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 disabled:bg-purple-400">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="animate-pop-in">
                <VirtualIdCard uid={profile.uid} name={isEditing ? editState.name! : profile.name} bio={isEditing ? editState.bio : profile.bio} institution={isEditing ? editState.institution! : profile.institution} grade={isEditing ? editState.grade : profile.grade} role={profile.role} profileImageUrl={profile.profileImageUrl}/>
            </div>
            
            {isEditing ? renderEditMode() : renderViewMode()}

            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 animate-pop-in" style={{ animationDelay: '300ms' }}>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center"><ShieldCheckIcon className="w-6 h-6 mr-2" />Security</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">Biometric Sign-In</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Sign in quickly with your fingerprint or face.</p>
                    </div>
                    {biometricsEnabled ? (
                        <button onClick={handleDisableBiometrics} className="px-4 py-2 text-sm font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200">Disable</button>
                    ) : (
                        <button onClick={() => setIsBiometricModalOpen(true)} className="px-4 py-2 text-sm font-semibold bg-green-100 text-green-700 rounded-lg hover:bg-green-200">Enable</button>
                    )}
                </div>
            </div>

            <div className="animate-pop-in" style={{ animationDelay: '400ms' }}>
              <button onClick={handleSignOut} className="w-full bg-red-600/20 text-red-500 font-semibold py-3 rounded-xl text-lg hover:bg-red-600/30">Sign Out</button>
            </div>
            
            {isBiometricModalOpen && (
                 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
                        <h3 className="text-xl font-bold text-center">Verify Your Identity</h3>
                        <p className="text-sm text-center text-gray-500">Please enter your password to enable biometric sign-in.</p>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your Password" className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600" />
                        <div className="flex space-x-2">
                             <button onClick={() => { setIsBiometricModalOpen(false); setPassword(''); }} className="w-full bg-gray-500 text-white font-semibold py-2 rounded-lg hover:bg-gray-600">Cancel</button>
                             <button onClick={handleEnableBiometrics} disabled={isSaving} className="w-full bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 disabled:bg-purple-400">
                                {isSaving ? 'Verifying...' : 'Enable'}
                            </button>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
};
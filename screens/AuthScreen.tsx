import React, { useState } from 'react';
import { auth } from '../services/firebaseService';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { UserRole } from '../types';
import { GraduationCapIcon, StudentRoleIcon, TeacherRoleIcon, GitHubIcon } from '../constants';

const AuthScreen: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLogin, setIsLogin] = useState(false); // Default to Sign Up
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuthAction = async () => {
    if (!email || !password || (!isLogin && !name)) {
        setError("Please fill in all fields.");
        return;
    }
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  const handleSocialSignIn = async (provider: GoogleAuthProvider | GithubAuthProvider) => {
    setError('');
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  const RoleCard = ({ role, icon, onSelect }: { role: UserRole, icon: React.ReactNode, onSelect: (role: UserRole) => void}) => (
    <button 
        onClick={() => onSelect(role)}
        className={`flex-1 p-6 flex flex-col items-center justify-center space-y-2 rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none ${selectedRole === role ? 'bg-purple-500/10 border-purple-500' : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'}`}
    >
        <div className="w-16 h-16">{icon}</div>
        <p className="font-semibold text-lg capitalize text-gray-800 dark:text-gray-200">{role}</p>
    </button>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 sm:p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="w-full max-w-sm space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
            <div className="inline-block p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
                <GraduationCapIcon className="w-10 h-10 text-gray-800 dark:text-gray-200" />
            </div>
            <h1 className="text-3xl font-bold">Welcome to EduLearn</h1>
            <p className="text-gray-600 dark:text-gray-400">Choose your role and get started 🚀</p>
        </div>

        {/* Role Selection */}
        <div className="flex items-center space-x-4">
            <RoleCard role={UserRole.Student} icon={<StudentRoleIcon className="text-purple-500 w-full h-full" />} onSelect={setSelectedRole} />
            <RoleCard role={UserRole.Teacher} icon={<TeacherRoleIcon className="text-sky-500 w-full h-full" />} onSelect={setSelectedRole} />
        </div>

        {/* Auth Form Container */}
        {selectedRole && (
            <div className="space-y-6 animate-slide-in-up">
                {/* Sign In / Sign Up Toggle */}
                <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <button onClick={() => setIsLogin(false)} className={`w-full py-2 rounded-md font-semibold transition-colors ${!isLogin ? 'bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 shadow' : 'text-gray-600 dark:text-gray-400'}`}>Sign Up</button>
                    <button onClick={() => setIsLogin(true)} className={`w-full py-2 rounded-md font-semibold transition-colors ${isLogin ? 'bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 shadow' : 'text-gray-600 dark:text-gray-400'}`}>Sign In</button>
                </div>
                
                {error && <p className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-md">{error}</p>}
                
                {/* Form Fields */}
                <div className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="w-full p-3 mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                        </div>
                    )}
                    <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full p-3 mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full p-3 mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
                    </div>
                </div>

                <button onClick={handleAuthAction} className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg text-lg hover:bg-purple-700 transition-colors">
                    {isLogin ? 'Sign In' : 'Create Account'}
                </button>
                
                {/* Social Logins */}
                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300 dark:border-gray-600" /></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500">Or continue with</span></div>
                </div>

                <div className="flex space-x-4">
                    <button onClick={() => handleSocialSignIn(new GoogleAuthProvider())} className="w-full flex items-center justify-center space-x-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,35.846,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                        <span>Google</span>
                    </button>
                    <button onClick={() => handleSocialSignIn(new GithubAuthProvider())} className="w-full flex items-center justify-center space-x-2 bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-900 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-300 transition-colors">
                        <GitHubIcon className="w-5 h-5"/>
                        <span>GitHub</span>
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;

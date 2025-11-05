import React, { useState, useEffect } from 'react';
import LandingScreen from './screens/LandingScreen';
import MainApp from './MainApp';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, getUserProfile } from './services/firebaseService';
import { UserProfile, UserRole } from './types';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import TeacherProfileSetupScreen from './screens/TeacherProfileSetupScreen';
import RoleSelectionScreen from './screens/RoleSelectionScreen';
import StudentAuthScreen from './screens/StudentAuthScreen';
import TeacherAuthScreen from './screens/TeacherAuthScreen';

export type Theme = 'light' | 'dark' | 'system';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [authRole, setAuthRole] = useState<UserRole | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Always persist the theme choice.
    localStorage.setItem('theme', theme);

    const systemThemeChangeHandler = (e: MediaQueryListEvent) => {
        // This handler is only active when theme is 'system'.
        root.classList.toggle('dark', e.matches);
    };

    if (theme === 'system') {
        // For 'system', set the class based on the media query and listen for changes.
        root.classList.toggle('dark', mediaQuery.matches);
        mediaQuery.addEventListener('change', systemThemeChangeHandler);
    } else {
        // For 'light' or 'dark', just set the class directly.
        root.classList.toggle('dark', theme === 'dark');
    }

    // Cleanup: remove the listener when the component unmounts or the theme changes.
    // The new effect will add it back if necessary.
    return () => {
        mediaQuery.removeEventListener('change', systemThemeChangeHandler);
    };
  }, [theme]);
  
  const fetchProfile = async (uid: string) => {
    try {
        const userProfile = await getUserProfile(uid);
        setProfile(userProfile);
    } catch (error) {
        console.error("Failed to fetch user profile:", error);
        setProfile(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.uid);
      } else {
        setProfile(null);
        setAuthRole(null); // Reset role on signout
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        Loading...
      </div>
    );
  }

  if (showLanding) {
    return <LandingScreen onGetStarted={() => setShowLanding(false)} />;
  }

  if (!user) {
    if (!authRole) {
      return <RoleSelectionScreen onSelectRole={setAuthRole} />;
    }
    if (authRole === UserRole.Student) {
      return <StudentAuthScreen onBack={() => setAuthRole(null)} />;
    }
    if (authRole === UserRole.Teacher) {
      return <TeacherAuthScreen onBack={() => setAuthRole(null)} />;
    }
    // Fallback just in case
    return <RoleSelectionScreen onSelectRole={setAuthRole} />;
  }
  
  if (user && !profile) {
      const roleFromAuth = sessionStorage.getItem('selectedRole') as UserRole;
      if (roleFromAuth) {
          sessionStorage.removeItem('selectedRole'); // Clean up immediately
      }

      if (roleFromAuth === UserRole.Teacher) {
          return <TeacherProfileSetupScreen user={user} onProfileComplete={() => fetchProfile(user.uid)} />;
      }
      // Default to student setup if no role is found or it's 'student'
      return <ProfileSetupScreen user={user} onProfileComplete={() => fetchProfile(user.uid)} />;
  }

  return <MainApp userProfile={profile!} theme={theme} setTheme={setTheme} />;
};

export default App;

import React, { useState, useEffect } from 'react';
import LandingScreen from './screens/LandingScreen';
import MainApp from './MainApp';
import AuthScreen from './screens/AuthScreen';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, getUserProfile } from './services/firebaseService';
import { UserProfile } from './types';
import ProfileSetupScreen from './screens/ProfileSetupScreen';

export type Theme = 'light' | 'dark' | 'system';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // 1. Define the handler for system theme changes
    const systemThemeChangeHandler = (e: MediaQueryListEvent) => {
      // Only apply if the current theme is 'system'
      // We check localStorage directly to ensure we have the latest persisted value
      if ((localStorage.getItem('theme') || 'system') === 'system') {
        root.classList.toggle('dark', e.matches);
      }
    };

    // 2. Apply the current theme state from the user's selection
    if (theme === 'light') {
      root.classList.remove('dark');
    } else if (theme === 'dark') {
      root.classList.add('dark');
    } else { // 'system'
      root.classList.toggle('dark', mediaQuery.matches);
    }
    
    // 3. Persist the theme choice to localStorage
    localStorage.setItem('theme', theme);

    // 4. Add listener for system changes
    mediaQuery.addEventListener('change', systemThemeChangeHandler);

    // 5. Cleanup listener on unmount or when the effect re-runs
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
    return <AuthScreen />;
  }
  
  if (user && !profile) {
      return <ProfileSetupScreen user={user} onProfileComplete={() => fetchProfile(user.uid)} />;
  }

  return <MainApp userProfile={profile!} theme={theme} setTheme={setTheme} />;
};

export default App;

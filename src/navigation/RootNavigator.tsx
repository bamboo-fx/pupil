import React, { useEffect, useState } from 'react';
import { SplashScreen } from '../screens/SplashScreen';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { useAuthStore } from '../state/authStore';

export const RootNavigator: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { isAuthenticated, isLoading, setLoading } = useAuthStore();

  useEffect(() => {
    // Initialize auth state check
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (isLoading) {
    return <SplashScreen onFinish={() => setLoading(false)} />;
  }

  return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
};
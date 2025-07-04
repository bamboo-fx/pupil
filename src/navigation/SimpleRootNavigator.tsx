import React, { useEffect, useState } from 'react';
import { SimpleAuthNavigator } from './SimpleAuthNavigator';
import { AppNavigator } from './AppNavigator';
import { useAuthStore } from '../state/authStore';

export const SimpleRootNavigator: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { isAuthenticated, isLoading, setLoading } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return isAuthenticated ? <AppNavigator /> : <SimpleAuthNavigator />;
};
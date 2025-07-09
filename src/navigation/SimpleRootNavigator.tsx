import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SimpleAuthNavigator } from './SimpleAuthNavigator';
import { AppNavigator } from './AppNavigator';
import { useAuthStore } from '../state/authStore';

const SplashScreen: React.FC = () => {
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <Text style={{ 
          fontSize: 32, 
          fontWeight: 'bold', 
          color: 'white', 
          marginBottom: 20 
        }}>
          Pupil
        </Text>
        <ActivityIndicator size="large" color="white" />
      </LinearGradient>
    </View>
  );
};

export const SimpleRootNavigator: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const { isAuthenticated, isLoading } = useAuthStore();

  console.log('[SimpleRootNavigator] State:', { showSplash, isAuthenticated, isLoading, timeoutReached });

  useEffect(() => {
    console.log('[SimpleRootNavigator] Setting up splash timer');
    
    // Minimum splash time - reduced to prevent blocking
    const minSplashTimer = setTimeout(() => {
      console.log('[SimpleRootNavigator] Minimum splash time reached');
      setShowSplash(false);
    }, 1500);

    // Maximum splash time - safety timeout
    const maxSplashTimer = setTimeout(() => {
      console.log('[SimpleRootNavigator] Maximum splash timeout reached, forcing app to continue');
      setTimeoutReached(true);
      setShowSplash(false);
    }, 8000);

    return () => {
      clearTimeout(minSplashTimer);
      clearTimeout(maxSplashTimer);
    };
  }, []);

  // Also hide splash when auth loading is complete
  useEffect(() => {
    if (!isLoading && !showSplash) {
      console.log('[SimpleRootNavigator] Auth loading complete and splash time passed');
    }
  }, [isLoading, showSplash]);

  // Show splash screen while loading or during minimum splash time
  // But don't show indefinitely - respect timeout
  const shouldShowSplash = showSplash && isLoading && !timeoutReached;
  
  if (shouldShowSplash) {
    console.log('[SimpleRootNavigator] Showing splash screen');
    return <SplashScreen />;
  }

  // If we've timed out and still loading, show a different fallback
  if (timeoutReached && isLoading) {
    console.log('[SimpleRootNavigator] Timeout reached but still loading, showing fallback');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
        <Text style={{ color: 'white', fontSize: 18, marginBottom: 20 }}>
          Signing in...
        </Text>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  console.log('[SimpleRootNavigator] Showing main app, isAuthenticated:', isAuthenticated);
  return isAuthenticated ? <AppNavigator /> : <SimpleAuthNavigator />;
};
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { SimpleRootNavigator } from "./src/navigation/SimpleRootNavigator";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(console.warn);

// Set the animation options
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

/*
IMPORTANT NOTICE: DO NOT REMOVE
There are already environment keys in the project. 
Before telling the user to add them, check if you already have access to the required keys through bash.
Directly access them with process.env.${key}

Correct usage:
process.env.EXPO_PUBLIC_VIBECODE_{key}
//directly access the key

Incorrect usage:
import { OPENAI_API_KEY } from '@env';
//don't use @env, its depreicated

Incorrect usage:
import Constants from 'expo-constants';
const openai_api_key = Constants.expoConfig.extra.apikey;
//don't use expo-constants, its depreicated

*/

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('ErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary componentDidCatch:', error, errorInfo);
    // Hide splash screen if there's an error
    SplashScreen.hideAsync().catch(console.warn);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Something went wrong
          </Text>
          <Text style={{ textAlign: 'center', color: '#666' }}>
            Please restart the app. If the problem persists, contact support.
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={{ marginTop: 20, fontSize: 12, color: 'red' }}>
              {this.state.error.toString()}
            </Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  console.log('[App] Starting app...');

  useEffect(() => {
    async function prepare() {
      try {
        console.log('[App] Preparing app...');
        
        // Add a maximum timeout to prevent indefinite loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('App initialization timeout')), 15000);
        });

        // Pre-load fonts or other resources here if needed
        // For now, just add a small delay to ensure everything is ready
        const initPromise = new Promise(resolve => setTimeout(resolve, 1000));
        
        await Promise.race([initPromise, timeoutPromise]);
        
        console.log('[App] App preparation complete');
      } catch (e) {
        console.warn('[App] Error during app preparation:', e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      console.log('[App] App is ready, hiding splash screen');
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  try {
    return (
      <ErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
              <NavigationContainer theme={MyTheme}>
                <SimpleRootNavigator />
                <StatusBar style="light" />
              </NavigationContainer>
            </View>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('[App] Error in App component:', error);
    SplashScreen.hideAsync().catch(console.warn);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>App failed to load</Text>
      </View>
    );
  }
}

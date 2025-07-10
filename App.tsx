import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { SimpleRootNavigator } from "./src/navigation/SimpleRootNavigator";
import { initializePurchases } from './src/config/revenuecat';

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

export default function App() {
  useEffect(() => {
    // Initialize RevenueCat when app starts
    initializePurchases().then((success) => {
      if (success) {
        console.log('🎉 RevenueCat initialized successfully');
      } else {
        console.error('❌ RevenueCat initialization failed');
      }
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer theme={MyTheme}>
          <SimpleRootNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

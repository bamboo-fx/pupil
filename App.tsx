import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import { SimpleRootNavigator } from "./src/navigation/SimpleRootNavigator";
import { initializeStripe } from './src/config/stripe';
import { StripeProvider } from '@stripe/stripe-react-native';

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

export default function App() {
  useEffect(() => {
    // Initialize Stripe when app starts
    initializeStripe().then((success: boolean) => {
      if (success) {
        console.log('🎉 Stripe initialized successfully');
      } else {
        console.error('❌ Stripe initialization failed');
      }
    });
  }, []);

  return (
    <StripeProvider publishableKey="pk_test_your_publishable_key_here">
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer theme={MyTheme}>
            <SimpleRootNavigator />
            <StatusBar style="light" />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </StripeProvider>
  );
}

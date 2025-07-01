import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SimpleLoginScreen } from '../screens/SimpleLoginScreen';
import { SimpleSignupScreen } from '../screens/SimpleSignupScreen';

const Stack = createNativeStackNavigator();

export const SimpleAuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={SimpleLoginScreen} />
      <Stack.Screen name="Signup" component={SimpleSignupScreen} />
    </Stack.Navigator>
  );
};
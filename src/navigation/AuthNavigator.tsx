import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/SplashScreen';
import { AgeRangeScreen } from '../screens/AgeRangeScreen';
import { SkillLevelScreen } from '../screens/SkillLevelScreen';
import { CreateAccountScreen } from '../screens/CreateAccountScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { TermsOfUseScreen } from '../screens/TermsOfUseScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { SubscriptionInfoScreen } from '../screens/SubscriptionInfoScreen';

const Stack = createNativeStackNavigator();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="AgeRange" component={AgeRangeScreen} />
      <Stack.Screen name="SkillLevel" component={SkillLevelScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
      <Stack.Screen name="SubscriptionInfo" component={SubscriptionInfoScreen} />
      <Stack.Screen name="TermsOfUse" component={TermsOfUseScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
};
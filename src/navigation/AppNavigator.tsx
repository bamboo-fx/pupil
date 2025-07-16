import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DuolingoHomeScreen } from '../screens/DuolingoHomeScreen';
import { LessonScreen } from '../screens/LessonScreen';
import { LessonCompleteScreen } from '../screens/LessonCompleteScreen';
import { SimpleProfileScreen } from '../screens/SimpleProfileScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import QuestionBankScreen from '../screens/QuestionBankScreen';
import { TermsOfUseScreen } from '../screens/TermsOfUseScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { SubscriptionInfoScreen } from '../screens/SubscriptionInfoScreen';
import { BottomNavbar } from '../components/BottomNavbar';
import { Lesson } from '../types';

export type RootStackParamList = {
  Main: undefined;
  Lesson: {
    lessonId: string;
    lesson: Lesson;
  };
  LessonComplete: {
    lessonTitle: string;
    xpEarned: number;
    correctAnswers: number;
    totalQuestions: number;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNavbar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Learn" 
        component={DuolingoHomeScreen} 
      />
      <Tab.Screen 
        name="Search" 
        component={QuestionBankScreen}
      />
      <Tab.Screen 
        name="Leaderboard" 
        component={LeaderboardScreen}
      />
      <Tab.Screen 
        name="Profile" 
        component={SimpleProfileScreen} 
      />
    </Tab.Navigator>
  );
};

const AppStack = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Main"
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="Lesson" component={LessonScreen} />
      <Stack.Screen name="LessonComplete" component={LessonCompleteScreen} />
      <Stack.Screen name="SubscriptionInfo" component={SubscriptionInfoScreen} />
      <Stack.Screen name="TermsOfUse" component={TermsOfUseScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  return <AppStack />;
};
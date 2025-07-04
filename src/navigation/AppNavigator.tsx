import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DuolingoHomeScreen } from '../screens/DuolingoHomeScreen';
import { LessonScreen } from '../screens/LessonScreen';
import { LessonCompleteScreen } from '../screens/LessonCompleteScreen';
import { SimpleProfileScreen } from '../screens/SimpleProfileScreen';
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
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          const size = 30;
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Learn') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Leaderboard') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Profile') {
            return <MaterialCommunityIcons name={focused ? 'account' : 'account-outline'} size={size} color={color} />;
          } else {
            iconName = 'book-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
        },
      })}
    >
      <Tab.Screen 
        name="Learn" 
        component={DuolingoHomeScreen} 
        options={{ tabBarLabel: () => null }}
      />
      <Tab.Screen 
        name="Search" 
        component={DuolingoHomeScreen}
        options={{ tabBarLabel: () => null }}
      />
      <Tab.Screen 
        name="Leaderboard" 
        component={DuolingoHomeScreen}
        options={{ tabBarLabel: () => null }}
      />
      <Tab.Screen 
        name="Profile" 
        component={SimpleProfileScreen} 
        options={{ tabBarLabel: () => null }}
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
    </Stack.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  return <AppStack />;
};
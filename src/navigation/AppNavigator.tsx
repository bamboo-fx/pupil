import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DuolingoHomeScreen } from '../screens/DuolingoHomeScreen';
import { LessonScreen } from '../screens/LessonScreen';
import { LessonCompleteScreen } from '../screens/LessonCompleteScreen';
import { SimpleProfileScreen } from '../screens/SimpleProfileScreen';

const Stack = createNativeStackNavigator();
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
        tabBarActiveTintColor: '#1E40AF',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#F8F9FA',
          borderTopColor: '#F3F4F6',
          borderTopWidth: 3,
          paddingBottom: 6,
          paddingTop: 16,
          height: 90,
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

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Main"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="Lesson" component={LessonScreen} />
      <Stack.Screen 
        name="LessonComplete" 
        component={LessonCompleteScreen}
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DuolingoHomeScreen } from '../screens/DuolingoHomeScreen';
import { SimpleLessonScreen } from '../screens/SimpleLessonScreen';
import { SimpleLessonCompleteScreen } from '../screens/SimpleLessonCompleteScreen';
import { SimpleProfileScreen } from '../screens/SimpleProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Learn') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'book-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopColor: '#E5E7EB',
        },
      })}
    >
      <Tab.Screen 
        name="Learn" 
        component={DuolingoHomeScreen} 
        options={{ tabBarLabel: 'Learn' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={SimpleProfileScreen} 
        options={{ tabBarLabel: 'Profile' }}
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
      <Stack.Screen name="Lesson" component={SimpleLessonScreen} />
      <Stack.Screen 
        name="LessonComplete" 
        component={SimpleLessonCompleteScreen}
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};
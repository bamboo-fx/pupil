import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useProgressStore } from '../state/progressStore';
import { useAuthStore } from '../state/authStore';

export const SimpleProfileScreen: React.FC = () => {
  const { totalXp, completedLessons, resetProgress } = useProgressStore();
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-blue-500">
      <View className="px-4 py-3 bg-blue-500">
        <Text className="text-white text-xl font-bold text-center">👤 Your Profile</Text>
      </View>
      
      <ScrollView className="flex-1 bg-gray-100 p-4">
        <View className="items-center mb-6">
          <View className="w-24 h-24 bg-yellow-400 rounded-full items-center justify-center mb-4">
            <Text style={{ fontSize: 48 }}>🧠</Text>
          </View>
          <Text className="text-gray-800 text-2xl font-bold">{user?.name || 'DSA Master'}</Text>
          <Text className="text-gray-600 text-base">Level {Math.floor(totalXp / 100) + 1}</Text>
        </View>

        <View className="bg-white rounded-lg p-6 mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">📊 Your Stats</Text>
          
          <View className="space-y-4">
            <View className="flex-row justify-between items-center p-4 bg-blue-100 rounded-lg">
              <View className="flex-row items-center">
                <Text className="text-3xl mr-3">💎</Text>
                <Text className="text-gray-800 font-medium text-lg">Total XP</Text>
              </View>
              <Text className="text-blue-600 text-2xl font-bold">{totalXp}</Text>
            </View>
            
            <View className="flex-row justify-between items-center p-4 bg-green-100 rounded-lg">
              <View className="flex-row items-center">
                <Text className="text-3xl mr-3">📚</Text>
                <Text className="text-gray-800 font-medium text-lg">Lessons Completed</Text>
              </View>
              <Text className="text-green-600 text-2xl font-bold">{completedLessons.length}</Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-lg p-6 mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">🏆 Achievements</Text>
          
          <View className="space-y-3">
            <View className={`flex-row items-center p-3 rounded-lg ${
              completedLessons.length >= 1 ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <Text className="text-2xl mr-3">
                {completedLessons.length >= 1 ? '⭐' : '🔒'}
              </Text>
              <View className="flex-1">
                <Text className="font-bold text-gray-800">First Steps</Text>
                <Text className="text-gray-600 text-sm">Complete your first lesson</Text>
              </View>
              {completedLessons.length >= 1 && (
                <Text className="text-green-600 text-xl">✓</Text>
              )}
            </View>
            
            <View className={`flex-row items-center p-3 rounded-lg ${
              completedLessons.length >= 5 ? 'bg-orange-100' : 'bg-gray-100'
            }`}>
              <Text className="text-2xl mr-3">
                {completedLessons.length >= 5 ? '🔥' : '🔒'}
              </Text>
              <View className="flex-1">
                <Text className="font-bold text-gray-800">Learning Streak</Text>
                <Text className="text-gray-600 text-sm">Complete 5 lessons</Text>
              </View>
              {completedLessons.length >= 5 && (
                <Text className="text-orange-600 text-xl">✓</Text>
              )}
            </View>
            
            <View className={`flex-row items-center p-3 rounded-lg ${
              totalXp >= 100 ? 'bg-purple-100' : 'bg-gray-100'
            }`}>
              <Text className="text-2xl mr-3">
                {totalXp >= 100 ? '💎' : '🔒'}
              </Text>
              <View className="flex-1">
                <Text className="font-bold text-gray-800">XP Master</Text>
                <Text className="text-gray-600 text-sm">Earn 100 XP points</Text>
              </View>
              {totalXp >= 100 && (
                <Text className="text-purple-600 text-xl">✓</Text>
              )}
            </View>
          </View>
        </View>

        <View className="bg-white rounded-lg p-6 mb-4">
          <Text className="text-xl font-bold text-gray-800 mb-4">⚙️ Settings</Text>
          
          <View className="space-y-3">
            <Pressable
              onPress={() => resetProgress()}
              className="bg-red-500 p-4 rounded-lg mb-3"
            >
              <Text className="text-white font-bold text-center">🔄 Reset Progress</Text>
            </Pressable>
            
            <Pressable
              onPress={() => logout()}
              className="bg-blue-600 p-4 rounded-lg"
            >
              <Text className="text-white font-bold text-center">🚪 Sign Out</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
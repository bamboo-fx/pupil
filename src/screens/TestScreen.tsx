import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProgressStore } from '../state/progressStore';

export const TestScreen: React.FC = () => {
  const { totalXp, streak, hearts, completedLessons } = useProgressStore();

  return (
    <SafeAreaView className="flex-1 bg-blue-500">
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-white text-3xl font-bold mb-8">
          🧠 DSA Quest is Working!
        </Text>
        
        <View className="bg-white rounded-lg p-6 w-full mb-6">
          <Text className="text-xl font-bold text-center mb-4 text-gray-800">
            Your Progress
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-700">💎 XP:</Text>
              <Text className="font-bold text-blue-600">{totalXp}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-700">🔥 Streak:</Text>
              <Text className="font-bold text-orange-600">{streak}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-700">❤️ Hearts:</Text>
              <Text className="font-bold text-pink-600">{hearts}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-700">📚 Lessons:</Text>
              <Text className="font-bold text-green-600">{completedLessons.length}</Text>
            </View>
          </View>
        </View>
        
        <Text className="text-white text-center text-lg">
          The app is loading correctly! 🎉
        </Text>
        
        <Text className="text-white/80 text-center mt-2">
          Navigate using the tabs below to start learning
        </Text>
      </View>
    </SafeAreaView>
  );
};
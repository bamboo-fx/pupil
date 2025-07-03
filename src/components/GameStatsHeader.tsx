import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProgressStore } from '../state/progressStore';
import { LinearGradient } from 'expo-linear-gradient';

export const GameStatsHeader: React.FC = () => {
  const { totalXp, streak } = useProgressStore();

  return (
    <LinearGradient
      colors={['#10B981', '#059669']}
      className="px-4 py-3"
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center bg-white/20 rounded-full px-3 py-1">
          <Text className="text-white font-bold text-lg">🇺🇸</Text>
        </View>
        
        <View className="flex-row items-center space-x-6">
          <View className="flex-row items-center bg-orange-500 rounded-full px-3 py-1 shadow-lg">
            <View className="w-6 h-6 bg-yellow-400 rounded-full items-center justify-center mr-2">
              <Text className="text-orange-600 font-bold text-xs">🔥</Text>
            </View>
            <Text className="text-white font-bold text-lg">{streak}</Text>
          </View>
          
          <View className="flex-row items-center bg-blue-500 rounded-full px-3 py-1 shadow-lg">
            <View className="w-6 h-6 bg-cyan-300 rounded-full items-center justify-center mr-2">
              <Text className="text-blue-700 font-bold text-xs">💎</Text>
            </View>
            <Text className="text-white font-bold text-lg">{totalXp}</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};
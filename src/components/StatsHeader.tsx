import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProgressStore } from '../state/progressStore';

export const StatsHeader: React.FC = () => {
  const { totalXp, streak } = useProgressStore();

  return (
    <View className="flex-row justify-between items-center px-4 py-3 bg-green-500">
      <View className="flex-row items-center">
        <Ionicons name="flag" size={20} color="white" />
        <Text className="text-white font-bold ml-1 text-lg">FR</Text>
      </View>
      
      <View className="flex-row items-center space-x-4">
        <View className="flex-row items-center">
          <Ionicons name="flame" size={20} color="#FF6B35" />
          <Text className="text-white font-bold ml-1">{streak}</Text>
        </View>
        
        <View className="flex-row items-center">
          <Ionicons name="diamond" size={20} color="#00D4FF" />
          <Text className="text-white font-bold ml-1">{totalXp}</Text>
        </View>
      </View>
    </View>
  );
};
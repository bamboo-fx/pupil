import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GameStatsHeader } from '../components/GameStatsHeader';
import { useProgressStore } from '../state/progressStore';

export const ProfileScreen: React.FC = () => {
  const { totalXp, streak, hearts, completedLessons, resetProgress } = useProgressStore();

  const statsData = [
    { emoji: '💎', label: 'Total XP', value: totalXp, gradient: ['#00D4FF', '#0099CC'] },
    { emoji: '🔥', label: 'Day Streak', value: streak, gradient: ['#FF6B35', '#E55A31'] },
    { emoji: '❤️', label: 'Hearts', value: hearts, gradient: ['#FF6B9D', '#E55A8A'] },
    { emoji: '📚', label: 'Lessons Completed', value: completedLessons.length, gradient: ['#4CAF50', '#45A049'] },
  ];

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        className="flex-1"
      >
        <GameStatsHeader />
        
        <ScrollView className="flex-1 px-4 py-6">
          <View className="items-center mb-6">
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              className="w-24 h-24 rounded-full items-center justify-center mb-4"
            >
              <Text style={{ fontSize: 48 }}>🧠</Text>
            </LinearGradient>
            <Text className="text-white text-2xl font-bold">DSA Master</Text>
            <Text className="text-white/80 text-base">Level {Math.floor(totalXp / 100) + 1}</Text>
          </View>

          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            className="rounded-2xl p-6 mb-6"
          >
            <Text className="text-white text-xl font-bold mb-4">📊 Your Stats</Text>
            
            <View className="flex-row flex-wrap justify-between">
              {statsData.map((stat, index) => (
                <View key={index} className="w-[48%] mb-4">
                  <LinearGradient
                    colors={stat.gradient}
                    className="rounded-xl p-4 items-center"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    <Text style={{ fontSize: 28 }}>{stat.emoji}</Text>
                    <Text className="text-white text-2xl font-bold mt-2">{stat.value}</Text>
                    <Text className="text-white/90 text-sm text-center font-medium">{stat.label}</Text>
                  </LinearGradient>
                </View>
              ))}
            </View>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            className="rounded-2xl p-6 mb-6"
          >
            <Text className="text-white text-xl font-bold mb-4">🏆 Achievements</Text>
            
            <View className="space-y-3">
              <LinearGradient
                colors={
                  completedLessons.length >= 1 
                    ? ['#10B981', '#059669'] 
                    : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                }
                className="flex-row items-center p-4 rounded-xl"
              >
                <Text style={{ fontSize: 32 }}>
                  {completedLessons.length >= 1 ? '⭐' : '🔒'}
                </Text>
                <View className="ml-3 flex-1">
                  <Text className="font-bold text-white">First Steps</Text>
                  <Text className="text-white/80 text-sm">Complete your first lesson</Text>
                </View>
                {completedLessons.length >= 1 && (
                  <Text className="text-yellow-300 text-xl">✓</Text>
                )}
              </LinearGradient>
              
              <LinearGradient
                colors={
                  streak >= 3 
                    ? ['#F59E0B', '#D97706'] 
                    : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                }
                className="flex-row items-center p-4 rounded-xl"
              >
                <Text style={{ fontSize: 32 }}>
                  {streak >= 3 ? '🔥' : '🔒'}
                </Text>
                <View className="ml-3 flex-1">
                  <Text className="font-bold text-white">On Fire</Text>
                  <Text className="text-white/80 text-sm">Maintain a 3-day streak</Text>
                </View>
                {streak >= 3 && (
                  <Text className="text-yellow-300 text-xl">✓</Text>
                )}
              </LinearGradient>
              
              <LinearGradient
                colors={
                  totalXp >= 100 
                    ? ['#8B5CF6', '#7C3AED'] 
                    : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                }
                className="flex-row items-center p-4 rounded-xl"
              >
                <Text style={{ fontSize: 32 }}>
                  {totalXp >= 100 ? '💎' : '🔒'}
                </Text>
                <View className="ml-3 flex-1">
                  <Text className="font-bold text-white">XP Master</Text>
                  <Text className="text-white/80 text-sm">Earn 100 XP points</Text>
                </View>
                {totalXp >= 100 && (
                  <Text className="text-yellow-300 text-xl">✓</Text>
                )}
              </LinearGradient>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
            className="rounded-2xl p-6"
          >
            <Text className="text-white text-xl font-bold mb-4">⚙️ Settings</Text>
            
            <Pressable
              onPress={() => {
                resetProgress();
              }}
            >
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                className="flex-row items-center p-4 rounded-xl"
              >
                <Text style={{ fontSize: 24 }}>🔄</Text>
                <Text className="ml-3 text-white font-bold">Reset Progress</Text>
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};
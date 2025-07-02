import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface LessonCompleteScreenProps {
  navigation: any;
  route: {
    params: {
      lessonTitle: string;
      xpEarned: number;
      correctAnswers: number;
      totalQuestions: number;
    };
  };
}

export const LessonCompleteScreen: React.FC<LessonCompleteScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { lessonTitle, xpEarned, correctAnswers, totalQuestions } = route.params;
  const [bounceAnimation] = useState(new Animated.Value(0));
  const [scaleAnimation] = useState(new Animated.Value(0));
  
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(bounceAnimation, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnimation, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F8F9FA' }}>
      <View className="flex-1">
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View 
            style={{
              transform: [
                { 
                  scale: bounceAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  })
                }
              ]
            }}
            className="items-center mb-8"
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              className="w-32 h-32 rounded-full items-center justify-center mb-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <Text style={{ fontSize: 64 }}>🏆</Text>
            </LinearGradient>
            
            <Text className="text-gray-800 text-4xl font-bold text-center mb-2">
              Quest Complete!
            </Text>
            
            <Text className="text-gray-600 text-xl text-center font-medium">
              {lessonTitle}
            </Text>
          </Animated.View>
          
          <Animated.View 
            style={{
              transform: [{ scale: scaleAnimation }]
            }}
            className="w-full mb-8"
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              className="rounded-2xl p-6"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-gray-800 text-lg font-bold">Rewards Earned:</Text>
                <Text className="text-yellow-500 text-2xl">✨</Text>
              </View>
              
              <View className="space-y-4">
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-2">💎</Text>
                    <Text className="text-gray-800 text-lg font-medium">XP Points</Text>
                  </View>
                  <Text className="text-blue-600 text-2xl font-bold">+{xpEarned}</Text>
                </View>
                
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-2">🎯</Text>
                    <Text className="text-gray-800 text-lg font-medium">Accuracy</Text>
                  </View>
                  <Text className="text-green-600 text-2xl font-bold">{accuracy}%</Text>
                </View>
                
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-2">✅</Text>
                    <Text className="text-gray-800 text-lg font-medium">Correct Answers</Text>
                  </View>
                  <Text className="text-blue-600 text-2xl font-bold">
                    {correctAnswers}/{totalQuestions}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
          
          <Pressable
            onPress={() => navigation.navigate('Main')}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              className="py-4 px-12 rounded-2xl"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Text className="text-white text-xl font-bold text-center">
                🚀 Continue Adventure
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

interface SimpleLessonCompleteScreenProps {
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

export const SimpleLessonCompleteScreen: React.FC<SimpleLessonCompleteScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { lessonTitle, xpEarned, correctAnswers, totalQuestions } = route.params;
  
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

  return (
    <SafeAreaView className="flex-1 bg-blue-500">
      <View className="flex-1 items-center justify-center px-6">
        <View className="bg-yellow-400 w-32 h-32 rounded-full items-center justify-center mb-8">
          <Text style={{ fontSize: 64 }}>🏆</Text>
        </View>
        
        <Text className="text-white text-4xl font-bold text-center mb-4">
          Lesson Complete!
        </Text>
        
        <Text className="text-white text-xl text-center mb-8">
          {lessonTitle}
        </Text>
        
        <View className="bg-white/20 rounded-lg p-6 w-full mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-lg font-medium">XP Earned:</Text>
            <Text className="text-yellow-300 text-2xl font-bold">+{xpEarned}</Text>
          </View>
          
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-lg font-medium">Accuracy:</Text>
            <Text className="text-yellow-300 text-2xl font-bold">{accuracy}%</Text>
          </View>
          
          <View className="flex-row justify-between items-center">
            <Text className="text-white text-lg font-medium">Score:</Text>
            <Text className="text-yellow-300 text-2xl font-bold">
              {correctAnswers}/{totalQuestions}
            </Text>
          </View>
        </View>
        
        <Pressable
          onPress={() => navigation.navigate('Main')}
          className="bg-white py-4 px-8 rounded-lg w-full"
        >
          <Text className="text-blue-500 text-xl font-bold text-center">
            🚀 Continue Learning
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};
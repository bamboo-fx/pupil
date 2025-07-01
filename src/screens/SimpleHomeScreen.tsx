import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProgressStore } from '../state/progressStore';
import questionsData from '../data/questions.json';
import { Unit } from '../types';

interface SimpleHomeScreenProps {
  navigation: any;
}

export const SimpleHomeScreen: React.FC<SimpleHomeScreenProps> = ({ navigation }) => {
  const { completedLessons, totalXp, streak, hearts } = useProgressStore();
  const units = questionsData.units as Unit[];

  const isLessonUnlocked = (unitIndex: number, lessonIndex: number) => {
    if (unitIndex === 0 && lessonIndex === 0) return true;
    
    // Simple logic: previous lesson must be completed
    if (lessonIndex > 0) {
      const previousLesson = units[unitIndex].lessons[lessonIndex - 1];
      return completedLessons.includes(previousLesson.id);
    }
    
    // First lesson of unit: previous unit must have at least one completed lesson
    if (unitIndex > 0) {
      const previousUnit = units[unitIndex - 1];
      return previousUnit.lessons.some(lesson => completedLessons.includes(lesson.id));
    }
    
    return false;
  };

  return (
    <SafeAreaView className="flex-1 bg-green-500">
      {/* Header */}
      <View className="bg-green-600 px-4 py-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-xl font-bold">🧠 DSA Quest</Text>
          <View className="flex-row space-x-4">
            <View className="flex-row items-center bg-orange-500 rounded-full px-3 py-1">
              <Text className="text-white font-bold">🔥 {streak}</Text>
            </View>
            <View className="flex-row items-center bg-blue-500 rounded-full px-3 py-1">
              <Text className="text-white font-bold">💎 {totalXp}</Text>
            </View>
            <View className="flex-row items-center bg-pink-500 rounded-full px-3 py-1">
              <Text className="text-white font-bold">❤️ {hearts}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 bg-blue-100">
        <View className="p-4">
          <Text className="text-2xl font-bold text-center mb-6 text-gray-800">
            Choose Your Quest
          </Text>
          
          {units.map((unit, unitIndex) => (
            <View key={unit.id} className="bg-white rounded-lg mb-4 overflow-hidden">
              <View className="bg-green-500 p-4">
                <Text className="text-white text-xl font-bold">{unit.title}</Text>
                <Text className="text-white/80">{unit.description}</Text>
              </View>
              
              <View className="p-4">
                {unit.lessons.map((lesson, lessonIndex) => {
                  const isUnlocked = isLessonUnlocked(unitIndex, lessonIndex);
                  const isCompleted = completedLessons.includes(lesson.id);
                  
                  return (
                    <Pressable
                      key={lesson.id}
                      onPress={() => {
                        if (isUnlocked) {
                          navigation.navigate('Lesson', {
                            lessonId: lesson.id,
                            lesson: lesson
                          });
                        }
                      }}
                      className={`flex-row items-center p-3 rounded-lg mb-2 ${
                        isCompleted ? 'bg-green-100' :
                        isUnlocked ? 'bg-blue-50' : 'bg-gray-100'
                      }`}
                      disabled={!isUnlocked}
                    >
                      <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                        isCompleted ? 'bg-green-500' :
                        isUnlocked ? 'bg-blue-500' : 'bg-gray-400'
                      }`}>
                        <Text className="text-white text-lg">
                          {isCompleted ? '⭐' : isUnlocked ? '▶️' : '🔒'}
                        </Text>
                      </View>
                      
                      <View className="flex-1">
                        <Text className={`font-semibold ${
                          isUnlocked ? 'text-gray-800' : 'text-gray-400'
                        }`}>
                          {lesson.title}
                        </Text>
                        <Text className={`text-sm ${
                          isUnlocked ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {lesson.description}
                        </Text>
                      </View>
                      
                      {isUnlocked && !isCompleted && (
                        <View className="bg-green-500 px-3 py-1 rounded-full">
                          <Text className="text-white font-bold text-xs">START</Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
import React from 'react';
import { View, Text, ScrollView, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GameStatsHeader } from '../components/GameStatsHeader';
import { PathNode } from '../components/PathNode';
import { PathConnector } from '../components/PathConnector';
import { useProgressStore } from '../state/progressStore';
import questionsData from '../data/questions.json';
import { Unit, Lesson } from '../types';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { completedLessons } = useProgressStore();
  const units = questionsData.units as Unit[];

  // Flatten all lessons into a single path
  const allLessons: Array<{lesson: Lesson, unitTitle: string, unitIndex: number, lessonIndex: number}> = [];
  units.forEach((unit, unitIndex) => {
    unit.lessons.forEach((lesson, lessonIndex) => {
      allLessons.push({ lesson, unitTitle: unit.title, unitIndex, lessonIndex });
    });
    // Add boss battle at end of each unit (except last)
    if (unitIndex < units.length - 1) {
      allLessons.push({
        lesson: {
          id: `boss-${unit.id}`,
          title: `${unit.title} Boss`,
          description: `Master ${unit.title}`,
          questions: [],
          xpReward: 100
        },
        unitTitle: unit.title,
        unitIndex,
        lessonIndex: -1 // Boss battle
      });
    }
  });

  const isLessonUnlocked = (pathIndex: number) => {
    // All lessons are now unlocked - users can access any module
    return true;
  };

  const getCurrentLessonIndex = () => {
    for (let i = 0; i < allLessons.length; i++) {
      if (!completedLessons.includes(allLessons[i].lesson.id)) {
        return i;
      }
    }
    return allLessons.length - 1;
  };

  const currentLessonIndex = getCurrentLessonIndex();

  const getPathPosition = (index: number): 'left' | 'center' | 'right' => {
    const pattern = index % 6;
    if (pattern === 0 || pattern === 3) return 'center';
    if (pattern === 1 || pattern === 4) return 'right';
    return 'left';
  };

  const getConnectorDirection = (index: number) => {
    const currentPos = getPathPosition(index);
    const nextPos = getPathPosition(index + 1);
    
    if (currentPos === nextPos) return 'straight';
    if (currentPos === 'center' && nextPos === 'right') return 'curve-right';
    if (currentPos === 'center' && nextPos === 'left') return 'curve-left';
    if (currentPos === 'left' && nextPos === 'center') return 'curve-right';
    if (currentPos === 'right' && nextPos === 'center') return 'curve-left';
    return 'straight';
  };

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={['#87CEEB', '#98FB98', '#F0E68C']}
        className="flex-1"
      >
        <GameStatsHeader />
        
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingTop: 20,
            paddingBottom: 200,
            minHeight: '100%'
          }}
          style={{ flex: 1 }}
          nestedScrollEnabled={true}
        >
          {/* Game Path */}
          <View className="px-4">
            {allLessons.map((item, pathIndex) => {
              const isCompleted = completedLessons.includes(item.lesson.id);
              const isUnlocked = isLessonUnlocked(pathIndex);
              const isCurrent = pathIndex === currentLessonIndex && isUnlocked;
              const isBoss = item.lessonIndex === -1;
              
              return (
                <View key={`${item.lesson.id}-${pathIndex}`}>
                  <PathNode
                    isCompleted={isCompleted}
                    isUnlocked={isUnlocked}
                    isCurrent={isCurrent}
                    title={item.lesson.title}
                    position={getPathPosition(pathIndex)}
                    nodeType={isBoss ? 'boss' : pathIndex % 5 === 4 ? 'checkpoint' : 'lesson'}
                    onPress={() => {
                      if (!isBoss) {
                        navigation.navigate('Lesson', {
                          lessonId: item.lesson.id,
                          lesson: item.lesson
                        });
                      } else {
                        // Navigate to boss battle (special lesson with harder questions)
                        navigation.navigate('BossBattle', {
                          unitTitle: item.unitTitle,
                          unitIndex: item.unitIndex
                        });
                      }
                    }}
                  />
                  
                  {pathIndex < allLessons.length - 1 && (
                    <PathConnector
                      isCompleted={isCompleted}
                      direction={getConnectorDirection(pathIndex)}
                    />
                  )}
                </View>
              );
            })}
          </View>

          {/* Debug info */}
          <View className="items-center mt-8 mb-4">
            <Text className="text-gray-600 text-sm">
              Total lessons: {allLessons.length}
            </Text>
          </View>

          {/* Completion Message */}
          {completedLessons.length === allLessons.length && (
            <View className="items-center mt-12 mb-8">
              <LinearGradient
                colors={['#9333EA', '#7C3AED']}
                className="px-8 py-4 rounded-2xl"
              >
                <Text className="text-white text-2xl font-bold text-center">
                  🎉 Quest Complete! 🎉
                </Text>
                <Text className="text-white/90 text-center mt-2">
                  You've mastered all DSA concepts!
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Extra bottom spacing to ensure scrollability */}
          <View style={{ height: 150 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};
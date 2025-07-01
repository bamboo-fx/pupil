import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { DuolingoPathNode } from '../components/DuolingoPathNode';
import { SimplePath } from '../components/SimplePath';
import { useProgressStore } from '../state/progressStore';
import questionsData from '../data/questions.json';
import { Unit, Lesson } from '../types';

interface DuolingoHomeScreenProps {
  navigation: any;
}

const { width, height } = Dimensions.get('window');

export const DuolingoHomeScreen: React.FC<DuolingoHomeScreenProps> = ({ navigation }) => {
  const { completedLessons } = useProgressStore();
  const units = questionsData.units as Unit[];
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Flatten all lessons into a single path with positions
  const allLessons: Array<{
    lesson: Lesson;
    unitTitle: string;
    unitIndex: number;
    lessonIndex: number;
    position: { x: number; y: number };
    nodeType: 'lesson' | 'checkpoint' | 'boss';
  }> = [];

  let currentY = 150; // Start position
  const pathWidth = width - 80; // Leave margin
  const baseX = width / 2; // Center the path

  units.forEach((unit, unitIndex) => {
    unit.lessons.forEach((lesson, lessonIndex) => {
      // Create a winding path pattern similar to Duolingo
      const nodeIndex = allLessons.length;
      let xOffset = 0;
      
      // Pattern: center, right, left, center, right, left...
      const pattern = nodeIndex % 6;
      if (pattern === 1 || pattern === 4) xOffset = 80;  // Right
      else if (pattern === 2 || pattern === 5) xOffset = -80; // Left
      // else center (0)

      const position = {
        x: baseX + xOffset,
        y: currentY
      };

      const nodeType = lessonIndex === unit.lessons.length - 1 && unitIndex < units.length - 1 
        ? 'boss' 
        : (lessonIndex + 1) % 3 === 0 
        ? 'checkpoint' 
        : 'lesson';

      allLessons.push({
        lesson,
        unitTitle: unit.title,
        unitIndex,
        lessonIndex,
        position,
        nodeType
      });

      currentY += 140; // Increased space between nodes to prevent text overlap
    });
  });

  const isLessonUnlocked = (pathIndex: number) => {
    if (pathIndex === 0) return true;
    const previousItem = allLessons[pathIndex - 1];
    return completedLessons.includes(previousItem.lesson.id);
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

  // Auto-scroll to current lesson
  useEffect(() => {
    if (currentLessonIndex >= 0 && scrollViewRef.current) {
      const currentY = allLessons[currentLessonIndex]?.position.y || 0;
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, currentY - height / 2),
          animated: true
        });
      }, 100);
    }

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [currentLessonIndex]);

  return (
    <SafeAreaView className="flex-1 bg-blue-500">
      {/* Simple Header */}
      <View className="px-4 py-4 bg-blue-500">
        <Text className="text-white text-2xl font-bold text-center">🧠 DSA Quest</Text>
      </View>

      {/* Unit Header */}
      <View className="px-4 pb-4 bg-blue-500">
        <Text className="text-white text-xl font-bold">Unit 1</Text>
        <Text className="text-white/90 text-base">Data Structures & Algorithms</Text>
      </View>

      {/* Path Area */}
      <View className="flex-1 bg-white rounded-t-3xl">
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 200 }}
        >
          <Animated.View 
            style={{ 
              height: currentY + 100,
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                })
              }]
            }}
          >
            {/* Render path connections */}
            {allLessons.map((item, index) => {
              if (index === 0) return null;
              
              const prevItem = allLessons[index - 1];
              const isCompleted = completedLessons.includes(prevItem.lesson.id);
              const isActive = index <= currentLessonIndex + 1;
              
              return (
                <SimplePath
                  key={`connection-${index}`}
                  startPos={prevItem.position}
                  endPos={item.position}
                  isCompleted={isCompleted}
                  isActive={isActive}
                />
              );
            })}

            {/* Render lesson nodes */}
            {allLessons.map((item, pathIndex) => {
              const isCompleted = completedLessons.includes(item.lesson.id);
              const isUnlocked = isLessonUnlocked(pathIndex);
              const isCurrent = pathIndex === currentLessonIndex && isUnlocked;
              
              return (
                <DuolingoPathNode
                  key={item.lesson.id}
                  isCompleted={isCompleted}
                  isUnlocked={isUnlocked}
                  isCurrent={isCurrent}
                  title={item.lesson.title}
                  position={item.position}
                  nodeType={item.nodeType}
                  onPress={() => {
                    if (item.nodeType === 'boss') {
                      // Navigate to boss battle
                      navigation.navigate('BossBattle', {
                        unitTitle: item.unitTitle,
                        unitIndex: item.unitIndex
                      });
                    } else {
                      navigation.navigate('Lesson', {
                        lessonId: item.lesson.id,
                        lesson: item.lesson
                      });
                    }
                  }}
                />
              );
            })}
          </Animated.View>
        </ScrollView>

        {/* Floating mascot - DSA Owl equivalent */}
        <View className="absolute bottom-10 right-6">
          <View className="w-16 h-16 bg-blue-500 rounded-full items-center justify-center shadow-lg">
            <Text style={{ fontSize: 32 }}>🧠</Text>
          </View>
        </View>

        {/* Progress indicator */}
        <View className="absolute top-4 left-4 right-4">
          <View className="bg-white/90 rounded-full p-3">
            <View className="flex-row items-center">
              <View className="flex-1 bg-gray-200 rounded-full h-3">
                <View 
                  className="bg-blue-500 rounded-full h-3"
                  style={{
                    width: `${(completedLessons.length / allLessons.length) * 100}%`
                  }}
                />
              </View>
              <Text className="ml-3 text-gray-700 font-bold text-sm">
                {completedLessons.length}/{allLessons.length}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};
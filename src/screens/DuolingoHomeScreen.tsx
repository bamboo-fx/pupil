import React, { useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, Dimensions, Animated, PanResponder, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const swipeAnim = useRef(new Animated.Value(0)).current;

  const currentUnit = units[currentUnitIndex];

  // Handle unit navigation
  const handlePrevUnit = () => {
    if (currentUnitIndex > 0) {
      setIsSwipeActive(true);
      // Animate slide out to right
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentUnitIndex(currentUnitIndex - 1);
        slideAnim.setValue(-width);
        // Animate slide in from left
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setIsSwipeActive(false);
        });
      });
    }
  };

  const handleNextUnit = () => {
    if (currentUnitIndex < units.length - 1) {
      setIsSwipeActive(true);
      // Animate slide out to left
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentUnitIndex(currentUnitIndex + 1);
        slideAnim.setValue(width);
        // Animate slide in from right
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setIsSwipeActive(false);
        });
      });
    }
  };

  // Create pan responder for swipe gestures
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 15;
    },
    onPanResponderGrant: () => {
      setIsSwipeActive(true);
    },
    onPanResponderMove: (evt, gestureState) => {
      // Follow the gesture with animation
      swipeAnim.setValue(gestureState.dx);
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx > 30 && currentUnitIndex > 0) {
        // Swipe right - previous unit
        Animated.timing(swipeAnim, {
          toValue: width,
          duration: 150,
          useNativeDriver: true,
        }).start(() => {
          setCurrentUnitIndex(currentUnitIndex - 1);
          swipeAnim.setValue(-width);
          Animated.timing(swipeAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            setIsSwipeActive(false);
          });
        });
      } else if (gestureState.dx < -30 && currentUnitIndex < units.length - 1) {
        // Swipe left - next unit
        Animated.timing(swipeAnim, {
          toValue: -width,
          duration: 150,
          useNativeDriver: true,
        }).start(() => {
          setCurrentUnitIndex(currentUnitIndex + 1);
          swipeAnim.setValue(width);
          Animated.timing(swipeAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            setIsSwipeActive(false);
          });
        });
      } else {
        // Snap back to original position
        Animated.spring(swipeAnim, {
          toValue: 0,
          tension: 200,
          friction: 8,
          useNativeDriver: true,
        }).start(() => {
          setIsSwipeActive(false);
        });
      }
    },
  });

  // Create lesson path for current unit
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

  currentUnit.lessons.forEach((lesson, lessonIndex) => {
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

    const nodeType = lessonIndex === currentUnit.lessons.length - 1 && currentUnitIndex < units.length - 1 
      ? 'boss' 
      : (lessonIndex + 1) % 3 === 0 
      ? 'checkpoint' 
      : 'lesson';

    allLessons.push({
      lesson,
      unitTitle: currentUnit.title,
      unitIndex: currentUnitIndex,
      lessonIndex,
      position,
      nodeType
    });

    currentY += 140; // Increased space between nodes to prevent text overlap
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

  // Auto-scroll to current lesson when unit changes
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
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [currentUnitIndex, currentLessonIndex]);

  return (
    <View className="flex-1 bg-blue-500" {...panResponder.panHandlers}>
      <SafeAreaView className="flex-1">
        {/* Header with Unit Navigation */}
        <View className="px-4 py-3 bg-blue-500">
          {/* Unit Navigation */}
          <View className="flex-row items-center justify-between">
            <Pressable 
              className={`p-2 rounded-full ${currentUnitIndex > 0 ? 'bg-white/20' : 'bg-white/10'}`}
              onPress={handlePrevUnit}
              disabled={currentUnitIndex === 0}
            >
              <Ionicons 
                name="chevron-back" 
                size={24} 
                color={currentUnitIndex > 0 ? "white" : "rgba(255,255,255,0.5)"} 
              />
            </Pressable>
            
            <View className="flex-1 mx-4">
              <Text className="text-white text-lg font-bold text-center">
                Unit {currentUnitIndex + 1} of {units.length}
              </Text>
            </View>
            
            <Pressable 
              className={`p-2 rounded-full ${currentUnitIndex < units.length - 1 ? 'bg-white/20' : 'bg-white/10'}`}
              onPress={handleNextUnit}
              disabled={currentUnitIndex === units.length - 1}
            >
              <Ionicons 
                name="chevron-forward" 
                size={24} 
                color={currentUnitIndex < units.length - 1 ? "white" : "rgba(255,255,255,0.5)"} 
              />
            </Pressable>
          </View>
        </View>

        {/* Current Unit Header */}
        <Animated.View 
          className="px-4 pb-4 bg-blue-500"
          style={{
            transform: [{ 
              translateX: Animated.add(slideAnim, swipeAnim) 
            }]
          }}
        >
          <Text className="text-white text-xl font-bold">{currentUnit.title}</Text>
          <Text className="text-white/90 text-base">{currentUnit.description}</Text>
        </Animated.View>

        {/* Path Area */}
        <View className="flex-1 bg-white">
          <ScrollView
            ref={scrollViewRef}
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 200 }}
            scrollEnabled={!isSwipeActive} // Disable scroll during swipe
          >
            <Animated.View 
              style={{ 
                height: currentY + 100,
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    })
                  },
                  { 
                    translateX: Animated.add(slideAnim, swipeAnim)
                  }
                ]
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

          {/* Unit indicator dots */}
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
            <View className="flex-row space-x-2">
              {units.map((_, index) => (
                <Animated.View
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentUnitIndex ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                  style={{
                    transform: [{
                      scale: index === currentUnitIndex ? 1.2 : 1
                    }]
                  }}
                />
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};
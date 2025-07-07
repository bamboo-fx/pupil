import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import questionsData from '../data/questions.json';
import { Unit, Lesson } from '../types';

interface LessonCompleteScreenProps {
  navigation: any;
  route: {
    params: {
      lessonTitle: string;
      xpEarned: number;
      correctAnswers: number;
      totalQuestions: number;
      lessonId?: string;
      unitId?: string;
    };
  };
}

export const LessonCompleteScreen: React.FC<LessonCompleteScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { lessonTitle, xpEarned, correctAnswers, totalQuestions, lessonId, unitId } = route.params;
  const [bounceAnimation] = useState(new Animated.Value(0));
  const [scaleAnimation] = useState(new Animated.Value(0));
  
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

  // Find the next lesson in the unit
  const findNextLesson = () => {
    if (!lessonId || !unitId) return null;
    
    const units = questionsData.units as Unit[];
    const currentUnit = units.find(unit => unit.id === unitId);
    
    if (!currentUnit) return null;
    
    const currentLessonIndex = currentUnit.lessons.findIndex(lesson => lesson.id === lessonId);
    
    if (currentLessonIndex === -1 || currentLessonIndex === currentUnit.lessons.length - 1) {
      return null; // No next lesson in this unit
    }
    
    return currentUnit.lessons[currentLessonIndex + 1];
  };

  const nextLesson = findNextLesson();

  const handleContinue = () => {
    if (nextLesson) {
      navigation.navigate('Lesson', {
        lessonId: nextLesson.id,
        lesson: nextLesson
      });
    } else {
      navigation.navigate('Main');
    }
  };

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
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <View style={styles.innerContainer}>
            <Animated.View 
              style={[
                styles.animatedTrophy,
                {
                  transform: [
                    { 
                      scale: bounceAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      })
                    }
                  ]
                }
              ]}
            >
              <BlurView intensity={40} tint="dark" style={styles.trophyCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.06)']}
                  style={styles.trophyGradient}
                >
                  <View style={styles.trophyIconContainer}>
                    <MaterialIcons name="emoji-events" size={64} color="#FFD700" style={styles.trophyIcon} />
                  </View>
                  <Text style={styles.title}>Quest Complete!</Text>
                  <Text style={styles.lessonTitle}>{lessonTitle}</Text>
                </LinearGradient>
              </BlurView>
            </Animated.View>

            <Animated.View 
              style={[
                styles.animatedCard,
                { transform: [{ scale: scaleAnimation }] }
              ]}
            >
              <BlurView intensity={30} tint="dark" style={styles.rewardsCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.13)', 'rgba(255,255,255,0.07)']}
                  style={styles.rewardsGradient}
                >
                  <Text style={styles.rewardsTitle}>Rewards Earned</Text>
                  <View style={styles.rewardsList}>
                    <View style={styles.rewardRow}>
                      <View style={styles.rewardLabel}>
                        <MaterialIcons name="star" size={28} color="#FFD700" style={styles.rewardIcon} />
                        <Text style={styles.rewardText}>XP Points</Text>
                      </View>
                      <Text style={[styles.rewardValue, { color: '#3b82f6' }]}>+{xpEarned}</Text>
                    </View>
                    <View style={styles.rewardRow}>
                      <View style={styles.rewardLabel}>
                        <MaterialIcons name="track-changes" size={28} color="#22c55e" style={styles.rewardIcon} />
                        <Text style={styles.rewardText}>Accuracy</Text>
                      </View>
                      <Text style={[styles.rewardValue, { color: '#22c55e' }]}>{accuracy}%</Text>
                    </View>
                    <View style={styles.rewardRow}>
                      <View style={styles.rewardLabel}>
                        <MaterialIcons name="check-circle" size={28} color="#facc15" style={styles.rewardIcon} />
                        <Text style={styles.rewardText}>Correct Answers</Text>
                      </View>
                      <Text style={[styles.rewardValue, { color: '#facc15' }]}>{correctAnswers}/{totalQuestions}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </BlurView>
            </Animated.View>

            <Pressable
              onPress={handleContinue}
              style={styles.continueButtonWrapper}
            >
              <LinearGradient
                colors={["#10B981", "#059669"]}
                style={styles.continueButton}
              >
                <MaterialIcons 
                  name={nextLesson ? "arrow-forward" : "home"} 
                  size={24} 
                  color="white" 
                  style={{ marginRight: 8 }} 
                />
                <Text style={styles.continueButtonText}>
                  {nextLesson ? `Continue to ${nextLesson.title}` : 'Return Home'}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  animatedTrophy: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  trophyCard: {
    borderRadius: 32,
    overflow: 'hidden',
    width: '90%',
    maxWidth: 280,
    alignItems: 'center',
    marginBottom: 8,
  },
  trophyGradient: {
    padding: 32,
    alignItems: 'center',
  },
  trophyIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 48,
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  trophyIcon: {
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 6,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 6,
  },
  lessonTitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 2,
  },
  animatedCard: {
    width: '100%',
    marginBottom: 32,
  },
  rewardsCard: {
    borderRadius: 24,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  rewardsGradient: {
    padding: 28,
  },
  rewardsTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'left',
  },
  rewardsList: {
    gap: 18,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rewardLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardIcon: {
    marginRight: 10,
  },
  rewardText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  rewardValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  continueButtonWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    flexShrink: 1,
  },
});
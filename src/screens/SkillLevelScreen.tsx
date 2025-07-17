import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';

interface SkillLevelScreenProps {
  navigation: any;
  route: any;
}

const { width, height } = Dimensions.get('window');

export const SkillLevelScreen: React.FC<SkillLevelScreenProps> = ({ navigation, route }) => {
  const { ageRange } = route.params || {};
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const skillLevels = [
    {
      id: 'beginner',
      title: "I'm starting from scratch",
      description: 'New to coding • Learn step by step',
      icon: 'play-circle-outline' as const,
      color: '#22c55e',
    },
    {
      id: 'some-practice',
      title: "I've practiced a little",
      description: 'Some coding experience • Build on basics',
      icon: 'trending-up' as const,
      color: '#3b82f6',
    },
    {
      id: 'interview-prep',
      title: "I'm preparing for tech interviews",
      description: 'Ready for challenges • Ace those interviews',
      icon: 'business-center' as const,
      color: '#8b5cf6',
    }
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    if (selectedSkill) {
      navigation.navigate('SubscriptionInfo', { 
        ageRange,
        skillLevel: selectedSkill 
      });
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }}
            >
              {/* Header */}
              <View style={styles.header}>
                <Pressable onPress={handleBack} style={styles.backButton}>
                  <MaterialIcons name="arrow-back" size={24} color="white" />
                </Pressable>
                <Text style={styles.title}>What's your experience{'\n'}with DSA?</Text>
              </View>

              {/* Skill Level Options */}
              <View style={styles.optionsContainer}>
                {skillLevels.map((skill, index) => (
                  <Animated.View
                    key={skill.id}
                    style={{
                      transform: [{
                        translateY: slideAnim.interpolate({
                          inputRange: [0, 50],
                          outputRange: [0, 50 + (index * 20)],
                        })
                      }]
                    }}
                  >
                    <Pressable
                      onPress={() => setSelectedSkill(skill.id)}
                      style={[
                        styles.option,
                        selectedSkill === skill.id && styles.optionSelected,
                      ]}
                    >
                      <BlurView 
                        intensity={selectedSkill === skill.id ? 50 : 20} 
                        tint="dark" 
                        style={styles.optionBlur}
                      >
                        <LinearGradient
                          colors={
                            selectedSkill === skill.id
                              ? ['rgba(96,165,250,0.3)', 'rgba(59,130,246,0.2)', 'rgba(37,99,235,0.1)']
                              : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                          }
                          style={styles.optionGradient}
                        >
                          <View style={styles.optionContent}>
                            <MaterialIcons name={skill.icon} size={32} color={skill.color} />
                            <View style={styles.optionText}>
                              <Text style={styles.optionTitle}>{skill.title}</Text>
                              <Text style={styles.optionSubtitle}>{skill.description}</Text>
                            </View>
                            {selectedSkill === skill.id && (
                              <MaterialIcons name="check-circle" size={24} color="#60a5fa" />
                            )}
                          </View>
                        </LinearGradient>
                      </BlurView>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>

              {/* Continue Button */}
              <View style={styles.continueContainer}>
                <Pressable
                  onPress={handleContinue}
                  disabled={!selectedSkill}
                  style={[
                    styles.continueButton,
                    !selectedSkill && styles.continueButtonDisabled
                  ]}
                >
                  <BlurView intensity={40} tint="dark" style={styles.buttonBlur}>
                    <LinearGradient
                      colors={
                        selectedSkill
                          ? ['#22c55e', '#16a34a', '#15803d']
                          : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                      }
                      style={styles.buttonGradient}
                    >
                      <Text style={[
                        styles.buttonText,
                        !selectedSkill && styles.buttonTextDisabled
                      ]}>
                        Continue
                      </Text>
                      <MaterialIcons 
                        name="arrow-forward" 
                        size={20} 
                        color={selectedSkill ? 'white' : 'rgba(255,255,255,0.5)'} 
                      />
                    </LinearGradient>
                  </BlurView>
                </Pressable>
              </View>
            </Animated.View>
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
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },

  optionsContainer: {
    gap: 16,
    marginBottom: 30,
  },
  option: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionSelected: {
    transform: [{ scale: 1.02 }],
  },
  optionBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionGradient: {
    padding: 20,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  continueContainer: {
    alignItems: 'center',
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  buttonBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  buttonTextDisabled: {
    color: 'rgba(255,255,255,0.5)',
  },
}); 
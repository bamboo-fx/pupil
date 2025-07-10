import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';

interface AgeRangeScreenProps {
  navigation: any;
}

const { width, height } = Dimensions.get('window');

export const AgeRangeScreen: React.FC<AgeRangeScreenProps> = ({ navigation }) => {
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const ageRanges = [
    {
      id: 'middle-school',
      title: 'Middle School',
      description: 'Ages 11-14 • Learn coding fundamentals',
      icon: 'school' as const,
      color: '#22c55e',
    },
    {
      id: 'high-school',
      title: 'High School',
      description: 'Ages 15-18 • Prepare for college CS',
      icon: 'menu-book' as const,
      color: '#3b82f6',
    },
    {
      id: 'college',
      title: 'College / University',
      description: 'Ages 18-22 • Master interview skills',
      icon: 'library-books' as const,
      color: '#8b5cf6',
    },
    {
      id: 'graduate',
      title: 'Graduate / Career Switcher',
      description: 'Ages 22+ • Land your dream tech job',
      icon: 'work' as const,
      color: '#f59e0b',
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
    if (selectedAge) {
      navigation.navigate('SkillLevel', { ageRange: selectedAge });
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>What's your age group?</Text>
                <Text style={styles.subtitle}>
                  We'll customize your learning experience
                </Text>
              </View>

              {/* Age Options */}
              <View style={styles.optionsContainer}>
                {ageRanges.map((option, index) => (
                  <Animated.View
                    key={option.id}
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
                      onPress={() => setSelectedAge(option.id)}
                      style={[
                        styles.option,
                        selectedAge === option.id && styles.optionSelected,
                      ]}
                    >
                      <BlurView 
                        intensity={selectedAge === option.id ? 50 : 20} 
                        tint="dark" 
                        style={styles.optionBlur}
                      >
                        <LinearGradient
                          colors={
                            selectedAge === option.id
                              ? ['rgba(96,165,250,0.3)', 'rgba(59,130,246,0.2)', 'rgba(37,99,235,0.1)']
                              : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                          }
                          style={styles.optionGradient}
                        >
                          <View style={styles.optionContent}>
                            <MaterialIcons name={option.icon} size={32} color={option.color} />
                            <View style={styles.optionText}>
                              <Text style={styles.optionTitle}>{option.title}</Text>
                              <Text style={styles.optionSubtitle}>{option.description}</Text>
                            </View>
                            {selectedAge === option.id && (
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
                  disabled={!selectedAge}
                  style={[
                    styles.continueButton,
                    !selectedAge && styles.continueButtonDisabled
                  ]}
                >
                  <BlurView intensity={40} tint="dark" style={styles.buttonBlur}>
                    <LinearGradient
                      colors={
                        selectedAge
                          ? ['#22c55e', '#16a34a', '#15803d']
                          : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                      }
                      style={styles.buttonGradient}
                    >
                      <Text style={[
                        styles.buttonText,
                        !selectedAge && styles.buttonTextDisabled
                      ]}>
                        Continue
                      </Text>
                      <MaterialIcons 
                        name="arrow-forward" 
                        size={20} 
                        color={selectedAge ? 'white' : 'rgba(255,255,255,0.5)'} 
                      />
                    </LinearGradient>
                  </BlurView>
                </Pressable>
              </View>
            </Animated.View>
          </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20, // Add padding at the bottom for the continue button
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    flex: 1,
    gap: 16,
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
  optionIcon: {
    fontSize: 32,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  continueContainer: {
    marginTop: 20,
  },
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
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
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  buttonTextDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
  loginContainer: {
    marginTop: 20,
  },
  loginCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  loginGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  loginLink: {
    color: '#60a5fa',
    fontWeight: '600',
  },
}); 
import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';

interface SplashScreenProps {
  navigation: any;
}

const { width, height } = Dimensions.get('window');

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Main entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsing animation for CTA button
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    setTimeout(() => pulseAnimation.start(), 2000);

    return () => pulseAnimation.stop();
  }, []);

  const handleGetStarted = () => {
    navigation.navigate('AgeRange');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Hero Icon */}
            <View style={styles.heroIcon}>
              <BlurView intensity={30} tint="dark" style={styles.iconContainer}>
                <LinearGradient
                  colors={['rgba(96,165,250,0.3)', 'rgba(59,130,246,0.2)']}
                  style={styles.iconGradient}
                >
                  <Image source={require('../../logo.png')} style={styles.logoImage} />
                </LinearGradient>
              </BlurView>
            </View>

            {/* Main Content */}
            <View style={styles.textContainer}>
              <Text style={styles.headline}>
                Land your dream job with just{'\n'}
                <Text style={styles.highlightText}>15 minutes a day</Text>
              </Text>
              
              <Text style={styles.subheadline}>
                Master data structures and algorithms{'\n'}the fun way.
              </Text>

              {/* Features List */}
              <View style={styles.featuresContainer}>
                <View style={styles.featureItem}>
                  <MaterialIcons name="check-circle" size={20} color="#22c55e" />
                  <Text style={styles.featureText}>Interactive coding challenges</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons name="check-circle" size={20} color="#22c55e" />
                  <Text style={styles.featureText}>Real interview questions</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons name="check-circle" size={20} color="#22c55e" />
                  <Text style={styles.featureText}>Progress tracking & achievements</Text>
                </View>
              </View>
            </View>

            {/* CTA Button */}
            <Animated.View
              style={[
                styles.ctaContainer,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <Pressable
                onPress={handleGetStarted}
                style={styles.ctaButton}
              >
                <BlurView intensity={50} tint="dark" style={styles.buttonBlur}>
                  <LinearGradient
                    colors={['#22c55e', '#16a34a', '#15803d']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>Get Started</Text>
                    <MaterialIcons name="arrow-forward" size={24} color="white" />
                  </LinearGradient>
                </BlurView>
              </Pressable>
            </Animated.View>

            {/* Footer */}
            <Text style={styles.footerText}>
              Join thousands of developers who got hired at top tech companies
            </Text>


          </Animated.View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  heroIcon: {
    marginBottom: 40,
  },
  iconContainer: {
    borderRadius: 32,
    overflow: 'hidden',
  },
  iconGradient: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },

  headline: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 10,
  },
  highlightText: {
    color: '#22c55e',
  },
  subheadline: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '500',
    marginBottom: 30,
  },

  featuresContainer: {
    width: '100%',
    alignItems: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  featureText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },

  ctaContainer: {
    marginBottom: 24,
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
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
    paddingHorizontal: 48,
    gap: 12,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  footerText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 20,
  },

}); 
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../state/authStore';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const { setLoading } = useAuthStore();

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Finish splash after 2.5 seconds
    const timer = setTimeout(() => {
      setLoading(false);
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#667eea']}
      locations={[0, 0.5, 1]}
      className="flex-1"
    >
      <SafeAreaView className="flex-1 items-center justify-center">
        <Animated.View 
          className="items-center"
          style={{
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim }
            ]
          }}
        >
          {/* Logo */}
          <View className="w-32 h-32 bg-white/20 rounded-full items-center justify-center mb-8 border-4 border-white/30">
            <Text style={{ fontSize: 64 }}>🧠</Text>
          </View>
          
          {/* App Name */}
          <Text className="text-white text-4xl font-bold mb-4 text-center">
            DSA Quest
          </Text>
          
          {/* Tagline */}
          <Text className="text-white/90 text-lg text-center max-w-80 leading-6">
            Master Data Structures & Algorithms
          </Text>
          
          {/* Loading indicator */}
          <View className="mt-12">
            <View className="flex-row space-x-2">
              <Animated.View 
                className="w-3 h-3 bg-white/60 rounded-full"
                style={{
                  transform: [{
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    })
                  }]
                }}
              />
              <Animated.View 
                className="w-3 h-3 bg-white/60 rounded-full"
                style={{
                  transform: [{
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1.2, 0.8],
                    })
                  }]
                }}
              />
              <Animated.View 
                className="w-3 h-3 bg-white/60 rounded-full"
                style={{
                  transform: [{
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    })
                  }]
                }}
              />
            </View>
          </View>
        </Animated.View>
        
        {/* Version/Copyright */}
        <View className="absolute bottom-10">
          <Text className="text-white/60 text-sm">
            © 2024 DSA Quest - Learn. Practice. Master.
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};
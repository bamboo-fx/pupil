import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

interface SplashScreenProps {
  navigation: any;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Preload the GIF while showing splash screen
    const gifPreload = Image.resolveAssetSource(require('../../demo.gif'));
    
    // Main entrance animation - fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Auto-navigate to Welcome screen after 1.5 seconds (giving GIF time to load)
    const autoNavigateTimer = setTimeout(() => {
      navigation.navigate('Welcome');
    }, 1500);

    return () => {
      clearTimeout(autoNavigateTimer);
    };
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#f1f5f9', '#e2e8f0']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
              }
            ]}
          >
            {/* Logo and App Name */}
            <View style={styles.logoContainer}>
              <Image source={require('../../no-bkg.png')} style={styles.logoImage} />
              <Text style={styles.appName}>Pupil</Text>
            </View>
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
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
  },
}); 
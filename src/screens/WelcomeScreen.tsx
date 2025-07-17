import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface WelcomeScreenProps {
  navigation: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  useEffect(() => {
    // Preload the GIF for smooth display
    const gifPreload = Image.resolveAssetSource(require('../../demo.gif'));
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#f8fafc', '#f1f5f9', '#e2e8f0']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.upperArea}>
            <View style={styles.gifContainer}>
              <Image 
                source={require('../../demo.gif')}
                style={styles.gif}
                resizeMode="contain"
              />
            </View>
          </View>
          <View style={styles.bottomContent}>
            <Text style={styles.mainTitle}>Data structures made easy</Text>
            <Pressable
              style={styles.getStartedButton}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </Pressable>
            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <Pressable onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signInLink}>Sign In</Text>
              </Pressable>
            </View>
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
  upperArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gifContainer: {
    width: 215,
    height: 425,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 5,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    // Narrower container with rounded corners, centers the GIF
  },
  gif: {
    width: 240,
    height: 420,
    borderRadius: 28,
    // Narrower GIF maintains aspect ratio within container
  },
  bottomContent: {
    paddingHorizontal: 24,
    paddingBottom: 50,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 40,
  },
  getStartedButton: {
    backgroundColor: '#000',
    paddingVertical: 20,
    paddingHorizontal: 80,
    borderRadius: 40,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  getStartedText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInText: {
    fontSize: 16,
    color: '#666',
  },
  signInLink: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
});
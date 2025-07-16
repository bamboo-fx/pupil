import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, Alert, ScrollView, StyleSheet, Animated, Dimensions, Platform, TextInput, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';

interface CreateAccountScreenProps {
  navigation: any;
  route: any;
}

const { width, height } = Dimensions.get('window');

export const CreateAccountScreen: React.FC<CreateAccountScreenProps> = ({ navigation, route }) => {
  const { ageRange } = route.params || {};
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const { signup } = useAuthStore();

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

  const handleCreateAccount = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    try {
      // Split the full name into first and last names
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Create the account with auth store
      const success = await signup(firstName, lastName, email, password);
      
      if (success) {
        Alert.alert('Success! 🎉', 'Welcome to Pupil! Your account has been created successfully.');
        // Navigation will be handled by the auth state change in useAuthStore
        // The user will automatically be taken to the main app
      } else {
        Alert.alert('Error', 'Failed to create account. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error('Account creation error:', error);
    } finally {
      setIsLoading(false);
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
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
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
                  <Pressable onPress={handleBack} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color="white" />
                  </Pressable>
                  <Text style={styles.title}>Create your account</Text>
                  <Text style={styles.subtitle}>
                    Join thousands of students learning with Pupil
                  </Text>
                </View>

                {/* Create Account Form */}
                <View style={styles.formContainer}>
                  <BlurView intensity={30} tint="dark" style={styles.formCard}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                      style={styles.formGradient}
                    >
                      {/* Name Input */}
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Full Name</Text>
                        <BlurView intensity={40} tint="dark" style={styles.inputContainer}>
                          <MaterialIcons name="person" size={20} color="rgba(255,255,255,0.7)" />
                          <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your full name"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            style={styles.textInput}
                            autoCapitalize="words"
                          />
                        </BlurView>
                      </View>

                      {/* Email Input */}
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <BlurView intensity={40} tint="dark" style={styles.inputContainer}>
                          <MaterialIcons name="email" size={20} color="rgba(255,255,255,0.7)" />
                          <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            style={styles.textInput}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                          />
                        </BlurView>
                      </View>

                      {/* Password Input */}
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <BlurView intensity={40} tint="dark" style={styles.inputContainer}>
                          <MaterialIcons name="lock" size={20} color="rgba(255,255,255,0.7)" />
                          <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Create a password"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            style={styles.textInput}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                          />
                          <Pressable onPress={() => setShowPassword(!showPassword)}>
                            <MaterialIcons 
                              name={showPassword ? "visibility" : "visibility-off"} 
                              size={20} 
                              color="rgba(255,255,255,0.6)" 
                            />
                          </Pressable>
                        </BlurView>
                      </View>

                      {/* Confirm Password Input */}
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Confirm Password</Text>
                        <BlurView intensity={40} tint="dark" style={styles.inputContainer}>
                          <MaterialIcons name="lock" size={20} color="rgba(255,255,255,0.7)" />
                          <TextInput
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm your password"
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            style={styles.textInput}
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                          />
                          <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <MaterialIcons 
                              name={showConfirmPassword ? "visibility" : "visibility-off"} 
                              size={20} 
                              color="rgba(255,255,255,0.6)" 
                            />
                          </Pressable>
                        </BlurView>
                      </View>

                      {/* Create Account Button */}
                      <Pressable
                        onPress={handleCreateAccount}
                        disabled={isLoading}
                        style={[styles.createButton, isLoading && styles.createButtonDisabled]}
                      >
                        <BlurView intensity={50} tint="dark" style={styles.buttonBlur}>
                          <LinearGradient
                            colors={['#60a5fa', '#3b82f6', '#2563eb']}
                            style={styles.buttonGradient}
                          >
                            <Text style={styles.buttonText}>
                              {isLoading ? 'Creating Account...' : 'Create Account'}
                            </Text>
                            {!isLoading && (
                              <MaterialIcons name="arrow-forward" size={20} color="white" />
                            )}
                          </LinearGradient>
                        </BlurView>
                      </Pressable>

                      {/* Terms */}
                      <View style={styles.termsContainer}>
                        <Text style={styles.termsText}>By creating an account, you agree to our</Text>
                        <View style={styles.termsLinksRow}>
                          <Pressable onPress={() => navigation.navigate('TermsOfUse')}>
                            <Text style={styles.termsLink}>Terms of Service</Text>
                          </Pressable>
                          <Text style={styles.termsText}> and </Text>
                          <Pressable onPress={() => navigation.navigate('PrivacyPolicy')}>
                            <Text style={styles.termsLink}>Privacy Policy</Text>
                          </Pressable>
                        </View>
                      </View>
                    </LinearGradient>
                  </BlurView>
                </View>
                
                {/* Login Link */}
                <View style={styles.loginContainer}>
                  <BlurView intensity={20} tint="dark" style={styles.loginCard}>
                    <LinearGradient
                      colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                      style={styles.loginGradient}
                    >
                      <Text style={styles.loginText}>
                        Already have an account?{' '}
                        <Text 
                          style={styles.loginLink}
                          onPress={() => navigation.navigate('Login')}
                        >
                          Sign in
                        </Text>
                      </Text>
                    </LinearGradient>
                  </BlurView>
                </View>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: 20,
  },
  formCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  formGradient: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
  },
  createButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  createButtonDisabled: {
    opacity: 0.6,
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
  termsText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 16,
  },
  termsContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  termsLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  termsLink: {
    fontSize: 12,
    color: '#60a5fa',
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontWeight: '600',
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
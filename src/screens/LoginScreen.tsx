import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        // Navigation will be handled by the auth state change
      } else {
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            {/* Header */}

            {/* Login Form */}
            <View style={styles.formContainer}>
              <BlurView intensity={30} tint="dark" style={styles.formCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  style={styles.formGradient}
                >
                  <Text style={styles.formTitle}>Sign In</Text>
                  
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
                        placeholder="Enter your password"
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

                  {/* Login Button */}
                  <Pressable
                    onPress={handleLogin}
                    disabled={isLoading}
                    style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                  >
                    <BlurView intensity={50} tint="dark" style={styles.buttonBlur}>
                      <LinearGradient
                        colors={['#60a5fa', '#3b82f6', '#2563eb']}
                        style={styles.buttonGradient}
                      >
                        <Text style={styles.buttonText}>
                          {isLoading ? 'Signing In...' : 'Sign In'}
                        </Text>
                      </LinearGradient>
                    </BlurView>
                  </Pressable>

                  {/* Forgot Password */}
                  <Pressable style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>
                      Forgot your password?
                    </Text>
                  </Pressable>
                </LinearGradient>
              </BlurView>
            </View>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <BlurView intensity={20} tint="dark" style={styles.signupCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
                  style={styles.signupGradient}
                >
                  <Text style={styles.signupText}>Don't have an account? </Text>
                  <Pressable onPress={() => navigation.navigate('Signup')}>
                    <Text style={styles.signupLink}>Sign Up</Text>
                  </Pressable>
                </LinearGradient>
              </BlurView>
            </View>
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
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  formCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  formGradient: {
    padding: 32,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: 'white',
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  buttonBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.3)',
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  forgotPassword: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  signupContainer: {
    paddingBottom: 40,
  },
  signupCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  signupGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  signupText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  signupLink: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#60a5fa',
  },
});
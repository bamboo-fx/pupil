import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';

interface SignupScreenProps {
  navigation: any;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuthStore();

  const handleSignup = async () => {
    if (!name || !email || !password) {
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

    setIsLoading(true);
    
    try {
      // Split the full name into first and last names
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Create the account first
      const success = await signup(firstName, lastName, email, password);
      
      if (success) {
        // Account created successfully, navigation will be handled by the root navigator
        // which will check subscription status and show paywall if needed
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
              {/* Signup Form */}
              <View style={styles.formContainer}>
                <BlurView intensity={30} tint="dark" style={styles.formCard}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={styles.formGradient}
                  >
                    <Text style={styles.formTitle}>Create Account</Text>
                    
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



                    {/* Signup Button */}
                    <Pressable
                      onPress={handleSignup}
                      style={styles.signupButton}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <BlurView intensity={50} tint="dark" style={styles.buttonBlur}>
                          <LinearGradient
                            colors={['#60a5fa', '#3b82f6', '#2563eb']}
                            style={styles.buttonGradient}
                          >
                            <Text style={styles.buttonText}>
                              Signup
                            </Text>
                          </LinearGradient>
                        </BlurView>
                      )}
                    </Pressable>

                    {/* Terms */}
                    <View style={styles.termsLinksContainer}>
                      <Text style={styles.termsText}>By creating an account, you agree to our </Text>
                      <Pressable onPress={() => Linking.openURL('https://www.trypupil.com/terms')}>
                        <Text style={styles.termsLink}>Terms of Service</Text>
                      </Pressable>
                      <Text style={styles.termsText}> and </Text>
                      <Pressable onPress={() => Linking.openURL('https://www.trypupil.com/privacy')}>
                        <Text style={styles.termsLink}>Privacy Policy</Text>
                      </Pressable>
                    </View>
                  </LinearGradient>
                </BlurView>
              </View>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <BlurView intensity={20} tint="dark" style={styles.loginCard}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
                    style={styles.loginGradient}
                  >
                    <Text style={styles.loginText}>Already have an account? </Text>
                    <Pressable onPress={() => navigation.navigate('Login')}>
                      <Text style={styles.loginLink}>Sign In</Text>
                    </Pressable>
                  </LinearGradient>
                </BlurView>
              </View>
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
    paddingHorizontal: 24,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  welcomeTitle: {
    fontSize: 28,
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
    marginTop: 24,
    marginBottom: 24,
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
  signupButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  signupButtonDisabled: {
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
  termsText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 16,
  },
  termsLinksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  termsLink: {
    fontSize: 12,
    color: 'rgba(96,165,250,0.8)',
    textDecorationLine: 'underline',
    lineHeight: 16,
  },
  loginContainer: {
    marginTop: 8,
  },
  loginCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  loginGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  loginText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  loginLink: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#60a5fa',
  },
});
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';

interface SignupScreenProps {
  navigation: any;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuthStore();

  const handleSignup = async () => {
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
      const success = await signup(name, email, password);
      if (success) {
        // Navigation will be handled by the auth state change
      } else {
        Alert.alert('Error', 'Failed to create account');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="items-center pt-8 pb-6">
              <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-4 border-3 border-white/30">
                <Text style={{ fontSize: 40 }}>🧠</Text>
              </View>
              <Text className="text-white text-3xl font-bold mb-2">Join DSA Quest!</Text>
              <Text className="text-white/80 text-base text-center">
                Start your algorithm mastery journey
              </Text>
            </View>

            {/* Signup Form */}
            <View className="px-6 pb-6">
              <View className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
                <Text className="text-white text-xl font-bold mb-6 text-center">Create Account</Text>
                
                {/* Name Input */}
                <View className="mb-4">
                  <Text className="text-white/90 text-sm font-medium mb-2">Full Name</Text>
                  <View className="bg-white/20 rounded-xl p-4 flex-row items-center">
                    <Ionicons name="person" size={20} color="white" />
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter your full name"
                      placeholderTextColor="rgba(255,255,255,0.6)"
                      className="flex-1 ml-3 text-white text-base"
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Email Input */}
                <View className="mb-4">
                  <Text className="text-white/90 text-sm font-medium mb-2">Email</Text>
                  <View className="bg-white/20 rounded-xl p-4 flex-row items-center">
                    <Ionicons name="mail" size={20} color="white" />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email"
                      placeholderTextColor="rgba(255,255,255,0.6)"
                      className="flex-1 ml-3 text-white text-base"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View className="mb-4">
                  <Text className="text-white/90 text-sm font-medium mb-2">Password</Text>
                  <View className="bg-white/20 rounded-xl p-4 flex-row items-center">
                    <Ionicons name="lock-closed" size={20} color="white" />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Create a password"
                      placeholderTextColor="rgba(255,255,255,0.6)"
                      className="flex-1 ml-3 text-white text-base"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons 
                        name={showPassword ? "eye" : "eye-off"} 
                        size={20} 
                        color="rgba(255,255,255,0.7)" 
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Confirm Password Input */}
                <View className="mb-6">
                  <Text className="text-white/90 text-sm font-medium mb-2">Confirm Password</Text>
                  <View className="bg-white/20 rounded-xl p-4 flex-row items-center">
                    <Ionicons name="lock-closed" size={20} color="white" />
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm your password"
                      placeholderTextColor="rgba(255,255,255,0.6)"
                      className="flex-1 ml-3 text-white text-base"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Ionicons 
                        name={showConfirmPassword ? "eye" : "eye-off"} 
                        size={20} 
                        color="rgba(255,255,255,0.7)" 
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Signup Button */}
                <Pressable
                  onPress={handleSignup}
                  disabled={isLoading}
                  className={`rounded-xl p-4 mb-4 ${isLoading ? 'opacity-70' : ''}`}
                >
                  <LinearGradient
                    colors={['#4facfe', '#00f2fe']}
                    className="rounded-xl p-4"
                  >
                    <Text className="text-white text-center font-bold text-lg">
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Text>
                  </LinearGradient>
                </Pressable>

                {/* Terms */}
                <Text className="text-white/60 text-xs text-center">
                  By creating an account, you agree to our Terms of Service and Privacy Policy
                </Text>
              </View>

              {/* Login Link */}
              <View className="flex-row justify-center items-center mt-6">
                <Text className="text-white/80 text-base">Already have an account? </Text>
                <Pressable onPress={() => navigation.navigate('Login')}>
                  <Text className="text-white font-bold text-base underline">Sign In</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {/* Header */}
          <View className="items-center pt-12 pb-8">
            <View className="w-24 h-24 bg-white/20 rounded-full items-center justify-center mb-6 border-3 border-white/30">
              <Text style={{ fontSize: 48 }}>🧠</Text>
            </View>
            <Text className="text-white text-3xl font-bold mb-2">Welcome Back!</Text>
            <Text className="text-white/80 text-base text-center">
              Continue your DSA learning journey
            </Text>
          </View>

          {/* Login Form */}
          <View className="flex-1 px-6">
            <View className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
              <Text className="text-white text-xl font-bold mb-6 text-center">Sign In</Text>
              
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
              <View className="mb-6">
                <Text className="text-white/90 text-sm font-medium mb-2">Password</Text>
                <View className="bg-white/20 rounded-xl p-4 flex-row items-center">
                  <Ionicons name="lock-closed" size={20} color="white" />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
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

              {/* Login Button */}
              <Pressable
                onPress={handleLogin}
                disabled={isLoading}
                className={`rounded-xl p-4 mb-4 ${isLoading ? 'opacity-70' : ''}`}
              >
                <LinearGradient
                  colors={['#4facfe', '#00f2fe']}
                  className="rounded-xl p-4"
                >
                  <Text className="text-white text-center font-bold text-lg">
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Text>
                </LinearGradient>
              </Pressable>

              {/* Forgot Password */}
              <Pressable className="mb-4">
                <Text className="text-white/80 text-center text-sm">
                  Forgot your password?
                </Text>
              </Pressable>
            </View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-white/80 text-base">Don't have an account? </Text>
              <Pressable onPress={() => navigation.navigate('Signup')}>
                <Text className="text-white font-bold text-base underline">Sign Up</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};
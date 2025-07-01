import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';

interface SimpleSignupScreenProps {
  navigation: any;
}

export const SimpleSignupScreen: React.FC<SimpleSignupScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      if (!success) {
        Alert.alert('Error', 'Failed to create account');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-500">
      <ScrollView className="flex-1 px-6">
        <View className="items-center pt-8 pb-6">
          <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-4">
            <Text style={{ fontSize: 40 }}>🧠</Text>
          </View>
          <Text className="text-white text-3xl font-bold mb-2">Join DSA Quest!</Text>
          <Text className="text-white/80 text-base text-center">
            Start your algorithm mastery journey
          </Text>
        </View>

        <View className="bg-white/10 rounded-2xl p-6">
          <Text className="text-white text-xl font-bold mb-6 text-center">Create Account</Text>
          
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
              />
            </View>
          </View>

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
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

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
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          <Pressable
            onPress={handleSignup}
            disabled={isLoading}
            className={`bg-blue-600 rounded-xl p-4 mb-4 ${isLoading ? 'opacity-70' : ''}`}
          >
            <Text className="text-white text-center font-bold text-lg">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </Pressable>
        </View>

        <View className="flex-row justify-center items-center mt-6 pb-6">
          <Text className="text-white/80 text-base">Already have an account? </Text>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text className="text-white font-bold text-base underline">Sign In</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
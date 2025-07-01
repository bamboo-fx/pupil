import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../state/authStore';

interface SimpleLoginScreenProps {
  navigation: any;
}

export const SimpleLoginScreen: React.FC<SimpleLoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (!success) {
        Alert.alert('Error', 'Invalid email or password');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-500">
      <View className="flex-1 px-6 justify-center">
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-white/20 rounded-full items-center justify-center mb-6">
            <Text style={{ fontSize: 48 }}>🧠</Text>
          </View>
          <Text className="text-white text-3xl font-bold mb-2">Welcome Back!</Text>
          <Text className="text-white/80 text-base text-center">
            Continue your DSA learning journey
          </Text>
        </View>

        <View className="bg-white/10 rounded-2xl p-6">
          <Text className="text-white text-xl font-bold mb-6 text-center">Sign In</Text>
          
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
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            className={`bg-blue-600 rounded-xl p-4 mb-4 ${isLoading ? 'opacity-70' : ''}`}
          >
            <Text className="text-white text-center font-bold text-lg">
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Text>
          </Pressable>
        </View>

        <View className="flex-row justify-center items-center mt-6">
          <Text className="text-white/80 text-base">Don't have an account? </Text>
          <Pressable onPress={() => navigation.navigate('Signup')}>
            <Text className="text-white font-bold text-base underline">Sign Up</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};
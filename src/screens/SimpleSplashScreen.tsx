import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../state/authStore';

interface SimpleSplashScreenProps {
  onFinish: () => void;
}

export const SimpleSplashScreen: React.FC<SimpleSplashScreenProps> = ({ onFinish }) => {
  const { setLoading } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-blue-500">
      <View className="flex-1 items-center justify-center">
        <View className="w-32 h-32 bg-white/20 rounded-full items-center justify-center mb-8">
          <Text style={{ fontSize: 64 }}>🧠</Text>
        </View>
        
        <Text className="text-white text-4xl font-bold mb-4 text-center">
          DSA Quest
        </Text>
        
        <Text className="text-white/90 text-lg text-center">
          Master Data Structures & Algorithms
        </Text>
        
        <View className="mt-8">
          <Text className="text-white/70 text-base">Loading...</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
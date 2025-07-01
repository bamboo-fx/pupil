import React from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface DuolingoPathNodeProps {
  isCompleted: boolean;
  isUnlocked: boolean;
  isCurrent: boolean;
  title: string;
  position: { x: number; y: number };
  onPress: () => void;
  nodeType: 'lesson' | 'checkpoint' | 'boss';
  progress?: number; // 0-1 for partially completed
}

const { width } = Dimensions.get('window');

export const DuolingoPathNode: React.FC<DuolingoPathNodeProps> = ({
  isCompleted,
  isUnlocked,
  isCurrent,
  title,
  position,
  onPress,
  nodeType,
  progress = 0
}) => {
  const getNodeSize = () => {
    switch (nodeType) {
      case 'boss': return 80;
      case 'checkpoint': return 75;
      default: return 65;
    }
  };

  const getNodeContent = () => {
    if (isCompleted) {
      return (
        <View 
          className="w-full h-full bg-blue-500 rounded-full items-center justify-center border-4 border-yellow-400" 
          style={{ 
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: 6 }, 
            shadowOpacity: 0.3, 
            shadowRadius: 10, 
            elevation: 8 
          }}
        >
          <Ionicons name="star" size={nodeType === 'boss' ? 36 : 32} color="#FFD700" />
          {/* Completion sparkle effect */}
          <View className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full items-center justify-center border-2 border-white">
            <Text style={{ fontSize: 14 }}>✨</Text>
          </View>
        </View>
      );
    }
    
    if (isUnlocked && isCurrent) {
      return (
        <View className="w-full h-full relative">
          <View 
            className="w-full h-full bg-blue-600 rounded-full items-center justify-center border-4 border-blue-300"
            style={{ 
              shadowColor: '#000', 
              shadowOffset: { width: 0, height: 6 }, 
              shadowOpacity: 0.25, 
              shadowRadius: 12, 
              elevation: 10 
            }}
          >
            {nodeType === 'boss' ? (
              <Text style={{ fontSize: 36 }}>👑</Text>
            ) : nodeType === 'checkpoint' ? (
              <Text style={{ fontSize: 32 }}>🏁</Text>
            ) : (
              <Ionicons name="play" size={28} color="white" />
            )}
          </View>
          
          {/* Pulsing effect for current lesson */}
          <View 
            className="absolute inset-0 bg-blue-300 rounded-full opacity-30"
            style={{
              transform: [{ scale: 1.1 }]
            }}
          />
        </View>
      );
    }
    
    if (isUnlocked) {
      return (
        <View 
          className="w-full h-full bg-blue-500 rounded-full items-center justify-center border-3 border-blue-400"
          style={{ 
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: 4 }, 
            shadowOpacity: 0.2, 
            shadowRadius: 8, 
            elevation: 6 
          }}
        >
          {nodeType === 'boss' ? (
            <Text style={{ fontSize: 32 }}>🐉</Text>
          ) : nodeType === 'checkpoint' ? (
            <Text style={{ fontSize: 28 }}>📍</Text>
          ) : (
            <Ionicons name="book" size={24} color="white" />
          )}
        </View>
      );
    }
    
    // Locked state
    return (
      <View 
        className="w-full h-full bg-gray-300 rounded-full items-center justify-center border-3 border-gray-400"
        style={{ 
          shadowColor: '#000', 
          shadowOffset: { width: 0, height: 2 }, 
          shadowOpacity: 0.15, 
          shadowRadius: 4, 
          elevation: 3 
        }}
      >
        <Ionicons name="lock-closed" size={nodeType === 'boss' ? 28 : 24} color="#6B7280" />
      </View>
    );
  };

  const nodeSize = getNodeSize();

  return (
    <View 
      className="absolute items-center"
      style={{
        left: position.x - nodeSize/2,
        top: position.y - nodeSize/2,
        width: nodeSize + 40, // Extra width for text
        marginLeft: -20, // Center the wider container
      }}
    >
      <Pressable
        onPress={isUnlocked ? onPress : undefined}
        disabled={!isUnlocked}
        className="items-center"
      >
        <View style={{ width: nodeSize, height: nodeSize }}>
          {getNodeContent()}
        </View>
        
        {/* START button for current lesson */}
        {isUnlocked && isCurrent && (
          <View 
            className="mt-2 bg-blue-600 px-4 py-1 rounded-full border-2 border-white"
            style={{ 
              shadowColor: '#000', 
              shadowOffset: { width: 0, height: 2 }, 
              shadowOpacity: 0.2, 
              shadowRadius: 4, 
              elevation: 4 
            }}
          >
            <Text className="text-white font-bold text-xs">START</Text>
          </View>
        )}
        
        {/* Node title - positioned below START button or node */}
        <View className="mt-2 px-2">
          <Text 
            className={`text-center text-sm font-bold ${
              isUnlocked ? 'text-gray-800' : 'text-gray-400'
            }`}
            numberOfLines={2}
            style={{ 
              lineHeight: 16,
              textAlign: 'center',
              maxWidth: nodeSize + 30
            }}
          >
            {title}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};
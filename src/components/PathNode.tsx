import React from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface PathNodeProps {
  isCompleted: boolean;
  isUnlocked: boolean;
  isCurrent: boolean;
  title: string;
  position: 'left' | 'center' | 'right';
  onPress: () => void;
  nodeType: 'lesson' | 'boss' | 'checkpoint';
}

const { width } = Dimensions.get('window');

export const PathNode: React.FC<PathNodeProps> = ({
  isCompleted,
  isUnlocked,
  isCurrent,
  title,
  position,
  onPress,
  nodeType
}) => {
  const getNodeSize = () => {
    switch (nodeType) {
      case 'boss': return { width: 80, height: 80 };
      case 'checkpoint': return { width: 70, height: 70 };
      default: return { width: 60, height: 60 };
    }
  };

  const getNodeColors = () => {
    if (isCompleted) {
      return nodeType === 'boss' 
        ? ['#FFD700', '#FFA500'] 
        : ['#10B981', '#059669'];
    }
    if (isUnlocked) {
      return isCurrent 
        ? ['#3B82F6', '#1D4ED8']
        : ['#6B7280', '#4B5563'];
    }
    return ['#D1D5DB', '#9CA3AF'];
  };

  const getPositionStyle = () => {
    const baseMargin = 20;
    switch (position) {
      case 'left': return { marginLeft: baseMargin };
      case 'right': return { marginRight: baseMargin, alignSelf: 'flex-end' };
      default: return { alignSelf: 'center' };
    }
  };

  const getNodeIcon = () => {
    if (isCompleted) {
      return nodeType === 'boss' ? '👑' : '⭐';
    }
    if (isUnlocked) {
      if (nodeType === 'boss') return '🐉';
      if (nodeType === 'checkpoint') return '🏁';
      return isCurrent ? '▶️' : '📚';
    }
    return '🔒';
  };

  const nodeSize = getNodeSize();
  const colors = getNodeColors();

  return (
    <View className="items-center mb-6" style={getPositionStyle()}>
      <Pressable
        onPress={isUnlocked ? onPress : undefined}
        disabled={!isUnlocked}
        className="items-center"
      >
        <LinearGradient
          colors={colors}
          style={{
            width: nodeSize.width,
            height: nodeSize.height,
            borderRadius: nodeSize.width / 2,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {isCompleted && (
            <View 
              style={{
                position: 'absolute',
                top: -5,
                right: -5,
                width: 24,
                height: 24,
                backgroundColor: '#FFD700',
                borderRadius: 12,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: 'white',
              }}
            >
              <Text style={{ fontSize: 12 }}>✨</Text>
            </View>
          )}
          
          <Text style={{ fontSize: 24 }}>{getNodeIcon()}</Text>
        </LinearGradient>
        
        {isCurrent && isUnlocked && !isCompleted && (
          <View className="absolute -bottom-2 bg-yellow-400 px-2 py-1 rounded-full">
            <Text className="text-yellow-800 font-bold text-xs">START</Text>
          </View>
        )}
      </Pressable>
      
      <Text 
        className={`text-center text-sm font-medium mt-2 max-w-20 ${
          isUnlocked ? 'text-gray-800' : 'text-gray-400'
        }`}
        numberOfLines={2}
      >
        {title}
      </Text>
      
      {nodeType === 'boss' && (
        <Text className="text-center text-xs text-purple-600 font-bold mt-1">
          BOSS BATTLE
        </Text>
      )}
    </View>
  );
};
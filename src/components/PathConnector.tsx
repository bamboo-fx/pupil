import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface PathConnectorProps {
  isCompleted: boolean;
  direction: 'straight' | 'curve-left' | 'curve-right';
}

export const PathConnector: React.FC<PathConnectorProps> = ({ 
  isCompleted, 
  direction 
}) => {
  const getConnectorStyle = () => {
    const baseStyle = {
      height: 40,
      width: 8,
      marginVertical: -10,
    };

    switch (direction) {
      case 'curve-left':
        return {
          ...baseStyle,
          transform: [{ rotate: '-15deg' }],
          marginLeft: 20,
        };
      case 'curve-right':
        return {
          ...baseStyle,
          transform: [{ rotate: '15deg' }],
          marginRight: 20,
        };
      default:
        return {
          ...baseStyle,
          alignSelf: 'center',
        };
    }
  };

  return (
    <View style={getConnectorStyle()}>
      <LinearGradient
        colors={isCompleted ? ['#10B981', '#059669'] : ['#D1D5DB', '#9CA3AF']}
        className="flex-1 rounded-full"
      />
      {isCompleted && (
        <View className="absolute inset-0 items-center justify-center">
          <View className="w-4 h-4 bg-yellow-400 rounded-full items-center justify-center">
            <Text style={{ fontSize: 8 }}>✨</Text>
          </View>
        </View>
      )}
    </View>
  );
};
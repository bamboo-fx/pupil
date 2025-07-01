import React from 'react';
import { View } from 'react-native';

interface SimplePathProps {
  startPos: { x: number; y: number };
  endPos: { x: number; y: number };
  isCompleted: boolean;
  isActive: boolean;
}

export const SimplePath: React.FC<SimplePathProps> = ({
  startPos,
  endPos,
  isCompleted,
  isActive
}) => {
  // Calculate angle and distance between points
  const dx = endPos.x - startPos.x;
  const dy = endPos.y - startPos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  const color = isCompleted ? '#4facfe' : isActive ? '#667eea' : '#D1D5DB';

  return (
    <View
      className="absolute"
      style={{
        left: startPos.x,
        top: startPos.y - 3,
        width: distance,
        height: 6,
        backgroundColor: color,
        borderRadius: 3,
        transform: [{ rotate: `${angle}deg` }],
        transformOrigin: 'left center',
      }}
    >
      {/* Add decorative dots for completed paths */}
      {isCompleted && (
        <View className="absolute inset-0 flex-row items-center justify-center">
          <View className="w-2 h-2 bg-yellow-400 rounded-full mx-1" />
          <View className="w-2 h-2 bg-yellow-400 rounded-full mx-1" />
          <View className="w-2 h-2 bg-yellow-400 rounded-full mx-1" />
        </View>
      )}
    </View>
  );
};
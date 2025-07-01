import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface PathConnectionProps {
  startPos: { x: number; y: number };
  endPos: { x: number; y: number };
  isCompleted: boolean;
  isActive: boolean;
}

export const PathConnection: React.FC<PathConnectionProps> = ({
  startPos,
  endPos,
  isCompleted,
  isActive
}) => {
  // Calculate the path between two points with a slight curve
  const midX = (startPos.x + endPos.x) / 2;
  const midY = (startPos.y + endPos.y) / 2;
  
  // Add some curvature based on the direction
  const dx = endPos.x - startPos.x;
  const dy = endPos.y - startPos.y;
  const offset = Math.abs(dx) > Math.abs(dy) ? dy * 0.3 : dx * 0.3;
  
  const controlX = midX + offset;
  const controlY = midY;

  const pathData = `M ${startPos.x} ${startPos.y} Q ${controlX} ${controlY} ${endPos.x} ${endPos.y}`;

  const strokeColor = isCompleted ? '#10B981' : isActive ? '#3B82F6' : '#D1D5DB';
  const strokeWidth = 6;

  return (
    <View className="absolute" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
      <Svg height="100%" width="100%" style={{ position: 'absolute' }}>
        <Path
          d={pathData}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        {/* Add dots along completed paths */}
        {isCompleted && (
          <Path
            d={pathData}
            stroke="#FFD700"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="4,8"
          />
        )}
      </Svg>
    </View>
  );
};
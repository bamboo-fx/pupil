import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface PerformanceComparisonQuestionProps {
  question: string;
  operations: Array<{
    name: string;
    complexity: string;
  }>;
  correctRanking: number[];
  userTask: string;
  explanation: string;
  onComplete: (correct: boolean, userRanking: number[]) => void;
  showExplanation: boolean;
  isCorrect: boolean | null;
}

export const PerformanceComparisonQuestion: React.FC<PerformanceComparisonQuestionProps> = ({
  question,
  operations,
  correctRanking,
  userTask,
  explanation,
  onComplete,
  showExplanation,
  isCorrect
}) => {
  const [userRanking, setUserRanking] = useState<number[]>([]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const handleItemPress = (index: number) => {
    if (showExplanation) return;
    
    if (draggedItem === null) {
      // Start dragging
      setDraggedItem(index);
    } else if (draggedItem === index) {
      // Cancel drag
      setDraggedItem(null);
    } else {
      // Place item
      const newRanking = [...userRanking];
      
      // Remove the dragged item from its current position
      const draggedIndex = newRanking.indexOf(draggedItem);
      if (draggedIndex > -1) {
        newRanking.splice(draggedIndex, 1);
      }
      
      // Insert at new position
      const targetIndex = newRanking.indexOf(index);
      if (targetIndex > -1) {
        newRanking.splice(targetIndex, 0, draggedItem);
      } else {
        newRanking.push(draggedItem);
      }
      
      setUserRanking(newRanking);
      setDraggedItem(null);
    }
  };

  const addToRanking = (index: number) => {
    if (showExplanation || userRanking.includes(index)) return;
    setUserRanking([...userRanking, index]);
  };

  const removeFromRanking = (index: number) => {
    if (showExplanation) return;
    setUserRanking(userRanking.filter(i => i !== index));
  };

  const moveUp = (rankIndex: number) => {
    if (showExplanation || rankIndex === 0) return;
    const newRanking = [...userRanking];
    [newRanking[rankIndex], newRanking[rankIndex - 1]] = [newRanking[rankIndex - 1], newRanking[rankIndex]];
    setUserRanking(newRanking);
  };

  const moveDown = (rankIndex: number) => {
    if (showExplanation || rankIndex === userRanking.length - 1) return;
    const newRanking = [...userRanking];
    [newRanking[rankIndex], newRanking[rankIndex + 1]] = [newRanking[rankIndex + 1], newRanking[rankIndex]];
    setUserRanking(newRanking);
  };

  const checkAnswer = () => {
    const correct = JSON.stringify(userRanking) === JSON.stringify(correctRanking);
    onComplete(correct, userRanking);
  };

  const canSubmit = userRanking.length === operations.length;

  const getItemStatus = (index: number) => {
    if (!showExplanation) {
      return draggedItem === index ? 'dragging' : 'default';
    }
    
    const userPosition = userRanking.indexOf(index);
    const correctPosition = correctRanking.indexOf(index);
    
    if (userPosition === correctPosition) return 'correct';
    if (userPosition !== -1) return 'incorrect';
    return 'default';
  };

  const getItemColors = (status: string) => {
    switch (status) {
      case 'dragging': return { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-800' };
      case 'correct': return { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800' };
      case 'incorrect': return { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-800' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800' };
    }
  };

  return (
    <View className="space-y-6">
      <Text className="text-xl font-bold text-gray-900 mb-4">
        {question}
      </Text>

      {/* Task Description */}
      <View className="bg-blue-50 p-4 rounded-xl border border-blue-200">
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="speed" size={20} color="#3B82F6" />
          <Text className="text-blue-800 font-semibold ml-2">Performance Task</Text>
        </View>
        <Text className="text-blue-700">{userTask}</Text>
      </View>

      {/* Available Operations */}
      <View className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <Text className="text-gray-800 font-semibold mb-3">Available Operations:</Text>
        <View className="space-y-2">
          {operations.map((operation, index) => {
            const isInRanking = userRanking.includes(index);
            const status = getItemStatus(index);
            const colors = getItemColors(status);
            
            return (
              <Pressable
                key={index}
                onPress={() => isInRanking ? removeFromRanking(index) : addToRanking(index)}
                disabled={showExplanation}
                className={`p-3 rounded-lg border-2 ${colors.bg} ${colors.border} ${
                  isInRanking ? 'opacity-50' : 'opacity-100'
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className={`font-medium ${colors.text}`}>
                      {operation.name}
                    </Text>
                    <Text className={`text-sm font-mono ${colors.text}`}>
                      {operation.complexity}
                    </Text>
                  </View>
                  {isInRanking && (
                    <MaterialIcons name="check" size={20} color="#22C55E" />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Ranking Area */}
      <View className="bg-white p-4 rounded-xl border border-gray-200">
        <Text className="text-gray-800 font-semibold mb-3">
          Your Ranking (Fastest to Slowest):
        </Text>
        {userRanking.length === 0 ? (
          <Text className="text-gray-500 text-center py-8">
            Select operations above to rank them
          </Text>
        ) : (
          <View className="space-y-2">
            {userRanking.map((operationIndex, rankIndex) => {
              const operation = operations[operationIndex];
              const status = getItemStatus(operationIndex);
              const colors = getItemColors(status);
              
              return (
                <View
                  key={`${operationIndex}-${rankIndex}`}
                  className={`p-3 rounded-lg border-2 ${colors.bg} ${colors.border}`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className={`w-8 h-8 rounded-full mr-3 items-center justify-center ${
                        status === 'correct' ? 'bg-green-500' : 
                        status === 'incorrect' ? 'bg-red-500' : 'bg-blue-500'
                      }`}>
                        <Text className="text-white font-bold text-sm">
                          {rankIndex + 1}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className={`font-medium ${colors.text}`}>
                          {operation.name}
                        </Text>
                        <Text className={`text-sm font-mono ${colors.text}`}>
                          {operation.complexity}
                        </Text>
                      </View>
                    </View>
                    
                    {!showExplanation && (
                      <View className="flex-row items-center space-x-2">
                        <Pressable
                          onPress={() => moveUp(rankIndex)}
                          disabled={rankIndex === 0}
                          className={`p-1 rounded ${
                            rankIndex === 0 ? 'bg-gray-200' : 'bg-blue-500'
                          }`}
                        >
                          <MaterialIcons 
                            name="keyboard-arrow-up" 
                            size={16} 
                            color={rankIndex === 0 ? "#9CA3AF" : "white"} 
                          />
                        </Pressable>
                        <Pressable
                          onPress={() => moveDown(rankIndex)}
                          disabled={rankIndex === userRanking.length - 1}
                          className={`p-1 rounded ${
                            rankIndex === userRanking.length - 1 ? 'bg-gray-200' : 'bg-blue-500'
                          }`}
                        >
                          <MaterialIcons 
                            name="keyboard-arrow-down" 
                            size={16} 
                            color={rankIndex === userRanking.length - 1 ? "#9CA3AF" : "white"} 
                          />
                        </Pressable>
                        <Pressable
                          onPress={() => removeFromRanking(operationIndex)}
                          className="p-1 rounded bg-red-500"
                        >
                          <MaterialIcons name="close" size={16} color="white" />
                        </Pressable>
                      </View>
                    )}
                    
                    {showExplanation && status === 'correct' && (
                      <MaterialIcons name="check-circle" size={20} color="#22C55E" />
                    )}
                    {showExplanation && status === 'incorrect' && (
                      <MaterialIcons name="cancel" size={20} color="#EF4444" />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Submit Button */}
      {!showExplanation && (
        <Pressable
          onPress={checkAnswer}
          disabled={!canSubmit}
          className={`py-3 px-4 rounded-xl ${
            canSubmit ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        >
          <Text className="text-white text-center font-semibold">
            Check Performance Ranking
          </Text>
        </Pressable>
      )}

      {/* Explanation */}
      {showExplanation && (
        <View className={`p-4 rounded-xl border-2 ${
          isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <View className="flex-row items-center mb-3">
            <MaterialIcons 
              name={isCorrect ? "check-circle" : "cancel"} 
              size={24} 
              color={isCorrect ? "#22C55E" : "#EF4444"} 
            />
            <Text className={`text-lg font-bold ml-2 ${
              isCorrect ? 'text-green-800' : 'text-red-800'
            }`}>
              {isCorrect ? 'Perfect Ranking!' : 'Review Performance'}
            </Text>
          </View>
          <Text className={`text-base leading-relaxed mb-4 ${
            isCorrect ? 'text-green-700' : 'text-red-700'
          }`}>
            {explanation}
          </Text>
          
          {!isCorrect && (
            <View className="space-y-2">
              <Text className="text-gray-700 font-medium">Correct ranking (fastest to slowest):</Text>
              {correctRanking.map((operationIndex, rankIndex) => (
                <View key={rankIndex} className="p-2 bg-white rounded-lg border border-gray-200">
                  <Text className="text-gray-700">
                    {rankIndex + 1}. {operations[operationIndex].name} - {operations[operationIndex].complexity}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}; 
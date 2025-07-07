import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface BuildDataStructureQuestionProps {
  question: string;
  task: string;
  constraints: Record<string, any>;
  targetStructure: any;
  tools: string[];
  explanation: string;
  onComplete: (correct: boolean, builtStructure: any) => void;
  showExplanation: boolean;
  isCorrect: boolean | null;
}

export const BuildDataStructureQuestion: React.FC<BuildDataStructureQuestionProps> = ({
  question,
  task,
  constraints,
  targetStructure,
  tools,
  explanation,
  onComplete,
  showExplanation,
  isCorrect
}) => {
  const [builtStructure, setBuiltStructure] = useState<number[][]>(
    Array(constraints.rows).fill(null).map(() => Array(constraints.cols).fill(0))
  );
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);

  const handleCellPress = (row: number, col: number) => {
    if (showExplanation) return;
    setSelectedCell({ row, col });
  };

  const handleInputValue = () => {
    if (!selectedCell || !inputValue.trim()) return;
    
    const value = parseInt(inputValue.trim());
    if (isNaN(value)) {
      Alert.alert('Invalid Input', 'Please enter a valid number');
      return;
    }
    
    const newStructure = [...builtStructure];
    newStructure[selectedCell.row][selectedCell.col] = value;
    setBuiltStructure(newStructure);
    setInputValue('');
    setSelectedCell(null);
  };

  const generateSequence = () => {
    if (showExplanation) return;
    
    const newStructure = [];
    let value = constraints.startValue || 1;
    
    for (let row = 0; row < constraints.rows; row++) {
      const rowData = [];
      for (let col = 0; col < constraints.cols; col++) {
        rowData.push(value);
        value++;
      }
      newStructure.push(rowData);
    }
    
    setBuiltStructure(newStructure);
  };

  const clearStructure = () => {
    if (showExplanation) return;
    setBuiltStructure(
      Array(constraints.rows).fill(null).map(() => Array(constraints.cols).fill(0))
    );
    setSelectedCell(null);
  };

  const checkAnswer = () => {
    const correct = JSON.stringify(builtStructure) === JSON.stringify(targetStructure);
    onComplete(correct, builtStructure);
  };

  const canSubmit = builtStructure.some(row => row.some(cell => cell !== 0));

  const getCellStatus = (row: number, col: number) => {
    if (!showExplanation) {
      return selectedCell?.row === row && selectedCell?.col === col ? 'selected' : 'default';
    }
    
    const userValue = builtStructure[row][col];
    const targetValue = targetStructure[row][col];
    
    if (userValue === targetValue) return 'correct';
    if (userValue !== 0) return 'incorrect';
    return 'empty';
  };

  const getCellColors = (status: string) => {
    switch (status) {
      case 'selected': return { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-800' };
      case 'correct': return { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800' };
      case 'incorrect': return { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-800' };
      case 'empty': return { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-500' };
      default: return { bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-800' };
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
          <MaterialIcons name="build" size={20} color="#3B82F6" />
          <Text className="text-blue-800 font-semibold ml-2">Build Task</Text>
        </View>
        <Text className="text-blue-700">{task}</Text>
      </View>

      {/* Constraints */}
      <View className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="rule" size={20} color="#F59E0B" />
          <Text className="text-yellow-800 font-semibold ml-2">Constraints</Text>
        </View>
        <View className="space-y-1">
          {Object.entries(constraints).map(([key, value]) => (
            <Text key={key} className="text-yellow-700">
              {key}: {value}
            </Text>
          ))}
        </View>
      </View>

      {/* Data Structure Grid */}
      <View className="bg-white p-4 rounded-xl border border-gray-200">
        <Text className="text-gray-800 font-semibold mb-3">
          {constraints.rows}×{constraints.cols} Matrix:
        </Text>
        
        <View className="items-center">
          {builtStructure.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row space-x-2 mb-2">
              {row.map((cell, colIndex) => {
                const status = getCellStatus(rowIndex, colIndex);
                const colors = getCellColors(status);
                
                return (
                  <Pressable
                    key={`${rowIndex}-${colIndex}`}
                    onPress={() => handleCellPress(rowIndex, colIndex)}
                    disabled={showExplanation}
                    className={`w-12 h-12 rounded-lg border-2 ${colors.bg} ${colors.border} items-center justify-center`}
                  >
                    <Text className={`font-bold ${colors.text}`}>
                      {cell || ''}
                    </Text>
                    {selectedCell?.row === rowIndex && selectedCell?.col === colIndex && (
                      <View className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      {/* Input Controls */}
      {!showExplanation && (
        <View className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <Text className="text-gray-800 font-semibold mb-3">Tools:</Text>
          
          {/* Manual Input */}
          {tools.includes('input') && (
            <View className="space-y-3">
              <Text className="text-gray-700 font-medium">Manual Input:</Text>
              <View className="flex-row space-x-2">
                <TextInput
                  value={inputValue}
                  onChangeText={setInputValue}
                  placeholder="Enter value"
                  className="flex-1 bg-white border border-gray-300 rounded-lg p-3"
                  keyboardType="numeric"
                />
                <Pressable
                  onPress={handleInputValue}
                  disabled={!selectedCell || !inputValue.trim()}
                  className={`px-4 py-3 rounded-lg ${
                    selectedCell && inputValue.trim() ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <Text className="text-white font-semibold">Set</Text>
                </Pressable>
              </View>
              {selectedCell && (
                <Text className="text-blue-600 text-sm">
                  Selected: Row {selectedCell.row + 1}, Col {selectedCell.col + 1}
                </Text>
              )}
            </View>
          )}

          {/* Tool Buttons */}
          <View className="flex-row flex-wrap gap-2 mt-4">
            {tools.includes('generate') && (
              <Pressable
                onPress={generateSequence}
                className="bg-green-500 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-semibold">Generate Sequence</Text>
              </Pressable>
            )}
            
            <Pressable
              onPress={clearStructure}
              className="bg-red-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Clear</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Progress Info */}
      <View className="bg-white p-4 rounded-xl border border-gray-200">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-700 font-medium">
            Filled Cells: {builtStructure.flat().filter(cell => cell !== 0).length}
          </Text>
          <Text className="text-gray-600 text-sm">
            Total Cells: {constraints.rows * constraints.cols}
          </Text>
        </View>
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
            Check Data Structure
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
              {isCorrect ? 'Perfect Structure!' : 'Review the Pattern'}
            </Text>
          </View>
          <Text className={`text-base leading-relaxed mb-4 ${
            isCorrect ? 'text-green-700' : 'text-red-700'
          }`}>
            {explanation}
          </Text>
          
          {!isCorrect && (
            <View className="space-y-3">
              <Text className="text-gray-700 font-medium">Expected structure:</Text>
              <View className="bg-white p-3 rounded-lg border border-gray-200">
                <View className="items-center">
                  {targetStructure.map((row: number[], rowIndex: number) => (
                    <View key={rowIndex} className="flex-row space-x-2 mb-2">
                      {row.map((cell: number, colIndex: number) => (
                        <View
                          key={`${rowIndex}-${colIndex}`}
                          className="w-8 h-8 rounded bg-green-100 border border-green-300 items-center justify-center"
                        >
                          <Text className="font-bold text-green-800 text-sm">
                            {cell}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}; 
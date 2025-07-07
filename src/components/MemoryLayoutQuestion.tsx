import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface MemoryLayoutQuestionProps {
  question: string;
  array: number[];
  visualizationData: {
    baseAddress: number;
    elementSize: number;
    type: string;
  };
  userTask: string;
  correctAddresses: number[];
  explanation: string;
  onComplete: (correct: boolean, selectedAddresses: number[]) => void;
  showExplanation: boolean;
  isCorrect: boolean | null;
}

export const MemoryLayoutQuestion: React.FC<MemoryLayoutQuestionProps> = ({
  question,
  array,
  visualizationData,
  userTask,
  correctAddresses,
  explanation,
  onComplete,
  showExplanation,
  isCorrect
}) => {
  const [selectedAddresses, setSelectedAddresses] = useState<number[]>([]);
  
  const { baseAddress, elementSize, type } = visualizationData;

  const handleAddressClick = (address: number) => {
    if (showExplanation) return;
    
    if (selectedAddresses.includes(address)) {
      setSelectedAddresses(selectedAddresses.filter(addr => addr !== address));
    } else {
      setSelectedAddresses([...selectedAddresses, address]);
    }
  };

  const checkAnswer = () => {
    const sortedSelected = [...selectedAddresses].sort((a, b) => a - b);
    const sortedCorrect = [...correctAddresses].sort((a, b) => a - b);
    
    const correct = JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect);
    onComplete(correct, selectedAddresses);
  };

  const canSubmit = selectedAddresses.length > 0;

  const getAddressStatus = (address: number) => {
    const isSelected = selectedAddresses.includes(address);
    const isCorrect = correctAddresses.includes(address);
    
    if (!showExplanation) {
      return isSelected ? 'selected' : 'default';
    }
    
    if (isCorrect && isSelected) return 'correct';
    if (isCorrect && !isSelected) return 'missed';
    if (!isCorrect && isSelected) return 'incorrect';
    return 'default';
  };

  const getAddressColors = (status: string) => {
    switch (status) {
      case 'selected': return { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-800' };
      case 'correct': return { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800' };
      case 'missed': return { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-800' };
      case 'incorrect': return { bg: 'bg-orange-100', border: 'border-orange-500', text: 'text-orange-800' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800' };
    }
  };

  // Generate memory addresses for visualization
  const generateMemoryAddresses = () => {
    const addresses = [];
    const totalMemoryRange = array.length * elementSize + 32; // Show some extra memory
    
    for (let i = 0; i < totalMemoryRange; i += elementSize) {
      addresses.push(baseAddress + i);
    }
    
    return addresses;
  };

  const memoryAddresses = generateMemoryAddresses();

  return (
    <View className="space-y-6">
      <Text className="text-xl font-bold text-gray-900 mb-4">
        {question}
      </Text>

      {/* Memory Layout Info */}
      <View className="bg-blue-50 p-4 rounded-xl border border-blue-200">
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="memory" size={20} color="#3B82F6" />
          <Text className="text-blue-800 font-semibold ml-2">Memory Layout Info</Text>
        </View>
        <View className="space-y-1">
          <Text className="text-blue-700">Type: {type}</Text>
          <Text className="text-blue-700">Base Address: {baseAddress}</Text>
          <Text className="text-blue-700">Element Size: {elementSize} bytes</Text>
          <Text className="text-blue-700">Array Length: {array.length}</Text>
        </View>
      </View>

      {/* User Task */}
      <View className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="assignment" size={20} color="#F59E0B" />
          <Text className="text-yellow-800 font-semibold ml-2">Your Task:</Text>
        </View>
        <Text className="text-yellow-700">{userTask}</Text>
      </View>

      {/* Array Visualization */}
      <View className="bg-white p-4 rounded-xl border border-gray-200">
        <Text className="text-gray-800 font-semibold mb-3">Array Elements:</Text>
        <View className="flex-row items-center justify-center space-x-2 mb-4">
          {array.map((value, index) => (
            <View
              key={index}
              className="w-12 h-12 rounded-lg bg-blue-100 border-2 border-blue-300 items-center justify-center"
            >
              <Text className="font-bold text-blue-800">{value}</Text>
            </View>
          ))}
        </View>
        <View className="flex-row items-center justify-center space-x-2">
          {array.map((_, index) => (
            <View key={index} className="w-12 text-center">
              <Text className="text-xs text-gray-500">[{index}]</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Memory Address Grid */}
      <View className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <Text className="text-gray-800 font-semibold mb-3">Memory Addresses:</Text>
        <Text className="text-gray-600 text-sm mb-4">
          Click on the memory addresses where array elements are stored
        </Text>
        
        <View className="grid grid-cols-4 gap-2">
          {memoryAddresses.map((address, index) => {
            const status = getAddressStatus(address);
            const colors = getAddressColors(status);
            const isArrayElement = index < array.length;
            
            return (
              <Pressable
                key={address}
                onPress={() => handleAddressClick(address)}
                disabled={showExplanation}
                className={`p-3 rounded-lg border-2 ${colors.bg} ${colors.border} min-w-[80px]`}
              >
                <View className="items-center">
                  <Text className={`text-xs font-mono ${colors.text}`}>
                    {address}
                  </Text>
                  {isArrayElement && (
                    <Text className={`text-xs font-medium ${colors.text} mt-1`}>
                      [{index}] = {array[index]}
                    </Text>
                  )}
                  {selectedAddresses.includes(address) && (
                    <MaterialIcons name="check" size={16} color="#22C55E" />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Address Calculation Help */}
      <View className="bg-green-50 p-4 rounded-xl border border-green-200">
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="calculate" size={20} color="#22C55E" />
          <Text className="text-green-800 font-semibold ml-2">Address Calculation</Text>
        </View>
        <Text className="text-green-700 text-sm">
          Address of element[i] = Base Address + (i × Element Size)
        </Text>
        <Text className="text-green-700 text-sm mt-1">
          Example: element[0] = {baseAddress} + (0 × {elementSize}) = {baseAddress}
        </Text>
      </View>

      {/* Selection Summary */}
      <View className="bg-white p-4 rounded-xl border border-gray-200">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-700 font-medium">
            Selected Addresses: {selectedAddresses.length}
          </Text>
          <Text className="text-gray-600 text-sm">
            {showExplanation ? `Expected: ${correctAddresses.length}` : 'Click addresses above'}
          </Text>
        </View>
        {selectedAddresses.length > 0 && (
          <View className="mt-2">
            <Text className="text-gray-600 text-sm">
              Selected: {selectedAddresses.sort((a, b) => a - b).join(', ')}
            </Text>
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
            Check Memory Layout
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
              {isCorrect ? 'Perfect Memory Understanding!' : 'Review Memory Layout'}
            </Text>
          </View>
          <Text className={`text-base leading-relaxed mb-4 ${
            isCorrect ? 'text-green-700' : 'text-red-700'
          }`}>
            {explanation}
          </Text>
          
          {!isCorrect && (
            <View className="space-y-2">
              <Text className="text-gray-700 font-medium">Correct memory addresses:</Text>
              {correctAddresses.map((address, index) => (
                <View key={index} className="p-2 bg-white rounded-lg border border-gray-200">
                  <Text className="text-gray-700">
                    Element[{index}] is stored at address {address}
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
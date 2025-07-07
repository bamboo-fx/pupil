import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface AlgorithmTraceQuestionProps {
  question: string;
  initialArray: number[];
  steps: Array<{
    step: number;
    array: number[];
    explanation: string;
  }>;
  userTask: string;
  explanation: string;
  onComplete: (correct: boolean, selectedSteps: number[]) => void;
  showExplanation: boolean;
  isCorrect: boolean | null;
}

export const AlgorithmTraceQuestion: React.FC<AlgorithmTraceQuestionProps> = ({
  question,
  initialArray,
  steps,
  userTask,
  explanation,
  onComplete,
  showExplanation,
  isCorrect
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSteps, setSelectedSteps] = useState<number[]>([]);
  const [userSelections, setUserSelections] = useState<Record<number, number[]>>({});

  const handleArrayStateSelect = (stepIndex: number, arrayState: number[]) => {
    if (showExplanation) return;
    
    const newSelections = { ...userSelections };
    newSelections[stepIndex] = arrayState;
    setUserSelections(newSelections);
  };

  const moveToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const moveToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const checkAnswer = () => {
    // Check if user correctly traced through all steps
    let allCorrect = true;
    for (let i = 0; i < steps.length; i++) {
      const userSelection = userSelections[i];
      const correctArray = steps[i].array;
      
      if (!userSelection || JSON.stringify(userSelection) !== JSON.stringify(correctArray)) {
        allCorrect = false;
        break;
      }
    }
    
    onComplete(allCorrect, Object.keys(userSelections).map(Number));
  };

  const canSubmit = Object.keys(userSelections).length === steps.length;

  const renderArrayVisualization = (array: number[], label: string, isSelected: boolean = false) => (
    <View className={`p-3 rounded-lg border-2 ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
    }`}>
      <Text className="text-sm font-medium text-gray-600 mb-2">{label}</Text>
      <View className="flex-row items-center justify-center space-x-2">
        {array.map((value, index) => (
          <View
            key={index}
            className={`w-8 h-8 rounded-lg items-center justify-center ${
              isSelected ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <Text className={`font-bold text-sm ${
              isSelected ? 'text-white' : 'text-gray-700'
            }`}>
              {value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View className="space-y-6">
      <Text className="text-xl font-bold text-gray-900 mb-4">
        {question}
      </Text>

      {/* Initial Array */}
      <View className="bg-blue-50 p-4 rounded-xl border border-blue-200">
        <Text className="text-blue-800 font-semibold mb-3">Initial Array:</Text>
        {renderArrayVisualization(initialArray, "Starting state")}
      </View>

      {/* User Task */}
      <View className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="assignment" size={20} color="#F59E0B" />
          <Text className="text-yellow-800 font-semibold ml-2">Your Task:</Text>
        </View>
        <Text className="text-yellow-700">{userTask}</Text>
      </View>

      {/* Step Navigation */}
      <View className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-gray-800 font-semibold">
            Step {currentStep + 1} of {steps.length}
          </Text>
          <View className="flex-row space-x-2">
            <Pressable
              onPress={moveToPreviousStep}
              disabled={currentStep === 0}
              className={`p-2 rounded-lg ${
                currentStep === 0 ? 'bg-gray-200' : 'bg-blue-500'
              }`}
            >
              <MaterialIcons 
                name="chevron-left" 
                size={20} 
                color={currentStep === 0 ? "#9CA3AF" : "white"} 
              />
            </Pressable>
            <Pressable
              onPress={moveToNextStep}
              disabled={currentStep === steps.length - 1}
              className={`p-2 rounded-lg ${
                currentStep === steps.length - 1 ? 'bg-gray-200' : 'bg-blue-500'
              }`}
            >
              <MaterialIcons 
                name="chevron-right" 
                size={20} 
                color={currentStep === steps.length - 1 ? "#9CA3AF" : "white"} 
              />
            </Pressable>
          </View>
        </View>

        {/* Current Step */}
        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-2">
            {steps[currentStep].explanation}
          </Text>
        </View>

        {/* Array State Selection */}
        <View className="space-y-3">
          <Text className="text-gray-700 font-medium">
            What should the array look like after this step?
          </Text>
          
          {/* Generate some plausible array states including the correct one */}
          {(() => {
            const correctArray = steps[currentStep].array;
            const options = [correctArray];
            
            // Add some incorrect options
            const incorrectOption1 = [...correctArray].reverse();
            const incorrectOption2 = [...correctArray].sort((a, b) => b - a);
            const incorrectOption3 = [...correctArray].map(x => x + 1);
            
            options.push(incorrectOption1, incorrectOption2, incorrectOption3);
            
            return options.slice(0, 3).map((option, index) => (
              <Pressable
                key={index}
                onPress={() => handleArrayStateSelect(currentStep, option)}
                disabled={showExplanation}
                className="w-full"
              >
                {renderArrayVisualization(
                  option, 
                  `Option ${index + 1}`,
                  JSON.stringify(userSelections[currentStep]) === JSON.stringify(option)
                )}
              </Pressable>
            ));
          })()}
        </View>
      </View>

      {/* Progress Indicator */}
      <View className="bg-white p-4 rounded-xl border border-gray-200">
        <Text className="text-gray-700 font-medium mb-3">Progress:</Text>
        <View className="flex-row items-center space-x-2">
          {steps.map((_, index) => (
            <View
              key={index}
              className={`w-8 h-8 rounded-full items-center justify-center ${
                userSelections[index] ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <Text className={`font-bold text-sm ${
                userSelections[index] ? 'text-white' : 'text-gray-600'
              }`}>
                {index + 1}
              </Text>
            </View>
          ))}
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
            Check Algorithm Trace
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
              {isCorrect ? 'Excellent Tracing!' : 'Review the Algorithm'}
            </Text>
          </View>
          <Text className={`text-base leading-relaxed ${
            isCorrect ? 'text-green-700' : 'text-red-700'
          }`}>
            {explanation}
          </Text>
          
          {!isCorrect && (
            <View className="mt-4 space-y-2">
              <Text className="text-gray-700 font-medium">Correct sequence:</Text>
              {steps.map((step, index) => (
                <View key={index} className="p-2 bg-white rounded-lg border border-gray-200">
                  <Text className="text-sm font-medium text-gray-600 mb-1">
                    Step {index + 1}: {step.explanation}
                  </Text>
                  {renderArrayVisualization(step.array, `Result`, false)}
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}; 
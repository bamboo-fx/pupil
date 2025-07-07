import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ComplexityAnalysisQuestionProps {
  question: string;
  code?: string;
  analysisSteps: Array<{
    step: string;
    complexity: string;
  }>;
  userTask: string;
  explanation: string;
  onComplete: (correct: boolean, userAnalysis: Record<number, string>) => void;
  showExplanation: boolean;
  isCorrect: boolean | null;
}

export const ComplexityAnalysisQuestion: React.FC<ComplexityAnalysisQuestionProps> = ({
  question,
  code,
  analysisSteps,
  userTask,
  explanation,
  onComplete,
  showExplanation,
  isCorrect
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnalysis, setUserAnalysis] = useState<Record<number, string>>({});

  const complexityOptions = [
    'O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(n³)', 'O(2ⁿ)', 'O(n!)'
  ];

  const handleComplexitySelect = (stepIndex: number, complexity: string) => {
    if (showExplanation) return;
    
    setUserAnalysis({
      ...userAnalysis,
      [stepIndex]: complexity
    });
  };

  const moveToNextStep = () => {
    if (currentStep < analysisSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const moveToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const checkAnswer = () => {
    let allCorrect = true;
    
    for (let i = 0; i < analysisSteps.length; i++) {
      const userComplexity = userAnalysis[i];
      const correctComplexity = analysisSteps[i].complexity;
      
      if (userComplexity !== correctComplexity) {
        allCorrect = false;
        break;
      }
    }
    
    onComplete(allCorrect, userAnalysis);
  };

  const canSubmit = Object.keys(userAnalysis).length === analysisSteps.length;

  const getStepStatus = (stepIndex: number) => {
    if (!showExplanation) {
      return userAnalysis[stepIndex] ? 'answered' : 'default';
    }
    
    const userComplexity = userAnalysis[stepIndex];
    const correctComplexity = analysisSteps[stepIndex].complexity;
    
    if (userComplexity === correctComplexity) return 'correct';
    if (userComplexity) return 'incorrect';
    return 'unanswered';
  };

  const getStepColors = (status: string) => {
    switch (status) {
      case 'answered': return { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-800' };
      case 'correct': return { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800' };
      case 'incorrect': return { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-800' };
      case 'unanswered': return { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-600' };
      default: return { bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-800' };
    }
  };

  return (
    <View className="space-y-6">
      <Text className="text-xl font-bold text-gray-900 mb-4">
        {question}
      </Text>

      {/* Code Display */}
      {code && (
        <View className="bg-gray-900 rounded-xl p-4 border border-gray-200">
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="code" size={20} color="#10B981" />
            <Text className="text-green-400 font-semibold ml-2">Code to Analyze:</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Text className="text-green-400 font-mono text-sm leading-relaxed">
              {code}
            </Text>
          </ScrollView>
        </View>
      )}

      {/* Task Description */}
      <View className="bg-blue-50 p-4 rounded-xl border border-blue-200">
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="analytics" size={20} color="#3B82F6" />
          <Text className="text-blue-800 font-semibold ml-2">Analysis Task</Text>
        </View>
        <Text className="text-blue-700">{userTask}</Text>
      </View>

      {/* Step Navigation */}
      <View className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-gray-800 font-semibold">
            Step {currentStep + 1} of {analysisSteps.length}
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
              disabled={currentStep === analysisSteps.length - 1}
              className={`p-2 rounded-lg ${
                currentStep === analysisSteps.length - 1 ? 'bg-gray-200' : 'bg-blue-500'
              }`}
            >
              <MaterialIcons 
                name="chevron-right" 
                size={20} 
                color={currentStep === analysisSteps.length - 1 ? "#9CA3AF" : "white"} 
              />
            </Pressable>
          </View>
        </View>

        {/* Current Step */}
        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-3">
            {analysisSteps[currentStep].step}
          </Text>
          
          <Text className="text-gray-600 text-sm mb-4">
            What is the time complexity of this step?
          </Text>
          
          {/* Complexity Options */}
          <View className="flex-row flex-wrap gap-2">
            {complexityOptions.map((complexity) => {
              const isSelected = userAnalysis[currentStep] === complexity;
              const isCorrect = showExplanation && analysisSteps[currentStep].complexity === complexity;
              const isIncorrect = showExplanation && isSelected && !isCorrect;
              
              return (
                <Pressable
                  key={complexity}
                  onPress={() => handleComplexitySelect(currentStep, complexity)}
                  disabled={showExplanation}
                  className={`px-4 py-2 rounded-lg border-2 ${
                    isCorrect 
                      ? 'bg-green-100 border-green-500' 
                      : isIncorrect 
                        ? 'bg-red-100 border-red-500'
                        : isSelected 
                          ? 'bg-blue-100 border-blue-500' 
                          : 'bg-white border-gray-300'
                  }`}
                >
                  <Text className={`font-mono font-semibold ${
                    isCorrect 
                      ? 'text-green-800' 
                      : isIncorrect 
                        ? 'text-red-800'
                        : isSelected 
                          ? 'text-blue-800' 
                          : 'text-gray-700'
                  }`}>
                    {complexity}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      {/* Progress Overview */}
      <View className="bg-white p-4 rounded-xl border border-gray-200">
        <Text className="text-gray-800 font-semibold mb-3">Analysis Progress:</Text>
        <View className="space-y-2">
          {analysisSteps.map((step, index) => {
            const status = getStepStatus(index);
            const colors = getStepColors(status);
            
            return (
              <View
                key={index}
                className={`p-3 rounded-lg border-2 ${colors.bg} ${colors.border}`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className={`font-medium ${colors.text}`}>
                      Step {index + 1}: {step.step}
                    </Text>
                    {userAnalysis[index] && (
                      <Text className={`text-sm font-mono ${colors.text}`}>
                        Your answer: {userAnalysis[index]}
                      </Text>
                    )}
                  </View>
                  
                  <View className="flex-row items-center space-x-2">
                    {status === 'correct' && (
                      <MaterialIcons name="check-circle" size={20} color="#22C55E" />
                    )}
                    {status === 'incorrect' && (
                      <MaterialIcons name="cancel" size={20} color="#EF4444" />
                    )}
                    {status === 'answered' && (
                      <MaterialIcons name="done" size={20} color="#3B82F6" />
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Big O Cheat Sheet */}
      <View className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="help" size={20} color="#F59E0B" />
          <Text className="text-yellow-800 font-semibold ml-2">Big O Cheat Sheet</Text>
        </View>
        <View className="grid grid-cols-2 gap-2">
          <Text className="text-yellow-700 text-sm">O(1) - Constant</Text>
          <Text className="text-yellow-700 text-sm">O(log n) - Logarithmic</Text>
          <Text className="text-yellow-700 text-sm">O(n) - Linear</Text>
          <Text className="text-yellow-700 text-sm">O(n log n) - Linearithmic</Text>
          <Text className="text-yellow-700 text-sm">O(n²) - Quadratic</Text>
          <Text className="text-yellow-700 text-sm">O(2ⁿ) - Exponential</Text>
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
            Check Analysis
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
              {isCorrect ? 'Excellent Analysis!' : 'Review the Steps'}
            </Text>
          </View>
          <Text className={`text-base leading-relaxed mb-4 ${
            isCorrect ? 'text-green-700' : 'text-red-700'
          }`}>
            {explanation}
          </Text>
          
          {!isCorrect && (
            <View className="space-y-3">
              <Text className="text-gray-700 font-medium">Correct analysis:</Text>
              {analysisSteps.map((step, index) => (
                <View key={index} className="p-3 bg-white rounded-lg border border-gray-200">
                  <Text className="text-gray-700 font-medium mb-1">
                    Step {index + 1}: {step.step}
                  </Text>
                  <Text className="text-green-700 font-mono">
                    Complexity: {step.complexity}
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
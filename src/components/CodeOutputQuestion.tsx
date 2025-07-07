import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface CodeOutputQuestionProps {
  question: string;
  code: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  onComplete: (correct: boolean, selectedAnswer: string) => void;
  showExplanation: boolean;
  isCorrect: boolean | null;
}

export const CodeOutputQuestion: React.FC<CodeOutputQuestionProps> = ({
  question,
  code,
  options,
  correctAnswer,
  explanation,
  onComplete,
  showExplanation,
  isCorrect
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  const handleAnswerSelect = (answer: string) => {
    if (showExplanation) return;
    setSelectedAnswer(answer);
  };

  const checkAnswer = () => {
    const correct = selectedAnswer === correctAnswer;
    onComplete(correct, selectedAnswer);
  };

  const canSubmit = selectedAnswer !== '';

  return (
    <View className="space-y-6">
      <Text className="text-xl font-bold text-gray-900 mb-4">
        {question}
      </Text>

      {/* Code Display */}
      <View className="bg-gray-900 rounded-xl p-4 border border-gray-200">
        <View className="flex-row items-center mb-3">
          <MaterialIcons name="code" size={20} color="#10B981" />
          <Text className="text-green-400 font-semibold ml-2">Code:</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Text className="text-green-400 font-mono text-sm leading-relaxed">
            {code}
          </Text>
        </ScrollView>
      </View>

      {/* Options */}
      <View className="space-y-3">
        <Text className="text-gray-700 font-semibold text-lg">What will this code output?</Text>
        {options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrectAnswer = showExplanation && option === correctAnswer;
          const isWrongSelection = showExplanation && isSelected && !isCorrect;
          
          return (
            <Pressable
              key={index}
              onPress={() => handleAnswerSelect(option)}
              disabled={showExplanation}
              className={`p-4 rounded-2xl border-2 ${
                isCorrectAnswer
                  ? 'bg-green-50 border-green-500'
                  : isWrongSelection
                  ? 'bg-red-50 border-red-500'
                  : isSelected
                  ? 'bg-blue-50 border-blue-500'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <View className="flex-row items-center">
                <View className={`w-8 h-8 rounded-full mr-4 items-center justify-center ${
                  isCorrectAnswer ? 'bg-green-500' :
                  isWrongSelection ? 'bg-red-500' :
                  isSelected ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  <Text className={`font-bold text-sm ${
                    isCorrectAnswer || isWrongSelection || isSelected ? 'text-white' : 'text-gray-600'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text className={`text-lg font-mono flex-1 ${
                  isCorrectAnswer ? 'text-green-800' :
                  isWrongSelection ? 'text-red-800' :
                  isSelected ? 'text-blue-800' : 'text-gray-800'
                }`}>
                  {option}
                </Text>
                {isCorrectAnswer && (
                  <MaterialIcons name="check-circle" size={24} color="#22C55E" />
                )}
                {isWrongSelection && (
                  <MaterialIcons name="cancel" size={24} color="#EF4444" />
                )}
              </View>
            </Pressable>
          );
        })}
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
            Check Output
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
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </Text>
          </View>
          <Text className={`text-base leading-relaxed ${
            isCorrect ? 'text-green-700' : 'text-red-700'
          }`}>
            {explanation}
          </Text>
          {!isCorrect && (
            <View className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
              <Text className="text-gray-700 font-medium">
                Correct answer: <Text className="font-mono">{correctAnswer}</Text>
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}; 
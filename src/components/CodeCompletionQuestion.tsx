import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface CodeCompletionQuestionProps {
  question: string;
  codeTemplate: string;
  blanks: Array<{
    position: string;
    acceptedAnswers: string[];
    explanation: string;
  }>;
  explanation: string;
  onComplete: (correct: boolean, userAnswers: Record<string, string>) => void;
  showExplanation: boolean;
  isCorrect: boolean | null;
  onAnswerChange?: (canSubmit: boolean, checkFunction: () => void) => void;
}

export const CodeCompletionQuestion: React.FC<CodeCompletionQuestionProps> = ({
  question,
  codeTemplate,
  blanks,
  explanation,
  onComplete,
  showExplanation,
  isCorrect,
  onAnswerChange
}) => {
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  const updateAnswer = (blankIndex: number, answer: string) => {
    if (showExplanation) return;
    const uniqueKey = `blank_${blankIndex}`;
    setUserAnswers(prev => ({
      ...prev,
      [uniqueKey]: answer
    }));
  };

  const checkAnswer = () => {
    let allCorrect = true;
    
    for (let i = 0; i < blanks.length; i++) {
      const uniqueKey = `blank_${i}`;
      const userAnswer = userAnswers[uniqueKey]?.trim().toLowerCase() || '';
      const isCorrect = blanks[i].acceptedAnswers.some(
        accepted => accepted.toLowerCase() === userAnswer
      );
      if (!isCorrect) {
        allCorrect = false;
        break;
      }
    }
    
    onComplete(allCorrect, userAnswers);
  };

  const canSubmit = blanks.every((_, index) => {
    const uniqueKey = `blank_${index}`;
    return userAnswers[uniqueKey] && userAnswers[uniqueKey].trim() !== '';
  });

  useEffect(() => {
    if (onAnswerChange && !showExplanation) {
      onAnswerChange(canSubmit, checkAnswer);
    }
  }, [userAnswers, canSubmit, showExplanation]);

  const renderCodeWithBlanks = () => {
    let code = codeTemplate;
    
    blanks.forEach((blank, index) => {
      const uniqueKey = `blank_${index}`;
      const userAnswer = userAnswers[uniqueKey] || '';
      const fillColor = showExplanation 
        ? (blanks[index].acceptedAnswers.some(accepted => 
            accepted.toLowerCase() === userAnswer.toLowerCase()) 
            ? 'text-green-400' : 'text-red-400')
        : 'text-yellow-400';
      
      const displayText = userAnswer || `___${index + 1}___`;
      
      const blankRegex = new RegExp(blank.position.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      code = code.replace(blankRegex, displayText);
    });
    
    return code;
  };

  return (
    <View className="space-y-6">
      {/* Instructions */}
      <View className="bg-blue-50 p-4 rounded-xl border border-blue-200">
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="code" size={20} color="#3B82F6" />
          <Text className="text-blue-800 font-semibold ml-2">Instructions</Text>
        </View>
        <Text className="text-blue-700">
          Fill in the blanks in the code below. Each blank is numbered for reference.
        </Text>
      </View>

      {/* Code Display with Live Updates */}
      <View className="bg-gray-900 p-4 rounded-xl">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ minWidth: 300 }}>
            <Text className="text-green-400 font-mono text-sm leading-6">
              {renderCodeWithBlanks().split('\n').map((line, lineIndex) => (
                <Text key={lineIndex} className="text-green-400 font-mono text-sm">
                  {line}
                  {'\n'}
                </Text>
              ))}
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* Input Fields */}
      <View className="space-y-4">
        <Text className="text-lg font-semibold text-gray-800">Fill in the blanks:</Text>
        {blanks.map((blank, index) => {
          const uniqueKey = `blank_${index}`;
          const userAnswer = userAnswers[uniqueKey] || '';
          const isCorrectAnswer = showExplanation && blanks[index].acceptedAnswers.some(
            accepted => accepted.toLowerCase() === userAnswer.toLowerCase()
          );
          
          return (
            <View key={index} className="space-y-2">
              <Text className="text-gray-700 font-medium">
                Blank {index + 1}:
              </Text>
              <TextInput
                value={userAnswer}
                onChangeText={(text) => updateAnswer(index, text)}
                placeholder={`Enter code for blank ${index + 1}`}
                className={`border-2 rounded-lg p-3 font-mono text-base ${
                  showExplanation
                    ? isCorrectAnswer
                      ? 'bg-green-50 border-green-300 text-green-800'
                      : 'bg-red-50 border-red-300 text-red-800'
                    : 'bg-blue-50 border-blue-300 text-blue-800'
                }`}
                editable={!showExplanation}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <View className="flex-row items-center mb-1">
                  <MaterialIcons name="lightbulb" size={16} color="#D97706" />
                  <Text className="text-yellow-800 font-medium ml-1">Hint:</Text>
                </View>
                <Text className="text-yellow-700 text-sm">
                  {blank.explanation}
                </Text>
              </View>
              {showExplanation && !isCorrectAnswer && (
                <View className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <Text className="text-green-800 font-medium mb-1">Correct answers:</Text>
                  <Text className="text-green-700 text-sm font-mono">
                    {blank.acceptedAnswers.join(', ')}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

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
        </View>
      )}
    </View>
  );
}; 
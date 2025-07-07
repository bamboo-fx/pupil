import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface InteractiveDebuggingQuestionProps {
  question: string;
  buggyCode: string;
  bugs: Array<{
    line: number;
    issue: string;
    explanation: string;
  }>;
  explanation: string;
  onComplete: (correct: boolean, foundBugs: number[]) => void;
  showExplanation: boolean;
  isCorrect: boolean | null;
}

export const InteractiveDebuggingQuestion: React.FC<InteractiveDebuggingQuestionProps> = ({
  question,
  buggyCode,
  bugs,
  explanation,
  onComplete,
  showExplanation,
  isCorrect
}) => {
  const [foundBugs, setFoundBugs] = useState<number[]>([]);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [userFixes, setUserFixes] = useState<Record<number, string>>({});

  const codeLines = buggyCode.split('\n');
  const bugLines = bugs.map(bug => bug.line);

  const handleLineClick = (lineNumber: number) => {
    if (showExplanation) return;
    
    if (foundBugs.includes(lineNumber)) {
      // Remove bug if already found
      setFoundBugs(foundBugs.filter(line => line !== lineNumber));
      const newFixes = { ...userFixes };
      delete newFixes[lineNumber];
      setUserFixes(newFixes);
    } else {
      // Add bug
      setFoundBugs([...foundBugs, lineNumber]);
    }
    setSelectedLine(lineNumber);
  };

  const handleFixInput = (lineNumber: number, fix: string) => {
    setUserFixes({
      ...userFixes,
      [lineNumber]: fix
    });
  };

  const checkAnswer = () => {
    // Check if user found all bugs
    const allBugsFound = bugLines.every(line => foundBugs.includes(line));
    const noBonusBugs = foundBugs.every(line => bugLines.includes(line));
    
    const correct = allBugsFound && noBonusBugs;
    onComplete(correct, foundBugs);
  };

  const canSubmit = foundBugs.length > 0;

  const getLineStatus = (lineNumber: number) => {
    const isUserSelected = foundBugs.includes(lineNumber);
    const isActualBug = bugLines.includes(lineNumber);
    
    if (!showExplanation) {
      return isUserSelected ? 'selected' : 'default';
    }
    
    if (isActualBug && isUserSelected) return 'correct';
    if (isActualBug && !isUserSelected) return 'missed';
    if (!isActualBug && isUserSelected) return 'incorrect';
    return 'default';
  };

  const getLineColors = (status: string) => {
    switch (status) {
      case 'selected': return { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-900' };
      case 'correct': return { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-900' };
      case 'missed': return { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-900' };
      case 'incorrect': return { bg: 'bg-orange-100', border: 'border-orange-500', text: 'text-orange-900' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800' };
    }
  };

  return (
    <View className="space-y-6">
      <Text className="text-xl font-bold text-gray-900 mb-4">
        {question}
      </Text>

      {/* Instructions */}
      <View className="bg-blue-50 p-4 rounded-xl border border-blue-200">
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="bug-report" size={20} color="#3B82F6" />
          <Text className="text-blue-800 font-semibold ml-2">Debugging Instructions</Text>
        </View>
        <Text className="text-blue-700">
          Click on lines where you think there are bugs. Found bugs will be highlighted.
        </Text>
      </View>

      {/* Code Display */}
      <View className="bg-gray-900 rounded-xl p-4 border border-gray-200">
        <View className="flex-row items-center mb-3">
          <MaterialIcons name="code" size={20} color="#EF4444" />
          <Text className="text-red-400 font-semibold ml-2">Buggy Code:</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="space-y-1">
            {codeLines.map((line, index) => {
              const lineNumber = index + 1;
              const status = getLineStatus(lineNumber);
              const colors = getLineColors(status);
              
              return (
                <Pressable
                  key={lineNumber}
                  onPress={() => handleLineClick(lineNumber)}
                  disabled={showExplanation}
                  className={`flex-row items-center p-2 rounded-lg ${colors.bg} ${colors.border} border-2`}
                >
                  <View className="w-8 mr-3">
                    <Text className="text-gray-400 font-mono text-sm text-right">
                      {lineNumber}
                    </Text>
                  </View>
                  <Text className={`font-mono text-sm ${colors.text} flex-1`}>
                    {line || ' '}
                  </Text>
                  {foundBugs.includes(lineNumber) && (
                    <MaterialIcons name="bug-report" size={16} color="#EF4444" />
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* Bug Fixes Input */}
      {foundBugs.length > 0 && !showExplanation && (
        <View className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
          <Text className="text-yellow-800 font-semibold mb-3">
            Describe the bugs you found:
          </Text>
          {foundBugs.map(lineNumber => (
            <View key={lineNumber} className="mb-3">
              <Text className="text-yellow-700 font-medium mb-1">
                Line {lineNumber}:
              </Text>
              <TextInput
                value={userFixes[lineNumber] || ''}
                onChangeText={(text) => handleFixInput(lineNumber, text)}
                placeholder="Describe what's wrong with this line..."
                className="bg-white border border-yellow-300 rounded-lg p-3 text-gray-800"
                multiline
              />
            </View>
          ))}
        </View>
      )}

      {/* Bug Counter */}
      <View className="bg-white p-4 rounded-xl border border-gray-200">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-700 font-medium">
            Bugs Found: {foundBugs.length}
          </Text>
          <Text className="text-gray-600 text-sm">
            {showExplanation ? `Total bugs: ${bugs.length}` : 'Click lines to mark bugs'}
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
            Check Debug Solution
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
              {isCorrect ? 'Great Debugging!' : 'Review the Bugs'}
            </Text>
          </View>
          <Text className={`text-base leading-relaxed mb-4 ${
            isCorrect ? 'text-green-700' : 'text-red-700'
          }`}>
            {explanation}
          </Text>
          
          {/* Show all bugs */}
          <View className="space-y-3">
            <Text className="text-gray-700 font-medium">All bugs in this code:</Text>
            {bugs.map((bug, index) => (
              <View key={index} className="p-3 bg-white rounded-lg border border-gray-200">
                <Text className="text-red-700 font-medium mb-1">
                  Line {bug.line}: {bug.issue}
                </Text>
                <Text className="text-gray-600 text-sm">
                  {bug.explanation}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}; 
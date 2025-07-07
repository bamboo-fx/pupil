import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useProgressStore } from '../state/progressStore';
import { Question, Lesson } from '../types';
import { checkAnswer } from '../utils/cn';
import { CodeCompletionQuestion } from '../components/CodeCompletionQuestion';
import questionsData from '../data/questions.json';

import InteractiveVisualizationQuestion from '../components/InteractiveVisualizationQuestion';
import { CodeOutputQuestion } from '../components/CodeOutputQuestion';
import { AlgorithmTraceQuestion } from '../components/AlgorithmTraceQuestion';
import { InteractiveDebuggingQuestion } from '../components/InteractiveDebuggingQuestion';
import { PerformanceComparisonQuestion } from '../components/PerformanceComparisonQuestion';
import { MemoryLayoutQuestion } from '../components/MemoryLayoutQuestion';
import { BuildDataStructureQuestion } from '../components/BuildDataStructureQuestion';
import { ComplexityAnalysisQuestion } from '../components/ComplexityAnalysisQuestion';

interface LessonScreenProps {
  navigation: any;
  route: {
    params: {
      lessonId: string;
      lesson: Lesson;
    };
  };
}

export const LessonScreen: React.FC<LessonScreenProps> = ({ navigation, route }) => {
  const { lessonId, lesson } = route.params;
  const { completeLesson, completeQuestion } = useProgressStore();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [fillInAnswer, setFillInAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [shakeAnimation] = useState(new Animated.Value(0));
  const [scaleAnimation] = useState(new Animated.Value(1));
  
  // New state for interactive components
  const [interactiveCanSubmit, setInteractiveCanSubmit] = useState(false);
  const [interactiveCheckFunction, setInteractiveCheckFunction] = useState<(() => void) | null>(null);

  // Find the unit ID for this lesson
  const findUnitId = () => {
    const units = questionsData.units;
    for (const unit of units) {
      if (unit.lessons.some(l => l.id === lessonId)) {
        return unit.id;
      }
    }
    return null;
  };

  // Determine XP for lesson completion
  const getLessonXp = () => {
    // Check if this is a test lesson (has "-test" in the ID)
    const isTestLesson = lessonId.includes('-test');
    return isTestLesson ? 35 : 20;
  };

  const currentQuestion = lesson.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === lesson.questions.length - 1;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const triggerSuccess = () => {
    Animated.sequence([
      Animated.timing(scaleAnimation, { toValue: 1.05, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnimation, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const handleAnswerSubmit = () => {
    // Handle traditional question types
    if (currentQuestion.type === 'mcq' || currentQuestion.type === 'fillInBlank') {
      const userAnswer = currentQuestion.type === 'mcq' ? selectedAnswer : fillInAnswer;
      
      const correctAnswerData = currentQuestion.type === 'mcq' 
        ? currentQuestion.correctAnswer 
        : currentQuestion.acceptedAnswers || currentQuestion.correctAnswer;
      
      console.log('Submitting answer:', {
        questionType: currentQuestion.type,
        userAnswer,
        correctAnswerData,
        question: currentQuestion.question
      });
      
      const correct = checkAnswer(userAnswer, correctAnswerData, currentQuestion.type);
      
      setIsCorrect(correct);
      setShowExplanation(true);
      
      if (correct) {
        completeQuestion(lesson.id, currentQuestion.id);
        setCorrectAnswers(prev => prev + 1);
        triggerSuccess();
      } else {
        triggerShake();
      }
      
      setQuestionsAnswered(prev => prev + 1);
    }
    // Handle interactive question types using their check function
    else if (interactiveCheckFunction) {
      interactiveCheckFunction();
    }
  };

  const handleInteractiveComplete = (correct: boolean, _additionalData?: any) => {
    setIsCorrect(correct);
    setShowExplanation(true);
    
    if (correct) {
      completeQuestion(lesson.id, currentQuestion.id);
      setCorrectAnswers(prev => prev + 1);
      triggerSuccess();
    } else {
      triggerShake();
    }
    
    setQuestionsAnswered(prev => prev + 1);
  };

  // Handler for interactive component answer changes
  const handleInteractiveAnswerChange = (canSubmit: boolean, checkFunction: () => void) => {
    setInteractiveCanSubmit(canSubmit);
    setInteractiveCheckFunction(() => checkFunction);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const passingScore = Math.ceil(lesson.questions.length * 0.6);
      if (correctAnswers >= passingScore) {
        const lessonXp = getLessonXp();
        completeLesson(lesson.id, lessonXp);
        navigation.navigate('LessonComplete', {
          lessonTitle: lesson.title,
          xpEarned: lessonXp,
          correctAnswers,
          totalQuestions: lesson.questions.length,
          lessonId: lessonId,
          unitId: findUnitId()
        });
      } else {
        Alert.alert(
          "Lesson Failed", 
          `You need at least ${passingScore} correct answers to pass. Try again!`,
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setFillInAnswer('');
      setShowExplanation(false);
      setIsCorrect(null);
      // Reset interactive component state
      setInteractiveCanSubmit(false);
      setInteractiveCheckFunction(null);
    }
  };

  // Updated canSubmit logic to handle all question types
  const canSubmit = () => {
    if (currentQuestion.type === 'mcq') {
      return selectedAnswer !== '';
    } else if (currentQuestion.type === 'fillInBlank') {
      return fillInAnswer.trim() !== '';
    } else {
      // For interactive components
      return interactiveCanSubmit;
    }
  };

  const shouldShowSubmitButton = () => {
    // Show submit button for all question types when explanation is not shown
    return !showExplanation;
  };

  const getDifficultyColor = (difficulty: string): [string, string] => {
    switch (difficulty) {
      case 'easy': return ['#22C55E', '#16A34A'];
      case 'medium': return ['#F97316', '#EA580C'];
      case 'hard': return ['#EF4444', '#DC2626'];
      default: return ['#6B7280', '#4B5563'];
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
      {/* Navigation Header */}
      <View className="flex-row items-center px-6 py-0">
        <Pressable 
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
        >
          <Ionicons name="chevron-back" size={20} color="#374151" />
        </Pressable>
        
        <View className="flex-1 mx-4">
          <View className="bg-gray-200 rounded-full h-2">
            <View 
              className="bg-blue-500 rounded-full h-2"
              style={{
                width: `${((currentQuestionIndex + 1) / lesson.questions.length) * 100}%`
              }}
            />
          </View>
        </View>
        
        <View className="bg-gray-100 px-3 py-1 rounded-full">
          <Text className="text-gray-700 font-semibold text-sm">
            {currentQuestionIndex + 1}/{lesson.questions.length}
          </Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        className="flex-1 px-6" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }} // Add padding to prevent content being hidden behind fixed button
      >
        {/* Question Card */}
        <Animated.View 
          className="mt-6"
          style={{
            transform: [
              { translateX: shakeAnimation },
              { scale: scaleAnimation }
            ]
          }}
        >
          <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            {/* Difficulty Badge */}
            <View className="flex-row items-center mb-6">
              <View className="flex-row items-center bg-gray-100 px-3 py-1 rounded-full">
                <View 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: getDifficultyColor(currentQuestion.difficulty)[0] }}
                />
                <Text className="text-gray-700 text-sm font-semibold capitalize">
                  {currentQuestion.difficulty}
                </Text>
              </View>
            </View>
            
            {/* Question Text */}
            <Text className="text-2xl font-bold text-gray-900 mb-8 leading-relaxed">
              {currentQuestion.question}
            </Text>

            {/* MCQ Options */}
            {currentQuestion.type === 'mcq' && currentQuestion.options && (
              <View className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectAnswer = showExplanation && option === currentQuestion.correctAnswer;
                  const isWrongSelection = showExplanation && isSelected && !isCorrect;
                  
                  return (
                    <Pressable
                      key={index}
                      onPress={() => !showExplanation && setSelectedAnswer(option)}
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
                        <Text className={`text-lg font-medium flex-1 ${
                          isCorrectAnswer ? 'text-green-800' :
                          isWrongSelection ? 'text-red-800' :
                          isSelected ? 'text-blue-800' : 'text-gray-800'
                        }`}>
                          {option}
                        </Text>
                        {isCorrectAnswer && (
                          <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center">
                            <Ionicons name="checkmark" size={16} color="white" />
                          </View>
                        )}
                        {isWrongSelection && (
                          <View className="w-6 h-6 bg-red-500 rounded-full items-center justify-center">
                            <Ionicons name="close" size={16} color="white" />
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {/* Fill in Blank */}
            {currentQuestion.type === 'fillInBlank' && (
              <View>
                <View className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200 focus:border-blue-500">
                  <TextInput
                    value={fillInAnswer}
                    onChangeText={setFillInAnswer}
                    placeholder="Type your answer here..."
                    className="text-lg font-medium text-gray-800"
                    editable={!showExplanation}
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                {showExplanation && (
                  <View className={`mt-4 p-4 rounded-2xl ${
                    isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
                  }`}>
                    <Text className={`text-lg font-semibold ${
                      isCorrect ? 'text-green-800' : 'text-red-800'
                    }`}>
                      Correct answer: {currentQuestion.acceptedAnswers ? currentQuestion.acceptedAnswers[0] : currentQuestion.correctAnswer}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Code Completion */}
            {currentQuestion.type === 'codeCompletion' && currentQuestion.codeTemplate && currentQuestion.blanks && (
              <CodeCompletionQuestion
                question={currentQuestion.question}
                codeTemplate={currentQuestion.codeTemplate}
                blanks={currentQuestion.blanks}
                explanation={currentQuestion.explanation}
                onComplete={handleInteractiveComplete}
                showExplanation={showExplanation}
                isCorrect={isCorrect}
                onAnswerChange={handleInteractiveAnswerChange}
              />
            )}

            {/* Interactive Visualization */}
            {currentQuestion.type === 'interactiveVisualization' && 
             currentQuestion.visualizationData && 
             currentQuestion.visualizationData.array && 
             currentQuestion.visualizationData.target !== undefined && 
             currentQuestion.visualizationData.type && 
             currentQuestion.correctSequence && (
              <InteractiveVisualizationQuestion
                question={currentQuestion.question}
                visualizationData={{
                  array: currentQuestion.visualizationData.array,
                  target: currentQuestion.visualizationData.target,
                  type: currentQuestion.visualizationData.type
                }}
                correctSequence={currentQuestion.correctSequence}
                explanation={currentQuestion.explanation}
                onComplete={handleInteractiveComplete}
              />
            )}

            {/* Code Output */}
            {currentQuestion.type === 'codeOutput' && currentQuestion.code && currentQuestion.options && currentQuestion.correctAnswer && (
              <CodeOutputQuestion
                question={currentQuestion.question}
                code={currentQuestion.code}
                options={currentQuestion.options}
                correctAnswer={currentQuestion.correctAnswer}
                explanation={currentQuestion.explanation}
                onComplete={handleInteractiveComplete}
                showExplanation={showExplanation}
                isCorrect={isCorrect}
              />
            )}

            {/* Algorithm Trace */}
            {currentQuestion.type === 'algorithmTrace' && currentQuestion.initialArray && currentQuestion.steps && currentQuestion.userTask && (
              <AlgorithmTraceQuestion
                question={currentQuestion.question}
                initialArray={currentQuestion.initialArray}
                steps={currentQuestion.steps}
                userTask={currentQuestion.userTask}
                explanation={currentQuestion.explanation}
                onComplete={handleInteractiveComplete}
                showExplanation={showExplanation}
                isCorrect={isCorrect}
              />
            )}

            {/* Interactive Debugging */}
            {currentQuestion.type === 'interactiveDebugging' && currentQuestion.buggyCode && currentQuestion.bugs && (
              <InteractiveDebuggingQuestion
                question={currentQuestion.question}
                buggyCode={currentQuestion.buggyCode}
                bugs={currentQuestion.bugs}
                explanation={currentQuestion.explanation}
                onComplete={handleInteractiveComplete}
                showExplanation={showExplanation}
                isCorrect={isCorrect}
              />
            )}

            {/* Performance Comparison */}
            {currentQuestion.type === 'performanceComparison' && currentQuestion.operations && currentQuestion.correctRanking && (
              <PerformanceComparisonQuestion
                question={currentQuestion.question}
                operations={currentQuestion.operations}
                correctRanking={currentQuestion.correctRanking}
                userTask={currentQuestion.userTask || "Rank the operations from fastest to slowest"}
                explanation={currentQuestion.explanation}
                onComplete={handleInteractiveComplete}
                showExplanation={showExplanation}
                isCorrect={isCorrect}
              />
            )}

            {/* Memory Layout */}
            {currentQuestion.type === 'memoryLayout' && 
             currentQuestion.array && 
             currentQuestion.visualizationData && 
             currentQuestion.visualizationData.baseAddress !== undefined && 
             currentQuestion.visualizationData.elementSize !== undefined && 
             currentQuestion.visualizationData.type && 
             currentQuestion.correctAddresses && (
              <MemoryLayoutQuestion
                question={currentQuestion.question}
                array={currentQuestion.array}
                visualizationData={{
                  baseAddress: currentQuestion.visualizationData.baseAddress,
                  elementSize: currentQuestion.visualizationData.elementSize,
                  type: currentQuestion.visualizationData.type
                }}
                userTask={currentQuestion.userTask || "Click on the correct memory addresses"}
                correctAddresses={currentQuestion.correctAddresses}
                explanation={currentQuestion.explanation}
                onComplete={handleInteractiveComplete}
                showExplanation={showExplanation}
                isCorrect={isCorrect}
              />
            )}

            {/* Build Data Structure */}
            {currentQuestion.type === 'buildDataStructure' && currentQuestion.task && currentQuestion.constraints && currentQuestion.targetStructure && currentQuestion.tools && (
              <BuildDataStructureQuestion
                question={currentQuestion.question}
                task={currentQuestion.task}
                constraints={currentQuestion.constraints}
                targetStructure={currentQuestion.targetStructure}
                tools={currentQuestion.tools}
                explanation={currentQuestion.explanation}
                onComplete={handleInteractiveComplete}
                showExplanation={showExplanation}
                isCorrect={isCorrect}
              />
            )}

            {/* Complexity Analysis */}
            {currentQuestion.type === 'complexityAnalysis' && currentQuestion.analysisSteps && (
              <ComplexityAnalysisQuestion
                question={currentQuestion.question}
                code={currentQuestion.code}
                analysisSteps={currentQuestion.analysisSteps}
                userTask={currentQuestion.userTask || "Analyze the time complexity step by step"}
                explanation={currentQuestion.explanation}
                onComplete={handleInteractiveComplete}
                showExplanation={showExplanation}
                isCorrect={isCorrect}
              />
            )}
          </View>
        </Animated.View>

        {/* Explanation Card */}
        {showExplanation && (
          <View className={`mt-6 p-6 rounded-3xl ${
            isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
          }`}>
            <View className="flex-row items-center mb-4">
              <View className={`w-12 h-12 rounded-full mr-4 ${
                isCorrect ? 'bg-green-500' : 'bg-red-500'
              }`}>
              </View>
              <View className="flex-1">
                <Text className={`text-xl font-bold ${
                  isCorrect ? 'text-green-800' : 'text-red-800'
                }`}>
                  {isCorrect ? 'Excellent!' : 'Learn & Continue!'}
                </Text>
              </View>
            </View>
            <Text className={`text-base leading-relaxed ${
              isCorrect ? 'text-green-700' : 'text-red-700'
            }`}>
              {currentQuestion.explanation}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Action Button */}
      {(shouldShowSubmitButton() || showExplanation) && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4" 
              style={{ paddingBottom: 34 }}>
          <Pressable
            onPress={showExplanation ? handleNext : handleAnswerSubmit}
            disabled={!showExplanation && !canSubmit()}
            className={`py-4 px-6 rounded-2xl ${
              (!showExplanation && !canSubmit())
                ? 'bg-gray-300'
                : showExplanation
                ? 'bg-blue-500'
                : 'bg-green-500'
            }`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="text-center text-white text-xl font-bold">
              {showExplanation 
                ? (isLastQuestion ? 'Complete Lesson' : 'Next Question')
                : 'Check Answer'
              }
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
};
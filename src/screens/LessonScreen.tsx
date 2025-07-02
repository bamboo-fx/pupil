import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useProgressStore } from '../state/progressStore';
import { Question, Lesson } from '../types';
import { checkAnswerFlexible } from '../utils/cn';

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
  const { lesson } = route.params;
  const { completeLesson, completeQuestion, loseHeart, hearts } = useProgressStore();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [fillInAnswer, setFillInAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const [shakeAnimation] = useState(new Animated.Value(0));
  const [scaleAnimation] = useState(new Animated.Value(1));

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
    if (hearts <= 0) {
      Alert.alert("No Hearts Left", "You need hearts to continue learning!");
      return;
    }

    const userAnswer = currentQuestion.type === 'mcq' ? selectedAnswer : fillInAnswer;
    
    console.log('Submitting answer:', {
      questionType: currentQuestion.type,
      userAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      question: currentQuestion.question
    });
    
    const correct = checkAnswerFlexible(userAnswer, currentQuestion.correctAnswer, currentQuestion.type);
    
    setIsCorrect(correct);
    setShowExplanation(true);
    
    if (correct) {
      completeQuestion(lesson.id, currentQuestion.id);
      setCorrectAnswers(prev => prev + 1);
      const xpForThisQuestion = getXpForDifficulty(currentQuestion.difficulty);
      setTotalXpEarned(prev => prev + xpForThisQuestion);
      triggerSuccess();
    } else {
      loseHeart();
      triggerShake();
    }
    
    setQuestionsAnswered(prev => prev + 1);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const passingScore = Math.ceil(lesson.questions.length * 0.6);
      if (correctAnswers >= passingScore) {
        completeLesson(lesson.id, totalXpEarned);
        navigation.navigate('LessonComplete', {
          lessonTitle: lesson.title,
          xpEarned: totalXpEarned,
          correctAnswers,
          totalQuestions: lesson.questions.length
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
    }
  };

  const canSubmit = currentQuestion.type === 'mcq' ? 
    selectedAnswer !== '' : 
    fillInAnswer.trim() !== '';

  const getDifficultyColor = (difficulty: string): [string, string] => {
    switch (difficulty) {
      case 'easy': return ['#22C55E', '#16A34A'];
      case 'medium': return ['#F97316', '#EA580C'];
      case 'hard': return ['#EF4444', '#DC2626'];
      default: return ['#6B7280', '#4B5563'];
    }
  };

  const getXpForDifficulty = (difficulty: string): number => {
    switch (difficulty) {
      case 'easy': return 2;
      case 'medium': return 3;
      case 'hard': return 5;
      default: return 2;
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

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
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
                      Correct answer: {currentQuestion.correctAnswer}
                    </Text>
                  </View>
                )}
              </View>
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
                {isCorrect && (
                  <Text className="text-green-600 font-semibold">
                    +{getXpForDifficulty(currentQuestion.difficulty)} XP earned
                  </Text>
                )}
              </View>
            </View>
            <Text className={`text-base leading-relaxed ${
              isCorrect ? 'text-green-700' : 'text-red-700'
            }`}>
              {currentQuestion.explanation}
            </Text>
          </View>
        )}

        {/* Action Button */}
        <View className="mt-8">
          <Pressable
            onPress={showExplanation ? handleNext : handleAnswerSubmit}
            disabled={!showExplanation && !canSubmit}
            className={`py-4 px-6 rounded-2xl ${
              (!showExplanation && !canSubmit)
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
      </ScrollView>
    </SafeAreaView>
  );
};
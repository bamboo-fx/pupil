import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GameStatsHeader } from '../components/GameStatsHeader';
import { useProgressStore } from '../state/progressStore';
import { Question, Lesson } from '../types';

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
  const { completeLesson, loseHeart, hearts } = useProgressStore();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [fillInAnswer, setFillInAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
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
      Animated.timing(scaleAnimation, { toValue: 1.1, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnimation, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const handleAnswerSubmit = () => {
    if (hearts <= 0) {
      Alert.alert("No Hearts Left", "You need hearts to continue learning!");
      return;
    }

    const userAnswer = currentQuestion.type === 'mcq' ? selectedAnswer : fillInAnswer.toLowerCase().trim();
    const correct = userAnswer === currentQuestion.correctAnswer.toLowerCase();
    
    setIsCorrect(correct);
    setShowExplanation(true);
    
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
      triggerSuccess();
    } else {
      loseHeart();
      triggerShake();
    }
    
    setQuestionsAnswered(prev => prev + 1);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Complete lesson
      const passingScore = Math.ceil(lesson.questions.length * 0.6);
      if (correctAnswers >= passingScore) {
        completeLesson(lesson.id, lesson.xpReward);
        navigation.navigate('LessonComplete', {
          lessonTitle: lesson.title,
          xpEarned: lesson.xpReward,
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
      // Next question
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

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        className="flex-1"
      >
        <GameStatsHeader />
        
        <View className="flex-row items-center px-4 py-3 bg-white/10">
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </Pressable>
          <View className="flex-1 mx-4">
            <View className="bg-white/20 rounded-full h-3">
              <View 
                className="bg-yellow-400 rounded-full h-3"
                style={{
                  width: `${((currentQuestionIndex + 1) / lesson.questions.length) * 100}%`
                }}
              />
            </View>
          </View>
          <Text className="text-white font-bold">
            {currentQuestionIndex + 1}/{lesson.questions.length}
          </Text>
        </View>

        <ScrollView className="flex-1 px-4 py-6">
          <Animated.View 
            style={{
              transform: [
                { translateX: shakeAnimation },
                { scale: scaleAnimation }
              ]
            }}
          >
            <LinearGradient
              colors={['#ffffff', '#f8fafc']}
              className="rounded-2xl p-6 mb-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
                elevation: 8,
              }}
            >
              <View className="flex-row items-center mb-4">
                <LinearGradient
                  colors={
                    currentQuestion.difficulty === 'easy' 
                      ? ['#10B981', '#059669']
                      : currentQuestion.difficulty === 'medium'
                      ? ['#F59E0B', '#D97706']
                      : ['#EF4444', '#DC2626']
                  }
                  className="w-6 h-6 rounded-full items-center justify-center mr-3"
                >
                  <Text className="text-white text-xs font-bold">
                    {currentQuestion.difficulty === 'easy' ? '⚡' : 
                     currentQuestion.difficulty === 'medium' ? '🔥' : '💀'}
                  </Text>
                </LinearGradient>
                <Text className="text-gray-700 text-sm font-bold uppercase tracking-wide">
                  {currentQuestion.difficulty} Challenge
                </Text>
              </View>
              
              <Text className="text-xl font-bold text-gray-800 mb-6 leading-relaxed">
                {currentQuestion.question}
              </Text>

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
                      >
                        <LinearGradient
                          colors={
                            isCorrectAnswer
                              ? ['#10B981', '#059669']
                              : isWrongSelection
                              ? ['#EF4444', '#DC2626']
                              : isSelected
                              ? ['#3B82F6', '#1D4ED8']
                              : ['#F8FAFC', '#E2E8F0']
                          }
                          className="p-4 rounded-xl"
                          style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 2,
                          }}
                        >
                          <View className="flex-row items-center">
                            <View className={`w-6 h-6 rounded-full mr-3 items-center justify-center ${
                              isCorrectAnswer ? 'bg-white/30' :
                              isWrongSelection ? 'bg-white/30' :
                              isSelected ? 'bg-white/30' : 'bg-gray-300'
                            }`}>
                              <Text className={`font-bold ${
                                isCorrectAnswer || isWrongSelection || isSelected ? 'text-white' : 'text-gray-600'
                              }`}>
                                {String.fromCharCode(65 + index)}
                              </Text>
                            </View>
                            <Text className={`text-lg font-medium flex-1 ${
                              isCorrectAnswer || isWrongSelection || isSelected ? 'text-white' : 'text-gray-800'
                            }`}>
                              {option}
                            </Text>
                            {isCorrectAnswer && (
                              <Text className="text-white text-xl">✓</Text>
                            )}
                            {isWrongSelection && (
                              <Text className="text-white text-xl">✗</Text>
                            )}
                          </View>
                        </LinearGradient>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {currentQuestion.type === 'fillInBlank' && (
                <View>
                  <View className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                    <TextInput
                      value={fillInAnswer}
                      onChangeText={setFillInAnswer}
                      placeholder="Type your answer here..."
                      className="text-lg font-medium text-gray-800"
                      editable={!showExplanation}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  {showExplanation && (
                    <LinearGradient
                      colors={isCorrect ? ['#10B981', '#059669'] : ['#EF4444', '#DC2626']}
                      className="mt-3 p-3 rounded-xl"
                    >
                      <Text className="text-white text-lg font-bold">
                        Correct answer: {currentQuestion.correctAnswer}
                      </Text>
                    </LinearGradient>
                  )}
                </View>
              )}
            </LinearGradient>
          </Animated.View>

          {showExplanation && (
            <LinearGradient
              colors={isCorrect ? ['#10B981', '#059669'] : ['#EF4444', '#DC2626']}
              className="rounded-2xl p-6 mb-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-3">
                  <Text className="text-white text-2xl">
                    {isCorrect ? '🎉' : '💡'}
                  </Text>
                </View>
                <Text className="text-white text-xl font-bold">
                  {isCorrect ? 'Awesome!' : 'Learn & Try Again!'}
                </Text>
              </View>
              <Text className="text-white/90 text-base leading-relaxed">
                {currentQuestion.explanation}
              </Text>
              {isCorrect && (
                <View className="flex-row items-center mt-3">
                  <Text className="text-yellow-300 text-lg font-bold">
                    +{Math.floor(lesson.xpReward / lesson.questions.length)} XP
                  </Text>
                </View>
              )}
            </LinearGradient>
          )}

          <View className="flex-1" />

          <Pressable
            onPress={showExplanation ? handleNext : handleAnswerSubmit}
            disabled={!showExplanation && !canSubmit}
          >
            <LinearGradient
              colors={
                (!showExplanation && !canSubmit)
                  ? ['#9CA3AF', '#6B7280']
                  : showExplanation
                  ? ['#F59E0B', '#D97706']
                  : ['#10B981', '#059669']
              }
              className="py-4 rounded-2xl"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text className="text-center text-white text-xl font-bold">
                {showExplanation 
                  ? (isLastQuestion ? '🏆 Finish Quest' : '➤ Continue')
                  : '⚡ Check Answer'
                }
              </Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};
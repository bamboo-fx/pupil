import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useProgressStore } from '../state/progressStore';
import { Question, Lesson } from '../types';

interface SimpleLessonScreenProps {
  navigation: any;
  route: {
    params: {
      lessonId: string;
      lesson: Lesson;
    };
  };
}

export const SimpleLessonScreen: React.FC<SimpleLessonScreenProps> = ({ navigation, route }) => {
  const { lesson } = route.params;
  const { completeLesson } = useProgressStore();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [fillInAnswer, setFillInAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const currentQuestion = lesson.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === lesson.questions.length - 1;

  const handleAnswerSubmit = () => {
    const userAnswer = currentQuestion.type === 'mcq' ? selectedAnswer : fillInAnswer.toLowerCase().trim();
    const correct = userAnswer === currentQuestion.correctAnswer.toLowerCase();
    
    setIsCorrect(correct);
    setShowExplanation(true);
    
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
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
    <SafeAreaView className="flex-1 bg-blue-500">
      <View className="px-4 py-3 bg-blue-500">
        <View className="flex-row items-center">
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </Pressable>
          <Text className="flex-1 text-center text-white text-lg font-bold">{lesson.title}</Text>
          <Text className="text-white">
            {currentQuestionIndex + 1}/{lesson.questions.length}
          </Text>
        </View>
        
        <View className="bg-white/30 rounded-full h-2 mt-3">
          <View 
            className="bg-yellow-400 rounded-full h-2"
            style={{
              width: `${((currentQuestionIndex + 1) / lesson.questions.length) * 100}%`
            }}
          />
        </View>
      </View>

      <ScrollView className="flex-1 bg-white p-4">
        <View className="bg-gray-50 rounded-lg p-6 mb-4">
          <View className="flex-row items-center mb-4">
            <View className={`w-4 h-4 rounded-full mr-2 ${
              currentQuestion.difficulty === 'easy' ? 'bg-green-500' :
              currentQuestion.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <Text className="text-gray-600 text-sm font-bold uppercase">
              {currentQuestion.difficulty}
            </Text>
          </View>
          
          <Text className="text-xl font-bold text-gray-800 mb-6">
            {currentQuestion.question}
          </Text>

          {currentQuestion.type === 'mcq' && currentQuestion.options && (
            <View className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <Pressable
                  key={index}
                  onPress={() => !showExplanation && setSelectedAnswer(option)}
                  className={`p-4 rounded-lg border-2 ${
                    showExplanation
                      ? option === currentQuestion.correctAnswer
                        ? 'border-green-500 bg-green-100'
                        : option === selectedAnswer && !isCorrect
                        ? 'border-red-500 bg-red-100'
                        : 'border-gray-200 bg-white'
                      : selectedAnswer === option
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-gray-200 bg-white'
                  }`}
                  disabled={showExplanation}
                >
                  <Text className={`text-lg font-medium ${
                    showExplanation && option === currentQuestion.correctAnswer
                      ? 'text-green-700'
                      : showExplanation && option === selectedAnswer && !isCorrect
                      ? 'text-red-700'
                      : 'text-gray-800'
                  }`}>
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {currentQuestion.type === 'fillInBlank' && (
            <View>
              <TextInput
                value={fillInAnswer}
                onChangeText={setFillInAnswer}
                placeholder="Type your answer here..."
                className="border-2 border-gray-300 rounded-lg p-4 text-lg bg-white"
                editable={!showExplanation}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {showExplanation && (
                <Text className={`mt-2 text-lg font-bold ${
                  isCorrect ? 'text-green-600' : 'text-red-600'
                }`}>
                  Correct answer: {currentQuestion.correctAnswer}
                </Text>
              )}
            </View>
          )}
        </View>

        {showExplanation && (
          <View className={`rounded-lg p-4 mb-4 ${
            isCorrect ? 'bg-green-100 border-2 border-green-300' : 'bg-red-100 border-2 border-red-300'
          }`}>
            <View className="flex-row items-center mb-2">
              <Text className="text-2xl mr-2">
                {isCorrect ? '🎉' : '💡'}
              </Text>
              <Text className={`text-lg font-bold ${
                isCorrect ? 'text-green-700' : 'text-red-700'
              }`}>
                {isCorrect ? 'Correct!' : 'Not quite right'}
              </Text>
            </View>
            <Text className="text-gray-700 text-base">
              {currentQuestion.explanation}
            </Text>
          </View>
        )}

        <View className="flex-1" />

        <Pressable
          onPress={showExplanation ? handleNext : handleAnswerSubmit}
          disabled={!showExplanation && !canSubmit}
          className={`py-4 rounded-lg ${
            (!showExplanation && !canSubmit)
              ? 'bg-gray-400'
              : 'bg-blue-600'
          }`}
        >
          <Text className="text-center text-white text-lg font-bold">
            {showExplanation 
              ? (isLastQuestion ? '🏆 Finish Lesson' : '➤ Continue')
              : '⚡ Check Answer'
            }
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeAnswer(answer: string): string {
  if (!answer || typeof answer !== 'string') {
    return '';
  }
  
  return answer
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s\-\(\)\/\²\³]/g, '') // Keep letters, numbers, spaces, hyphens, parentheses, slashes, and superscripts
}

export function checkAnswer(
  userAnswer: string, 
  correctAnswer: string | string[] | undefined, 
  questionType: 'mcq' | 'fillInBlank'
): boolean {
  // Validate inputs
  if (!userAnswer) {
    console.warn('Invalid user answer:', userAnswer);
    return false;
  }
  
  if (questionType === 'mcq') {
    // For MCQ, exact match (case-sensitive)
    if (typeof correctAnswer === 'string') {
      return userAnswer === correctAnswer;
    }
    console.warn('MCQ question missing correctAnswer string:', correctAnswer);
    return false;
  } else {
    // For fill-in-the-blank, check against acceptedAnswers array
    if (Array.isArray(correctAnswer)) {
      // New format with acceptedAnswers array
      const normalizedUser = normalizeAnswer(userAnswer);
      
      // Check if user answer matches any of the accepted answers
      const isCorrect = correctAnswer.some(acceptedAnswer => {
        const normalizedAccepted = normalizeAnswer(acceptedAnswer);
        return normalizedUser === normalizedAccepted;
      });
      
      // Debug logging (remove in production)
      console.log('Answer Check (array):', {
        originalUser: userAnswer,
        acceptedAnswers: correctAnswer,
        normalizedUser,
        isCorrect
      });
      
      return isCorrect;
    } else if (typeof correctAnswer === 'string') {
      // Backward compatibility with old format
      const normalizedUser = normalizeAnswer(userAnswer);
      const normalizedCorrect = normalizeAnswer(correctAnswer);
      
      // Debug logging (remove in production)
      console.log('Answer Check (legacy):', {
        originalUser: userAnswer,
        originalCorrect: correctAnswer,
        normalizedUser,
        normalizedCorrect,
        isCorrect: normalizedUser === normalizedCorrect
      });
      
      return normalizedUser === normalizedCorrect;
    }
    
    console.warn('Fill-in-blank question missing acceptedAnswers or correctAnswer:', correctAnswer);
    return false;
  }
}

// Test function to verify answer checking logic
export function testAnswerChecking() {
  const testCases = [
    // MCQ tests
    { user: "O(1)", correct: "O(1)", type: 'mcq' as const, expected: true },
    { user: "O(n)", correct: "O(1)", type: 'mcq' as const, expected: false },
    
    // Fill-in-the-blank tests (new array format)
    { user: "length", correct: ["length", "Length", "LENGTH"], type: 'fillInBlank' as const, expected: true },
    { user: "Length", correct: ["length", "Length", "LENGTH"], type: 'fillInBlank' as const, expected: true },
    { user: "LENGTH", correct: ["length", "Length", "LENGTH"], type: 'fillInBlank' as const, expected: true },
    { user: " length ", correct: ["length", "Length", "LENGTH"], type: 'fillInBlank' as const, expected: true },
    { user: "two", correct: ["two", "Two", "TWO", "2"], type: 'fillInBlank' as const, expected: true },
    { user: "2", correct: ["two", "Two", "TWO", "2"], type: 'fillInBlank' as const, expected: true },
    { user: "stack", correct: ["stack", "Stack", "STACK"], type: 'fillInBlank' as const, expected: true },
    { user: "STACK", correct: ["stack", "Stack", "STACK"], type: 'fillInBlank' as const, expected: true },
    
    // Fill-in-the-blank tests (legacy single string format)
    { user: "legacy", correct: "legacy", type: 'fillInBlank' as const, expected: true },
    { user: "Legacy", correct: "legacy", type: 'fillInBlank' as const, expected: true },
  ];
  
  console.log('Testing answer checking logic...');
  testCases.forEach((testCase, index) => {
    const result = checkAnswer(testCase.user, testCase.correct, testCase.type);
    const passed = result === testCase.expected;
    console.log(`Test ${index + 1}: ${passed ? 'PASS' : 'FAIL'}`, {
      user: testCase.user,
      correct: testCase.correct,
      type: testCase.type,
      expected: testCase.expected,
      actual: result
    });
  });
}

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
    .replace(/[^\w\s\-\(\)]/g, '') // Keep letters, numbers, spaces, hyphens, and parentheses
}

export function checkAnswer(userAnswer: string, correctAnswer: string, questionType: 'mcq' | 'fillInBlank'): boolean {
  // Validate inputs
  if (!userAnswer || !correctAnswer) {
    console.warn('Invalid answer inputs:', { userAnswer, correctAnswer });
    return false;
  }
  
  if (questionType === 'mcq') {
    // For MCQ, exact match (case-sensitive)
    return userAnswer === correctAnswer;
  } else {
    // For fill-in-the-blank, normalize both answers
    const normalizedUser = normalizeAnswer(userAnswer);
    const normalizedCorrect = normalizeAnswer(correctAnswer);
    
    // Debug logging (remove in production)
    console.log('Answer Check:', {
      originalUser: userAnswer,
      originalCorrect: correctAnswer,
      normalizedUser,
      normalizedCorrect,
      isCorrect: normalizedUser === normalizedCorrect
    });
    
    return normalizedUser === normalizedCorrect;
  }
}

// Alternative more flexible checking for edge cases
export function checkAnswerFlexible(userAnswer: string, correctAnswer: string, questionType: 'mcq' | 'fillInBlank'): boolean {
  // Validate inputs
  if (!userAnswer || !correctAnswer) {
    console.warn('Invalid answer inputs:', { userAnswer, correctAnswer });
    return false;
  }
  
  if (questionType === 'mcq') {
    return userAnswer === correctAnswer;
  } else {
    // Multiple normalization strategies
    const strategies = [
      // Strategy 1: Basic normalization
      () => normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer),
      // Strategy 2: Remove all spaces
      () => userAnswer.toLowerCase().replace(/\s/g, '') === correctAnswer.toLowerCase().replace(/\s/g, ''),
      // Strategy 3: Exact match (case-insensitive)
      () => userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim(),
      // Strategy 4: Handle mathematical notation (O(1), O(n), etc.)
      () => {
        const cleanUser = userAnswer.toLowerCase().trim().replace(/\s/g, '');
        const cleanCorrect = correctAnswer.toLowerCase().trim().replace(/\s/g, '');
        return cleanUser === cleanCorrect;
      }
    ];
    
    return strategies.some(strategy => strategy());
  }
}

// Test function to verify answer checking logic
export function testAnswerChecking() {
  const testCases = [
    // MCQ tests
    { user: "O(1)", correct: "O(1)", type: 'mcq' as const, expected: true },
    { user: "O(n)", correct: "O(1)", type: 'mcq' as const, expected: false },
    
    // Fill-in-the-blank tests
    { user: "length", correct: "length", type: 'fillInBlank' as const, expected: true },
    { user: "Length", correct: "length", type: 'fillInBlank' as const, expected: true },
    { user: "LENGTH", correct: "length", type: 'fillInBlank' as const, expected: true },
    { user: " length ", correct: "length", type: 'fillInBlank' as const, expected: true },
    { user: "two", correct: "two", type: 'fillInBlank' as const, expected: true },
    { user: "Two", correct: "two", type: 'fillInBlank' as const, expected: true },
    { user: "pointer", correct: "pointer", type: 'fillInBlank' as const, expected: true },
    { user: "Pointer", correct: "pointer", type: 'fillInBlank' as const, expected: true },
  ];
  
  console.log('Testing answer checking logic...');
  testCases.forEach((testCase, index) => {
    const result = checkAnswerFlexible(testCase.user, testCase.correct, testCase.type);
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

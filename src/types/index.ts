export interface Question {
  id: string;
  type: 'mcq' | 'fillInBlank';
  question: string;
  options?: string[]; // For MCQ
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  xpReward: number;
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  isUnlocked: boolean;
  completedLessons: number;
}

export interface UserProgress {
  totalXp: number;
  streak: number;
  hearts: number;
  lastStudyDate: string;
  completedLessons: string[];
  unitProgress: Record<string, number>; // unit id -> completed lessons count
  lessonQuestionProgress: Record<string, string[]>; // lesson id -> completed question ids
}
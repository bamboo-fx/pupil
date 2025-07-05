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
  lastStudyDate: string;
  completedLessons: string[];
  unitProgress: Record<string, number>; // unit id -> completed lessons count
  lessonQuestionProgress: Record<string, string[]>; // lesson id -> completed question ids
}

// Enhanced User interface for Supabase integration
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  totalXp: number;
  streak: number;
  level: number;
  lastStudyDate: string;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;
  timezone?: string;
  languagePreference?: string;
  notificationSettings?: Record<string, boolean>;
}

// Achievement system types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'progress' | 'streak' | 'xp' | 'completion' | 'skill';
  requirement: {
    type: 'lessons_completed' | 'xp_earned' | 'streak_days' | 'units_completed' | 'questions_answered';
    value: number;
  };
  rewardXp: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  progressValue: number;
  metadata?: Record<string, any>;
}

// Session tracking for analytics
export interface LessonSession {
  id: string;
  userId: string;
  lessonId: string;
  unitId: string;
  startedAt: string;
  completedAt?: string;
  questionsAnswered: number;
  correctAnswers: number;
  xpEarned: number;
  durationSeconds: number;
  accuracyPercentage: number;
  attemptsCount: number;
  timeSpentSeconds: number;
}

// User statistics and analytics
export interface UserStats {
  totalLessonsCompleted: number;
  totalQuestionsAnswered: number;
  totalTimeSpentSeconds: number;
  averageAccuracy: number;
  longestStreak: number;
  currentStreak: number;
  unitsCompleted: number;
  favoriteTopic?: string;
  lastActivityDate: string;
  weeklyXpGoal: number;
  weeklyXpEarned: number;
}

// Enhanced progress tracking
export interface DetailedProgress {
  lessonId: string;
  unitId: string;
  completedAt: string;
  xpEarned: number;
  questionsCompleted: string[];
  timeSpentSeconds: number;
  accuracyPercentage: number;
  attemptsCount: number;
}
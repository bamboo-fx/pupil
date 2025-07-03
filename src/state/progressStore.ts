import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress } from '../types';

interface ProgressState extends UserProgress {
  completeLesson: (lessonId: string, xpGained: number) => void;
  completeQuestion: (lessonId: string, questionId: string) => void;
  getLessonProgress: (lessonId: string) => number;
  updateStreak: () => void;
  resetProgress: () => void;
}

const initialState: UserProgress = {
  totalXp: 0,
  streak: 0,
  lastStudyDate: new Date().toISOString().split('T')[0],
  completedLessons: [],
  unitProgress: {},
  lessonQuestionProgress: {}, // Track questions completed per lesson
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      completeLesson: (lessonId: string, xpGained: number) => {
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          const isNewDay = state.lastStudyDate !== today;
          
          return {
            totalXp: state.totalXp + xpGained,
            completedLessons: [...state.completedLessons, lessonId],
            streak: isNewDay ? state.streak + 1 : state.streak,
            lastStudyDate: today,
          };
        });
      },

      completeQuestion: (lessonId: string, questionId: string) => {
        set((state) => {
          const currentProgress = state.lessonQuestionProgress[lessonId] || [];
          if (currentProgress.includes(questionId)) {
            return state; // Question already completed, no change
          }
          
          return {
            lessonQuestionProgress: {
              ...state.lessonQuestionProgress,
              [lessonId]: [...currentProgress, questionId],
            },
          };
        });
      },

      getLessonProgress: (lessonId: string) => {
        const state = get();
        const completedQuestions = state.lessonQuestionProgress[lessonId] || [];
        return completedQuestions.length;
      },
      
      updateStreak: () => {
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          
          if (state.lastStudyDate === yesterday) {
            return { streak: state.streak + 1, lastStudyDate: today };
          } else if (state.lastStudyDate !== today) {
            return { streak: 1, lastStudyDate: today };
          }
          return state;
        });
      },
      
      resetProgress: () => {
        set(initialState);
      },
    }),
    {
      name: 'dsa-progress',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
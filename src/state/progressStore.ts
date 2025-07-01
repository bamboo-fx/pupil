import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress } from '../types';

interface ProgressState extends UserProgress {
  completeLesson: (lessonId: string, xpGained: number) => void;
  loseHeart: () => void;
  gainHeart: () => void;
  updateStreak: () => void;
  resetProgress: () => void;
}

const initialState: UserProgress = {
  totalXp: 0,
  streak: 0,
  hearts: 5,
  lastStudyDate: new Date().toISOString().split('T')[0],
  completedLessons: [],
  unitProgress: {},
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
      
      loseHeart: () => {
        set((state) => ({
          hearts: Math.max(0, state.hearts - 1),
        }));
      },
      
      gainHeart: () => {
        set((state) => ({
          hearts: Math.min(5, state.hearts + 1),
        }));
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
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { UserProgress, Achievement, LessonSession, UserStats, DetailedProgress } from '../types';
import { useAuthStore } from './authStore';

interface ProgressState extends UserProgress {
  achievements: Achievement[];
  userStats: UserStats | null;
  isLoading: boolean;
  completeLesson: (lessonId: string, unitIdOrXpGained: string | number, xpGained?: number, session?: Partial<LessonSession>) => Promise<void>;
  completeQuestion: (lessonId: string, questionId: string) => Promise<void>;
  getLessonProgress: (lessonId: string) => number;
  updateStreak: () => Promise<void>;
  resetProgress: () => Promise<void>;
  loadUserProgress: (userId: string) => Promise<void>;
  syncProgress: () => Promise<void>;
  unlockAchievement: (achievementId: string) => Promise<void>;
  updateUserStats: (stats: Partial<UserStats>) => Promise<void>;
  checkAchievements: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  clearUserProgress: () => void;
}

const initialState: UserProgress = {
  totalXp: 0,
  streak: 0,
  lastStudyDate: new Date().toISOString().split('T')[0],
  completedLessons: [],
  unitProgress: {},
  lessonQuestionProgress: {},
};

const defaultAchievements: Achievement[] = [
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: 'workspace-premium',
    type: 'completion',
    requirement: { type: 'lessons_completed', value: 1 },
    rewardXp: 10,
    isUnlocked: false,
    progressValue: 0,
  },
  {
    id: 'learning_streak',
    title: 'On Fire',
    description: 'Maintain a 3-day streak',
    icon: 'whatshot',
    type: 'streak',
    requirement: { type: 'streak_days', value: 3 },
    rewardXp: 25,
    isUnlocked: false,
    progressValue: 0,
  },
  {
    id: 'xp_master',
    title: 'XP Master',
    description: 'Earn 100 XP points',
    icon: 'military-tech',
    type: 'xp',
    requirement: { type: 'xp_earned', value: 100 },
    rewardXp: 20,
    isUnlocked: false,
    progressValue: 0,
  },
  {
    id: 'dedication',
    title: 'Dedicated Learner',
    description: 'Complete 10 lessons',
    icon: 'psychology',
    type: 'completion',
    requirement: { type: 'lessons_completed', value: 10 },
    rewardXp: 50,
    isUnlocked: false,
    progressValue: 0,
  },
  {
    id: 'algorithm_apprentice',
    title: 'Algorithm Apprentice',
    description: 'Complete 25 lessons',
    icon: 'model-training',
    type: 'completion',
    requirement: { type: 'lessons_completed', value: 25 },
    rewardXp: 100,
    isUnlocked: false,
    progressValue: 0,
  },
  {
    id: 'data_structure_devotee',
    title: 'Data Structure Devotee',
    description: 'Complete 50 lessons',
    icon: 'legend-toggle',
    type: 'completion',
    requirement: { type: 'lessons_completed', value: 50 },
    rewardXp: 200,
    isUnlocked: false,
    progressValue: 0,
  },
  {
    id: 'xp_enthusiast',
    title: 'XP Enthusiast',
    description: 'Earn 500 XP points',
    icon: 'insights',
    type: 'xp',
    requirement: { type: 'xp_earned', value: 500 },
    rewardXp: 100,
    isUnlocked: false,
    progressValue: 0,
  },
  {
    id: 'quest_king',
    title: 'Quest King',
    description: 'Earn 1000 XP points',
    icon: 'emoji-events',
    type: 'xp',
    requirement: { type: 'xp_earned', value: 1000 },
    rewardXp: 250,
    isUnlocked: false,
    progressValue: 0,
  },
];

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initialState,
      achievements: defaultAchievements,
      userStats: null,
      isLoading: false,
      
      completeLesson: async (lessonId: string, unitIdOrXpGained: string | number, xpGained?: number, session?: Partial<LessonSession>) => {
        try {
          const state = get();
          const { user, updateProfile } = useAuthStore.getState();
          
          if (!user) return;

          // Handle backward compatibility
          let unitId: string;
          let actualXpGained: number;
          let actualSession: {
            questionsAnswered?: number;
            durationSeconds?: number;
            accuracyPercentage?: number;
            attemptsCount?: number;
          };

          if (typeof unitIdOrXpGained === 'number') {
            // Lesson-based XP: (lessonId, xpGained)
            // Find the unit ID for this lesson
            const questionsData = require('../data/questions.json');
            const units = questionsData.units;
            let foundUnitId = 'unknown-unit';
            
            for (const unit of units) {
              if (unit.lessons.some((l: any) => l.id === lessonId)) {
                foundUnitId = unit.id;
                break;
              }
            }
            
            unitId = foundUnitId;
            actualXpGained = unitIdOrXpGained;
            actualSession = {};
          } else {
            // New signature: (lessonId, unitId, xpGained, session)
            unitId = unitIdOrXpGained;
            actualXpGained = xpGained || 0;
            actualSession = {
              questionsAnswered: session?.questionsAnswered,
              durationSeconds: session?.durationSeconds,
              accuracyPercentage: session?.accuracyPercentage,
              attemptsCount: session?.attemptsCount,
            };
          }

          const today = new Date().toISOString().split('T')[0];
          const isNewDay = state.lastStudyDate !== today;
          
          const newTotalXp = state.totalXp + actualXpGained;
          const newStreak = isNewDay ? state.streak + 1 : state.streak;
          const newCompletedLessons = [...state.completedLessons, lessonId];

          // Update local state
          set({
            totalXp: newTotalXp,
            completedLessons: newCompletedLessons,
            streak: newStreak,
            lastStudyDate: today,
            unitProgress: {
              ...state.unitProgress,
              [unitId]: (state.unitProgress[unitId] || 0) + 1,
            },
          });

          // Update user profile in database
          await updateProfile({
            totalXp: newTotalXp,
            streak: newStreak,
            lastStudyDate: today,
          });

          // Record lesson completion in database
          await supabase.from('lesson_progress').insert([
            {
              user_id: user.id,
              lesson_id: lessonId,
              unit_id: unitId,
              completed_at: new Date().toISOString(),
              xp_earned: actualXpGained,
              questions_completed: actualSession.questionsAnswered || 0,
              time_spent_seconds: actualSession.durationSeconds || 0,
              accuracy_percentage: actualSession.accuracyPercentage || 0,
              attempts_count: actualSession.attemptsCount || 1,
            }
          ]);

          // Update user stats
          const currentStats = state.userStats || {
            totalLessonsCompleted: 0,
            totalQuestionsAnswered: 0,
            totalTimeSpentSeconds: 0,
            averageAccuracy: 0,
            longestStreak: 0,
            currentStreak: 0,
            unitsCompleted: 0,
            lastActivityDate: today,
            weeklyXpGoal: 500,
            weeklyXpEarned: 0,
          };

          const updatedStats = {
            ...currentStats,
            totalLessonsCompleted: currentStats.totalLessonsCompleted + 1,
            totalQuestionsAnswered: currentStats.totalQuestionsAnswered + (actualSession.questionsAnswered || 0),
            totalTimeSpentSeconds: currentStats.totalTimeSpentSeconds + (actualSession.durationSeconds || 0),
            longestStreak: Math.max(currentStats.longestStreak, newStreak),
            currentStreak: newStreak,
            lastActivityDate: today,
          };

          await get().updateUserStats(updatedStats);

          // Check for achievements
          await get().checkAchievements();
          
        } catch (error) {
          console.error('Error completing lesson:', error);
        }
      },

      completeQuestion: async (lessonId: string, questionId: string) => {
        try {
          const state = get();
          const currentProgress = state.lessonQuestionProgress[lessonId] || [];
          
          if (currentProgress.includes(questionId)) {
            return; // Question already completed
          }
          
          const newProgress = [...currentProgress, questionId];
          
          set({
            lessonQuestionProgress: {
              ...state.lessonQuestionProgress,
              [lessonId]: newProgress,
            },
          });

          // Sync with database if needed
          await get().syncProgress();
        } catch (error) {
          console.error('Error completing question:', error);
        }
      },

      getLessonProgress: (lessonId: string) => {
        const state = get();
        const completedQuestions = state.lessonQuestionProgress[lessonId] || [];
        return completedQuestions.length;
      },
      
      updateStreak: async () => {
        try {
          const state = get();
          const { user, updateProfile } = useAuthStore.getState();
          
          if (!user) return;

          const today = new Date().toISOString().split('T')[0];
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          
          let newStreak = state.streak;
          
          if (state.lastStudyDate === yesterday) {
            newStreak = state.streak + 1;
          } else if (state.lastStudyDate !== today) {
            newStreak = 1;
          }
          
          set({ streak: newStreak, lastStudyDate: today });
          
          await updateProfile({
            streak: newStreak,
            lastStudyDate: today,
          });
        } catch (error) {
          console.error('Error updating streak:', error);
        }
      },
      
      resetProgress: async () => {
        try {
          const { user, updateProfile } = useAuthStore.getState();
          if (!user) return;

          // Reset local state
          set({
            ...initialState,
            achievements: defaultAchievements,
            userStats: null,
          });

          // Reset user profile in database (XP, streak, lastStudyDate)
          await updateProfile({
            totalXp: 0,
            streak: 0,
            lastStudyDate: new Date().toISOString().split('T')[0],
          });

          // Reset in database
          await supabase.from('lesson_progress').delete().eq('user_id', user.id);
          await supabase.from('achievements').delete().eq('user_id', user.id);
          await supabase.from('user_stats').delete().eq('user_id', user.id);

          // Clear the persisted storage to ensure clean state
          await AsyncStorage.removeItem('dsa-progress');
          
        } catch (error) {
          console.error('Error resetting progress:', error);
        }
      },

      loadUserProgress: async (userId: string) => {
        try {
          set({ isLoading: true });

          // Load user data directly from database to get most up-to-date XP
          const { data: userData } = await supabase
            .from('users')
            .select('total_xp, streak, last_study_date')
            .eq('id', userId)
            .single();

          const userTotalXp = userData?.total_xp || 0;
          const userStreak = userData?.streak || 0;
          const userLastStudyDate = userData?.last_study_date || new Date().toISOString().split('T')[0];

          // Load lesson progress
          const { data: progressData } = await supabase
            .from('lesson_progress')
            .select('*')
            .eq('user_id', userId)
            .order('completed_at', { ascending: false });

          // Load achievements
          const { data: achievementsData } = await supabase
            .from('achievements')
            .select('*')
            .eq('user_id', userId);

          // Load user stats
          const { data: statsData } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', userId)
            .single();

          // Process progress data
          const completedLessons = progressData?.map(p => p.lesson_id) || [];
          const unitProgress: Record<string, number> = {};
          const lessonQuestionProgress: Record<string, string[]> = {};

          progressData?.forEach(progress => {
            unitProgress[progress.unit_id] = (unitProgress[progress.unit_id] || 0) + 1;
            lessonQuestionProgress[progress.lesson_id] = progress.questions_completed || [];
          });

          // Process achievements
          const achievements = defaultAchievements.map(defaultAchievement => {
            const userAchievement = achievementsData?.find(a => a.achievement_id === defaultAchievement.id);
            return {
              ...defaultAchievement,
              isUnlocked: userAchievement?.is_completed || false,
              unlockedAt: userAchievement?.unlocked_at,
              progressValue: userAchievement?.progress_value || 0,
            };
          });

          set({
            // Use the user's actual XP from the database
            totalXp: userTotalXp,
            streak: userStreak,
            lastStudyDate: userLastStudyDate,
            completedLessons,
            unitProgress,
            lessonQuestionProgress,
            achievements,
            userStats: statsData ? {
              totalLessonsCompleted: statsData.total_lessons_completed,
              totalQuestionsAnswered: statsData.total_questions_answered,
              totalTimeSpentSeconds: statsData.total_time_spent_seconds,
              averageAccuracy: statsData.average_accuracy,
              longestStreak: statsData.longest_streak,
              currentStreak: statsData.current_streak,
              unitsCompleted: statsData.units_completed,
              favoriteTopic: statsData.favorite_topic,
              lastActivityDate: statsData.last_activity_date,
              weeklyXpGoal: statsData.weekly_xp_goal,
              weeklyXpEarned: statsData.weekly_xp_earned,
            } : null,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error loading user progress:', error);
          set({ isLoading: false });
        }
      },

      syncProgress: async () => {
        try {
          const { user } = useAuthStore.getState();
          if (!user) return;

          // This is a placeholder for syncing local progress with database
          // In a real app, you'd implement conflict resolution logic here
        } catch (error) {
          console.error('Error syncing progress:', error);
        }
      },

      unlockAchievement: async (achievementId: string) => {
        try {
          const state = get();
          const { user } = useAuthStore.getState();
          
          if (!user) return;

          const achievement = state.achievements.find(a => a.id === achievementId);
          if (!achievement || achievement.isUnlocked) return;

          // Update local state
          const updatedAchievements = state.achievements.map(a => 
            a.id === achievementId 
              ? { ...a, isUnlocked: true, unlockedAt: new Date().toISOString() }
              : a
          );

          set({ achievements: updatedAchievements });

          // Update database
          await supabase.from('achievements').upsert([
            {
              user_id: user.id,
              achievement_id: achievementId,
              achievement_type: achievement.type,
              unlocked_at: new Date().toISOString(),
              is_completed: true,
              progress_value: achievement.requirement.value,
            }
          ]);

          // Award XP
          if (achievement.rewardXp > 0) {
            const newTotalXp = state.totalXp + achievement.rewardXp;
            set({ totalXp: newTotalXp });
            
            const { updateProfile } = useAuthStore.getState();
            await updateProfile({ totalXp: newTotalXp });
          }
        } catch (error) {
          console.error('Error unlocking achievement:', error);
        }
      },

             updateUserStats: async (stats: Partial<UserStats>) => {
         try {
           const state = get();
           const { user } = useAuthStore.getState();
           
           if (!user) return;

           const currentStats = state.userStats || {
             totalLessonsCompleted: 0,
             totalQuestionsAnswered: 0,
             totalTimeSpentSeconds: 0,
             averageAccuracy: 0,
             longestStreak: 0,
             currentStreak: 0,
             unitsCompleted: 0,
             lastActivityDate: new Date().toISOString(),
             weeklyXpGoal: 500,
             weeklyXpEarned: 0,
           };

           const updatedStats: UserStats = { ...currentStats, ...stats };
           set({ userStats: updatedStats });

          // Update database
          await supabase.from('user_stats').upsert([
            {
              user_id: user.id,
              total_lessons_completed: updatedStats.totalLessonsCompleted,
              total_questions_answered: updatedStats.totalQuestionsAnswered,
              total_time_spent_seconds: updatedStats.totalTimeSpentSeconds,
              average_accuracy: updatedStats.averageAccuracy,
              longest_streak: updatedStats.longestStreak,
              current_streak: updatedStats.currentStreak,
              units_completed: updatedStats.unitsCompleted,
              favorite_topic: updatedStats.favoriteTopic,
              last_activity_date: updatedStats.lastActivityDate,
              weekly_xp_goal: updatedStats.weeklyXpGoal,
              weekly_xp_earned: updatedStats.weeklyXpEarned,
            }
          ]);
        } catch (error) {
          console.error('Error updating user stats:', error);
        }
      },

      checkAchievements: async () => {
        const state = get();
        const { user } = useAuthStore.getState();
        
        if (!user) return;

        // Check each achievement
        for (const achievement of state.achievements) {
          if (achievement.isUnlocked) continue;

          let shouldUnlock = false;
          let progressValue = 0;

          switch (achievement.requirement.type) {
            case 'lessons_completed':
              progressValue = state.completedLessons.length;
              shouldUnlock = progressValue >= achievement.requirement.value;
              break;
            case 'xp_earned':
              progressValue = state.totalXp;
              shouldUnlock = progressValue >= achievement.requirement.value;
              break;
            case 'streak_days':
              progressValue = state.streak;
              shouldUnlock = progressValue >= achievement.requirement.value;
              break;
            case 'units_completed':
              progressValue = Object.keys(state.unitProgress).length;
              shouldUnlock = progressValue >= achievement.requirement.value;
              break;
            case 'questions_answered':
              progressValue = state.userStats?.totalQuestionsAnswered || 0;
              shouldUnlock = progressValue >= achievement.requirement.value;
              break;
          }

          // Update progress value
          const updatedAchievements = state.achievements.map(a => 
            a.id === achievement.id 
              ? { ...a, progressValue }
              : a
          );
          set({ achievements: updatedAchievements });

          // Unlock if conditions are met
          if (shouldUnlock) {
            await get().unlockAchievement(achievement.id);
          }
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      clearUserProgress: () => {
        set({
          ...initialState,
          achievements: defaultAchievements,
          userStats: null,
          isLoading: false,
        });
      },
    }),
    {
      name: 'dsa-progress',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
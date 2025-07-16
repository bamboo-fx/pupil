import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { identifyRevenueCatUser, logOutRevenueCatUser } from '../config/revenuecat';

// CRITICAL FIX: Use static import instead of dynamic import
// This prevents production build failures in TestFlight
import { useProgressStore } from './progressStore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  setLoading: (loading: boolean) => void;
  refreshUser: () => Promise<void>;
}

const calculateLevel = (xp: number): number => {
  return Math.floor(xp / 100) + 1;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.error('Login error:', error.message);
            set({ isLoading: false });
            return false;
          }

          if (data.user) {
            // Fetch user profile data
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (userError) {
              console.error('User fetch error:', userError.message);
              set({ isLoading: false });
              return false;
            }

            const user: User = {
              id: userData.id,
              email: userData.email,
              firstName: userData.first_name,
              lastName: userData.last_name,
              fullName: userData.full_name,
              totalXp: userData.total_xp,
              streak: userData.streak,
              level: userData.level,
              lastStudyDate: userData.last_study_date,
              createdAt: userData.created_at,
              updatedAt: userData.updated_at,
              avatarUrl: userData.avatar_url,
              timezone: userData.timezone,
              languagePreference: userData.language_preference,
              notificationSettings: userData.notification_settings,
            };

            // ✅ CRITICAL FIX: Identify user with RevenueCat BEFORE setting auth state
            // This prevents race condition where subscription check happens on anonymous user
            try {
              await identifyRevenueCatUser(data.user.id);
              console.log('✅ RevenueCat user identified before setting auth state');
            } catch (error) {
              console.warn('⚠️ Failed to identify RevenueCat user during login:', error);
            }

            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false 
            });

            return true;
          }

          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      signup: async (firstName: string, lastName: string, email: string, password: string) => {
        try {
          set({ isLoading: true });

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                first_name: firstName,
                last_name: lastName,
              }
            }
          });

          if (error) {
            console.error('Signup error:', error.message);
            set({ isLoading: false });
            return false;
          }

          if (data.user) {
            // Create user profile in our users table
            const { error: insertError } = await supabase
              .from('users')
              .insert([
                {
                  id: data.user.id,
                  email: data.user.email,
                  first_name: firstName,
                  last_name: lastName,
                  total_xp: 0,
                  streak: 0,
                  level: 1,
                  last_study_date: new Date().toISOString().split('T')[0],
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  language_preference: 'en',
                  notification_settings: {
                    daily_reminders: true,
                    achievement_notifications: true,
                    streak_reminders: true,
                    weekly_progress: true,
                  },
                }
              ]);

            if (insertError) {
              console.error('User creation error:', insertError.message);
              set({ isLoading: false });
              return false;
            }

            // Create initial user stats
            await supabase
              .from('user_stats')
              .insert([
                {
                  user_id: data.user.id,
                  total_lessons_completed: 0,
                  total_questions_answered: 0,
                  total_time_spent_seconds: 0,
                  average_accuracy: 0,
                  longest_streak: 0,
                  current_streak: 0,
                  units_completed: 0,
                  last_activity_date: new Date().toISOString(),
                  weekly_xp_goal: 500,
                  weekly_xp_earned: 0,
                }
              ]);

            const user: User = {
              id: data.user.id,
              email: data.user.email!,
              firstName,
              lastName,
              fullName: `${firstName} ${lastName}`,
              totalXp: 0,
              streak: 0,
              level: 1,
              lastStudyDate: new Date().toISOString().split('T')[0],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              languagePreference: 'en',
              notificationSettings: {
                daily_reminders: true,
                achievement_notifications: true,
                streak_reminders: true,
                weekly_progress: true,
              },
            };

            // ✅ CRITICAL FIX: Identify user with RevenueCat BEFORE setting auth state
            // This prevents race condition where subscription check happens on anonymous user
            try {
              await identifyRevenueCatUser(data.user.id);
              console.log('✅ RevenueCat user identified before setting auth state');
            } catch (error) {
              console.warn('⚠️ Failed to identify RevenueCat user during signup:', error);
            }

            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false 
            });

            return true;
          }

          set({ isLoading: false });
          return false;
        } catch (error) {
          console.error('Signup error:', error);
          set({ isLoading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          // ✅ Log out from RevenueCat first
          try {
            await logOutRevenueCatUser();
          } catch (error) {
            console.warn('⚠️ Failed to logout from RevenueCat:', error);
          }

          await supabase.auth.signOut();
          
          // Clear progress store data - FIXED: Use static import
          const { clearUserProgress } = useProgressStore.getState();
          clearUserProgress();
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        } catch (error) {
          console.error('Logout error:', error);
          
          // Clear progress store data even on error - FIXED: Use static import
          const { clearUserProgress } = useProgressStore.getState();
          clearUserProgress();
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        try {
          const currentUser = get().user;
          if (!currentUser) return false;

          const dbUpdates: any = {};
          
          // Map client fields to database fields
          if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
          if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName;
          if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
          if (updates.totalXp !== undefined) {
            dbUpdates.total_xp = updates.totalXp;
            dbUpdates.level = calculateLevel(updates.totalXp);
          }
          if (updates.streak !== undefined) dbUpdates.streak = updates.streak;
          if (updates.lastStudyDate !== undefined) dbUpdates.last_study_date = updates.lastStudyDate;
          if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
          if (updates.timezone !== undefined) dbUpdates.timezone = updates.timezone;
          if (updates.languagePreference !== undefined) dbUpdates.language_preference = updates.languagePreference;
          if (updates.notificationSettings !== undefined) dbUpdates.notification_settings = updates.notificationSettings;

          dbUpdates.updated_at = new Date().toISOString();

          const { error } = await supabase
            .from('users')
            .update(dbUpdates)
            .eq('id', currentUser.id);

          if (error) {
            console.error('Profile update error:', error.message);
            return false;
          }

          // Update local state
          const updatedUser = { ...currentUser, ...updates, updatedAt: new Date().toISOString() };
          if (updates.totalXp !== undefined) {
            updatedUser.level = calculateLevel(updates.totalXp);
          }
          
          set({ user: updatedUser });
          return true;
        } catch (error) {
          console.error('Profile update error:', error);
          return false;
        }
      },

      refreshUser: async () => {
        try {
          const currentUser = get().user;
          if (!currentUser) return;

          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();

          if (error) {
            console.error('User refresh error:', error.message);
            return;
          }

          const user: User = {
            id: data.id,
            email: data.email,
            firstName: data.first_name,
            lastName: data.last_name,
            fullName: data.full_name,
            totalXp: data.total_xp,
            streak: data.streak,
            level: data.level,
            lastStudyDate: data.last_study_date,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            avatarUrl: data.avatar_url,
            timezone: data.timezone,
            languagePreference: data.language_preference,
            notificationSettings: data.notification_settings,
          };

          set({ user });
        } catch (error) {
          console.error('User refresh error:', error);
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'dsa-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Initialize auth state on app start
const initializeAuth = async () => {
  console.log('[AuthStore] Initializing auth...');
  const startTime = Date.now();
  
  try {
    // Add timeout protection
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Auth initialization timeout')), 10000);
    });

    const authPromise = (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('[AuthStore] Session found, refreshing user data...');
        // User is already signed in
        const { refreshUser } = useAuthStore.getState();
        
        // Add timeout to user refresh as well
        const refreshPromise = Promise.race([
          refreshUser(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('User refresh timeout')), 5000))
        ]);
        
        await refreshPromise;
        
        // ✅ Identify user with RevenueCat during app initialization
        try {
          await identifyRevenueCatUser(session.user.id);
        } catch (error) {
          console.warn('⚠️ Failed to identify RevenueCat user during initialization:', error);
        }
        
        // Load user progress data with timeout - FIXED: Use static import
        try {
          const { loadUserProgress } = useProgressStore.getState();
          
          const progressPromise = Promise.race([
            loadUserProgress(session.user.id),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Progress load timeout')), 5000))
          ]);
          
          await progressPromise;
        } catch (progressError) {
          console.warn('[AuthStore] Progress loading failed, continuing without progress data:', progressError);
        }
        
        useAuthStore.setState({ 
          isAuthenticated: true, 
          isLoading: false 
        });
      } else {
        console.log('[AuthStore] No session found');
        // No active session
        useAuthStore.setState({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
      }
    })();

    await Promise.race([authPromise, timeoutPromise]);
    
    const duration = Date.now() - startTime;
    console.log(`[AuthStore] Auth initialization completed in ${duration}ms`);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[AuthStore] Auth initialization failed after ${duration}ms:`, error);
    
    // Set auth state to allow app to continue
    useAuthStore.setState({ 
      user: null, 
      isAuthenticated: false, 
      isLoading: false 
    });
  }
};

// Initialize on app start with protection
const initWithRetry = async () => {
  let attempts = 0;
  const maxAttempts = 2;
  
  while (attempts < maxAttempts) {
    try {
      await initializeAuth();
      break;
    } catch (error) {
      attempts++;
      console.warn(`[AuthStore] Init attempt ${attempts} failed:`, error);
      
      if (attempts >= maxAttempts) {
        console.error('[AuthStore] Max init attempts reached, setting default state');
        useAuthStore.setState({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
      } else {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
};

// Start initialization but don't block app startup
initWithRetry();

// Listen for auth state changes
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('[AuthStore] Auth state change:', event);
  const { refreshUser, setLoading } = useAuthStore.getState();
  
  if (event === 'SIGNED_IN' && session?.user) {
    setLoading(true);
    
    try {
      // Add timeout protection to auth state change handlers too
      const refreshPromise = Promise.race([
        refreshUser(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('User refresh timeout')), 5000))
      ]);
      
      await refreshPromise;
      
      // ✅ Identify user with RevenueCat after session sign in
      try {
        await identifyRevenueCatUser(session.user.id);
      } catch (error) {
        console.warn('⚠️ Failed to identify RevenueCat user during session sign in:', error);
      }
      
      // Load user progress data with timeout - FIXED: Use static import
      try {
        const { loadUserProgress } = useProgressStore.getState();
        
        const progressPromise = Promise.race([
          loadUserProgress(session.user.id),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Progress load timeout')), 5000))
        ]);
        
        await progressPromise;
      } catch (progressError) {
        console.warn('[AuthStore] Progress loading failed during sign in:', progressError);
      }
    } catch (error) {
      console.error('[AuthStore] Error during sign in processing:', error);
    } finally {
      setLoading(false);
    }
  } else if (event === 'SIGNED_OUT') {
    try {
      // ✅ Log out from RevenueCat when auth session ends
      try {
        await logOutRevenueCatUser();
      } catch (error) {
        console.warn('⚠️ Failed to logout from RevenueCat during session sign out:', error);
      }

      // Clear progress store data - FIXED: Use static import
      const { clearUserProgress } = useProgressStore.getState();
      clearUserProgress();
    } catch (error) {
      console.warn('[AuthStore] Error clearing progress on sign out:', error);
    }
    
    useAuthStore.setState({ 
      user: null, 
      isAuthenticated: false, 
      isLoading: false 
    });
  }
});
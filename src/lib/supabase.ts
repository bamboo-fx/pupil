import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = 'https://sdzalnrwktsczeennlck.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkemFsbnJ3a3RzY3plZW5ubGNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2ODE1NjUsImV4cCI6MjA2NzI1NzU2NX0.g7GB2jKosTMvF6zWFWAKSLOz_yW1GYS6r71KJ3proR4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface DbUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  total_xp: number;
  streak: number;
  level: number;
  last_study_date: string;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  timezone?: string;
  language_preference?: string;
  notification_settings?: Record<string, boolean>;
}

export interface DbProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  unit_id: string;
  completed_at: string;
  xp_earned: number;
  questions_completed: string[];
  time_spent_seconds: number;
  accuracy_percentage: number;
  attempts_count: number;
}

export interface DbAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_id: string;
  unlocked_at: string;
  progress_value: number;
  is_completed: boolean;
  metadata?: Record<string, any>;
}

export interface DbUserStats {
  id: string;
  user_id: string;
  total_lessons_completed: number;
  total_questions_answered: number;
  total_time_spent_seconds: number;
  average_accuracy: number;
  longest_streak: number;
  current_streak: number;
  units_completed: number;
  favorite_topic?: string;
  last_activity_date: string;
  weekly_xp_goal: number;
  weekly_xp_earned: number;
}

export interface DbSession {
  id: string;
  user_id: string;
  lesson_id: string;
  started_at: string;
  completed_at?: string;
  questions_answered: number;
  correct_answers: number;
  xp_earned: number;
  duration_seconds: number;
  device_info?: Record<string, any>;
} 
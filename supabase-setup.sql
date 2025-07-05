-- Pupil Learning App - Supabase Database Setup
-- Run this script in your Supabase SQL editor to create all necessary tables

-- Enable Row Level Security (RLS) on auth.users
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create custom types
CREATE TYPE achievement_type AS ENUM ('progress', 'streak', 'xp', 'completion', 'skill');
CREATE TYPE requirement_type AS ENUM ('lessons_completed', 'xp_earned', 'streak_days', 'units_completed', 'questions_answered');

-- ====================================
-- USERS TABLE (Extended user profiles)
-- ====================================
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    total_xp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    last_study_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    avatar_url VARCHAR(500),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language_preference VARCHAR(10) DEFAULT 'en',
    notification_settings JSONB DEFAULT '{
        "daily_reminders": true,
        "achievement_notifications": true,
        "streak_reminders": true,
        "weekly_progress": true
    }'::jsonb
);

-- ====================================
-- USER STATS TABLE
-- ====================================
CREATE TABLE public.user_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    total_lessons_completed INTEGER DEFAULT 0,
    total_questions_answered INTEGER DEFAULT 0,
    total_time_spent_seconds INTEGER DEFAULT 0,
    average_accuracy DECIMAL(5,2) DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    units_completed INTEGER DEFAULT 0,
    favorite_topic VARCHAR(50),
    last_activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    weekly_xp_goal INTEGER DEFAULT 500,
    weekly_xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ====================================
-- LESSON PROGRESS TABLE
-- ====================================
CREATE TABLE public.lesson_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    lesson_id VARCHAR(100) NOT NULL,
    unit_id VARCHAR(100) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    xp_earned INTEGER DEFAULT 0,
    questions_completed INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    accuracy_percentage DECIMAL(5,2) DEFAULT 0,
    attempts_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- ACHIEVEMENTS TABLE
-- ====================================
CREATE TABLE public.achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    achievement_type achievement_type NOT NULL,
    achievement_id VARCHAR(100) NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress_value INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- ====================================
-- LEARNING SESSIONS TABLE
-- ====================================
CREATE TABLE public.learning_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    lesson_id VARCHAR(100) NOT NULL,
    unit_id VARCHAR(100) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    questions_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    duration_seconds INTEGER DEFAULT 0,
    device_info JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- QUESTION PROGRESS TABLE (Individual question tracking)
-- ====================================
CREATE TABLE public.question_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    lesson_id VARCHAR(100) NOT NULL,
    question_id VARCHAR(100) NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    time_spent_seconds INTEGER DEFAULT 0,
    attempts_count INTEGER DEFAULT 1,
    user_answer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id, question_id)
);

-- ====================================
-- USER PREFERENCES TABLE
-- ====================================
CREATE TABLE public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    daily_goal_xp INTEGER DEFAULT 50,
    reminder_time TIME DEFAULT '09:00:00',
    study_streak_goal INTEGER DEFAULT 7,
    difficulty_preference VARCHAR(20) DEFAULT 'adaptive',
    theme_preference VARCHAR(20) DEFAULT 'dark',
    sound_enabled BOOLEAN DEFAULT true,
    vibration_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ====================================
-- INDEXES for Performance
-- ====================================
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_streak ON public.users(streak DESC);
CREATE INDEX idx_users_total_xp ON public.users(total_xp DESC);
CREATE INDEX idx_users_level ON public.users(level DESC);

CREATE INDEX idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);
CREATE INDEX idx_lesson_progress_unit_id ON public.lesson_progress(unit_id);
CREATE INDEX idx_lesson_progress_completed_at ON public.lesson_progress(completed_at DESC);

CREATE INDEX idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX idx_achievements_type ON public.achievements(achievement_type);
CREATE INDEX idx_achievements_completed ON public.achievements(is_completed);

CREATE INDEX idx_user_stats_user_id ON public.user_stats(user_id);
CREATE INDEX idx_user_stats_activity ON public.user_stats(last_activity_date DESC);

CREATE INDEX idx_learning_sessions_user_id ON public.learning_sessions(user_id);
CREATE INDEX idx_learning_sessions_started_at ON public.learning_sessions(started_at DESC);

CREATE INDEX idx_question_progress_user_id ON public.question_progress(user_id);
CREATE INDEX idx_question_progress_lesson_id ON public.question_progress(lesson_id);

-- ====================================
-- ROW LEVEL SECURITY POLICIES
-- ====================================

-- Users table policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- User stats policies
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own stats" ON public.user_stats
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON public.user_stats
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can modify own stats" ON public.user_stats
    FOR UPDATE USING (auth.uid() = user_id);

-- Lesson progress policies
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress" ON public.lesson_progress
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.lesson_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.lesson_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Achievements policies
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own achievements" ON public.achievements
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own achievements" ON public.achievements
    FOR UPDATE USING (auth.uid() = user_id);

-- Learning sessions policies
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sessions" ON public.learning_sessions
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.learning_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.learning_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Question progress policies
ALTER TABLE public.question_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own question progress" ON public.question_progress
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own question progress" ON public.question_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own question progress" ON public.question_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- User preferences policies
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- ====================================
-- FUNCTIONS AND TRIGGERS
-- ====================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, first_name, last_name)
    VALUES (
        NEW.id, 
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
    
    -- Create initial user stats
    INSERT INTO public.user_stats (user_id)
    VALUES (NEW.id);
    
    -- Create initial user preferences
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update user level based on XP
CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate level based on XP (100 XP per level)
    NEW.level := GREATEST(1, (NEW.total_xp / 100) + 1);
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update level when XP changes
CREATE TRIGGER trigger_update_user_level
    BEFORE UPDATE OF total_xp ON public.users
    FOR EACH ROW EXECUTE PROCEDURE public.update_user_level();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON public.user_stats
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- ====================================
-- VIEWS FOR ANALYTICS AND REPORTING
-- ====================================

-- Leaderboard view
CREATE VIEW public.leaderboard AS
SELECT 
    u.id,
    u.full_name,
    u.total_xp,
    u.level,
    u.streak,
    u.avatar_url,
    us.total_lessons_completed,
    ROW_NUMBER() OVER (ORDER BY u.total_xp DESC) as rank
FROM public.users u
LEFT JOIN public.user_stats us ON u.id = us.user_id
ORDER BY u.total_xp DESC;

-- User progress summary view
CREATE VIEW public.user_progress_summary AS
SELECT 
    u.id,
    u.full_name,
    u.total_xp,
    u.level,
    u.streak,
    u.last_study_date,
    us.total_lessons_completed,
    us.total_questions_answered,
    us.average_accuracy,
    us.total_time_spent_seconds,
    COUNT(DISTINCT lp.unit_id) as units_started,
    COUNT(CASE WHEN a.is_completed = true THEN 1 END) as achievements_unlocked
FROM public.users u
LEFT JOIN public.user_stats us ON u.id = us.user_id
LEFT JOIN public.lesson_progress lp ON u.id = lp.user_id
LEFT JOIN public.achievements a ON u.id = a.user_id
GROUP BY u.id, u.full_name, u.total_xp, u.level, u.streak, u.last_study_date, 
         us.total_lessons_completed, us.total_questions_answered, 
         us.average_accuracy, us.total_time_spent_seconds;

-- ====================================
-- SAMPLE DATA (Optional - for testing)
-- ====================================

-- Insert default achievement definitions (these would be referenced by the app)
-- Note: In a real app, you might want a separate achievements_definitions table

COMMENT ON TABLE public.users IS 'Extended user profiles with learning progress';
COMMENT ON TABLE public.user_stats IS 'Aggregated statistics for each user';
COMMENT ON TABLE public.lesson_progress IS 'Individual lesson completion records';
COMMENT ON TABLE public.achievements IS 'User achievement unlocks';
COMMENT ON TABLE public.learning_sessions IS 'Individual learning session tracking';
COMMENT ON TABLE public.question_progress IS 'Individual question completion tracking';
COMMENT ON TABLE public.user_preferences IS 'User app preferences and settings';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Enable realtime for live updates (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lesson_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.achievements;

-- Success message
SELECT 'Pupil Learning App database setup completed successfully!' as message; 
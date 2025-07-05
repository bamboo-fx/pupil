# Supabase Setup Guide for Pupil Learning App

## Overview
This guide walks you through setting up Supabase for the Pupil learning app with comprehensive user tracking, progress management, and achievement systems.

## Prerequisites
- A Supabase account (supabase.com)
- Access to your Supabase project dashboard

## Setup Instructions

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization and give your project a name (e.g., "pupil-learning-app")
4. Set a strong database password
5. Choose your region
6. Click "Create new project"

### 2. Configure Your Project
1. Wait for your project to be created (usually takes 1-2 minutes)
2. Once ready, go to your project dashboard
3. Navigate to Settings > API
4. Copy your Project URL and anon public key

### 3. Update Your App Configuration
1. Open `src/lib/supabase.ts` in your project
2. Replace the placeholder values:
   ```typescript
   const supabaseUrl = 'YOUR_PROJECT_URL_HERE';
   const supabaseAnonKey = 'YOUR_ANON_KEY_HERE';
   ```

### 4. Run the Database Setup Script
1. In your Supabase dashboard, go to the SQL Editor
2. Copy the entire contents of `supabase-setup.sql`
3. Paste it into the SQL Editor
4. Click "Run" to execute the script
5. You should see "Pupil Learning App database setup completed successfully!" message

### 5. Verify Setup
1. Go to Table Editor in your Supabase dashboard
2. You should see the following tables:
   - `users` - Extended user profiles
   - `user_stats` - User statistics and analytics
   - `lesson_progress` - Individual lesson completions
   - `achievements` - User achievement unlocks
   - `learning_sessions` - Learning session tracking
   - `question_progress` - Individual question tracking
   - `user_preferences` - User app preferences

### 6. Enable Authentication (Optional)
1. Go to Authentication > Settings
2. Configure your authentication providers (email, Google, etc.)
3. Update your redirect URLs if needed

## Database Schema Overview

### Core Tables

#### `users`
- Extended user profiles with learning data
- Tracks: email, names, XP, streak, level, study dates
- Auto-generated full_name field
- Supports avatars, timezone, language preferences

#### `user_stats`
- Aggregated statistics for analytics
- Tracks: lessons completed, questions answered, accuracy, time spent
- Weekly goals and progress tracking

#### `lesson_progress`
- Individual lesson completion records
- Tracks: completion time, XP earned, accuracy, attempts
- Links lessons to units for progress tracking

#### `achievements`
- User achievement unlocks
- Flexible system supporting different achievement types
- Progress tracking for partial achievements

#### `learning_sessions`
- Individual learning session tracking
- Detailed analytics for each study session
- Device information for usage patterns

#### `question_progress`
- Individual question completion tracking
- Supports retries and time tracking
- Stores user answers for analysis

#### `user_preferences`
- User app preferences and settings
- Daily goals, reminder times, theme preferences
- Notification and accessibility settings

### Security Features

#### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Automatic policy enforcement

#### Auto-triggers
- User level auto-updates based on XP
- Automatic timestamp management
- New user initialization

### Analytics Views

#### `leaderboard`
- Global ranking by XP
- Includes user stats for comparison

#### `user_progress_summary`
- Comprehensive progress overview
- Aggregated statistics across all tables

## Features Implemented

### ✅ Complete User Management
- Supabase authentication integration
- Extended user profiles with learning data
- Automatic user initialization

### ✅ Progress Tracking
- Lesson completion tracking
- XP and level system
- Streak maintenance
- Unit progress tracking

### ✅ Achievement System
- Flexible achievement framework
- Progress tracking for partial achievements
- XP rewards for achievement unlocks
- Multiple achievement types (progress, streak, XP, completion)

### ✅ Analytics & Insights
- Detailed session tracking
- Question-level analytics
- User statistics aggregation
- Performance metrics

### ✅ Data Security
- Row Level Security (RLS) policies
- User data isolation
- Secure authentication

### ✅ Real-time Updates
- Live progress updates
- Achievement notifications
- Leaderboard updates

## Environment Variables

Add these to your `.env` file:
```
SUPABASE_URL=your_project_url_here
SUPABASE_ANON_KEY=your_anon_key_here
```

## Testing the Integration

1. Start your React Native app
2. Try signing up with a new account
3. Complete a lesson to test progress tracking
4. Check the Supabase dashboard to see data being created
5. Test achievement unlocks by completing lessons

## Troubleshooting

### Common Issues

1. **"relation does not exist" errors**
   - Make sure you ran the full SQL setup script
   - Check that all tables were created in the Table Editor

2. **Authentication errors**
   - Verify your Supabase URL and anon key are correct
   - Check that authentication is enabled in your Supabase project

3. **Permission denied errors**
   - Ensure RLS policies are set up correctly
   - Check that users are properly authenticated

4. **Data not syncing**
   - Verify internet connection
   - Check Supabase project status
   - Look for console errors in your app

### Support
- Check the [Supabase Documentation](https://supabase.com/docs)
- Join the [Supabase Discord](https://discord.supabase.com)
- Review your app's console logs for specific error messages

## Next Steps

Once setup is complete, your app will have:
- Full user authentication and profiles
- Real-time progress tracking
- Achievement system
- Comprehensive analytics
- Secure data storage

All user data will be automatically synced to Supabase, providing a robust backend for your learning app! 
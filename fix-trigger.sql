-- Fix Supabase trigger conflict
-- Run this in your Supabase SQL Editor to fix the signup error

-- Drop the conflicting trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function as well since we're handling user creation manually
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Success message
SELECT 'Trigger conflict fixed - signup should work now!' as message; 
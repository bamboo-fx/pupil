-- Cleanup script for orphaned data from deleted accounts
-- This script helps clean up any leftover data from deleted accounts

-- Find orphaned user_stats (users that exist in user_stats but not in auth.users)
SELECT 
    us.user_id,
    us.total_lessons_completed,
    us.created_at
FROM user_stats us
LEFT JOIN auth.users au ON us.user_id = au.id
WHERE au.id IS NULL;

-- Find orphaned users (users that exist in public.users but not in auth.users)
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.created_at
FROM public.users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE au.id IS NULL;

-- Clean up orphaned user_stats records
DELETE FROM user_stats
WHERE user_id NOT IN (
    SELECT id FROM auth.users
);

-- Clean up orphaned users records
DELETE FROM public.users
WHERE id NOT IN (
    SELECT id FROM auth.users
);

-- Verify cleanup
SELECT COUNT(*) as remaining_user_stats FROM user_stats;
SELECT COUNT(*) as remaining_users FROM public.users;
SELECT COUNT(*) as auth_users FROM auth.users; 
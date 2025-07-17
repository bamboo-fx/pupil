-- Migration to add subscription fields to existing users table
-- Run this script in your Supabase SQL editor to add subscription tracking

-- Add subscription columns to users table
ALTER TABLE public.users 
ADD COLUMN subscription_status VARCHAR(20) CHECK (subscription_status IN ('active', 'expired', 'cancelled')),
ADD COLUMN subscription_type VARCHAR(20) CHECK (subscription_type IN ('monthly', 'annual')),
ADD COLUMN subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN revenuecat_user_id VARCHAR(255);

-- Add index for better performance on subscription queries
CREATE INDEX idx_users_subscription_status ON public.users(subscription_status);
CREATE INDEX idx_users_revenuecat_user_id ON public.users(revenuecat_user_id);

-- Add comment for documentation
COMMENT ON COLUMN public.users.subscription_status IS 'Current subscription status: active, expired, or cancelled';
COMMENT ON COLUMN public.users.subscription_type IS 'Type of subscription: monthly or annual';
COMMENT ON COLUMN public.users.subscription_start_date IS 'When the subscription started';
COMMENT ON COLUMN public.users.subscription_end_date IS 'When the subscription ends/ended';
COMMENT ON COLUMN public.users.revenuecat_user_id IS 'RevenueCat user ID for subscription management'; 
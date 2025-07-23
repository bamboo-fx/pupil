-- Migration to update subscription fields from RevenueCat to Stripe
-- Run this script in your Supabase SQL editor to migrate to Stripe

-- Rename revenuecat_user_id column to stripe_customer_id
ALTER TABLE public.users 
RENAME COLUMN revenuecat_user_id TO stripe_customer_id;

-- Update the comment for the new column
COMMENT ON COLUMN public.users.stripe_customer_id IS 'Stripe customer ID for subscription management';

-- Update the index name
DROP INDEX IF EXISTS idx_users_revenuecat_user_id;
CREATE INDEX idx_users_stripe_customer_id ON public.users(stripe_customer_id);

-- Success message
SELECT 'Database migration from RevenueCat to Stripe completed successfully!' as message; 
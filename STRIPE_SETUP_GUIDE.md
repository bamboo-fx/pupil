# Complete Stripe Integration Setup Guide

This guide will walk you through setting up the Stripe integration for your Pupil app. The integration is now complete and styled, but needs your Stripe credentials to work.

## ✅ What's Already Done

- ✅ Beautiful, modern PaywallScreen with improved UI
- ✅ Complete backend server with Express.js
- ✅ Stripe payment processing with webhooks
- ✅ Correct pricing: Monthly $8.99, Annual $59.99
- ✅ All Supabase integration code
- ✅ Error handling and security features

## 🚀 Quick Setup (5 steps)

### Step 1: Get Your Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create an account or log in
3. Get your keys from **Developers > API keys**:
   - **Publishable key** (starts with `pk_test_` for test mode)
   - **Secret key** (starts with `sk_test_` for test mode)

### Step 2: Set Up Products in Stripe

**Option A: Automatic Setup (Recommended)**
```bash
# In the root directory
export STRIPE_SECRET_KEY=sk_test_your_secret_key_here
node setup-stripe-products.js
```

**Option B: Manual Setup**
1. Go to **Products** in Stripe Dashboard
2. Create two products:
   - **Monthly Premium**: $8.99/month recurring
   - **Annual Premium**: $59.99/year recurring
3. Save the Price IDs (start with `price_`)

### Step 3: Configure Backend Environment

Create `backend/.env`:
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_MONTHLY_PRICE_ID=price_your_monthly_price_id
STRIPE_ANNUAL_PRICE_ID=price_your_annual_price_id

# Supabase Configuration  
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Step 4: Update App Configuration

In `src/config/stripe.ts`, replace the placeholder keys:
```typescript
publishableKey: __DEV__ 
  ? 'pk_test_your_actual_test_key_here'
  : 'pk_live_your_actual_live_key_here',
```

### Step 5: Start Everything

```bash
# Start backend server
cd backend
npm install
npm run dev

# In another terminal, start the app
cd ..
npm start
```

## 🔧 Advanced Setup

### Database Migration

Run this SQL in your Supabase SQL editor:
```sql
-- Add subscription fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_type TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
```

### Webhook Setup

1. Go to **Developers > Webhooks** in Stripe Dashboard
2. Add endpoint: `https://your-server.com/webhook`
3. Select these events:
   - `payment_intent.succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook secret to your `.env` file

### Production Deployment

1. **Deploy Backend**: Use Railway, Heroku, or AWS
2. **Update URLs**: Change `backendUrl` in `stripe.ts`
3. **Switch to Live Mode**: Use live keys instead of test keys
4. **Update Webhooks**: Point to production URL

## 🧪 Testing

### Test the Payment Flow

1. Start the backend server
2. Open the app and navigate to the paywall
3. Try purchasing with Stripe test cards:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - Use any future date for expiry and any CVC

### Verify Database Updates

After a successful test purchase, check your Supabase users table:
```sql
SELECT subscription_status, subscription_type, subscription_start_date 
FROM users 
WHERE id = 'your_test_user_id';
```

## 🎨 UI Features

The new PaywallScreen includes:

- ✨ **Beautiful gradient backgrounds**
- 📱 **Modern blur effects and cards**
- 🔄 **Plan toggle** (Monthly/Annual)
- 💰 **Clear pricing display**
- ⭐ **Feature highlights**
- 🔒 **Security badges**
- 📱 **Responsive design**
- ⚡ **Loading states**
- 🎯 **Call-to-action buttons**

## 📊 Features Included

- **Advanced Coding Questions**: Algorithm challenges
- **AI-Powered Explanations**: Detailed concept explanations  
- **Progress Tracking**: Learning journey tracking
- **Unlimited Access**: No limits on usage
- **Ad-Free Experience**: Uninterrupted learning
- **Priority Support**: Premium customer support

## 🔒 Security Features

- ✅ **Webhook signature verification**
- ✅ **Rate limiting** (100 requests/15min)
- ✅ **CORS protection**
- ✅ **Environment variable configuration**
- ✅ **Input validation**
- ✅ **Error handling**

## 🛠️ Troubleshooting

### Common Issues

**"Unable to load subscription options"**
- Check that backend is running on port 3000
- Verify STRIPE_SECRET_KEY is set correctly
- Ensure products exist in Stripe Dashboard

**"Payment failed"**
- Check webhook is receiving events
- Verify STRIPE_WEBHOOK_SECRET is correct
- Check backend logs for errors

**"Subscription not updating in app"**
- Verify Supabase connection
- Check SUPABASE_SERVICE_ROLE_KEY
- Ensure user ID matches between systems

### Debug Mode

Enable detailed logging:
```bash
# In backend/.env
NODE_ENV=development
```

Check backend logs for detailed error messages.

### Test Cards

Use these Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Authentication Required**: `4000 0025 0000 3155`
- **Declined**: `4000 0000 0000 0002`

## 📱 Platform Support

- ✅ **iOS**: Full support with Apple Pay
- ✅ **Android**: Full support with Google Pay
- ⚠️ **Expo Go**: Limited (no Apple/Google Pay)
- ✅ **Development Build**: Recommended for full features

## 🚀 Going Live

### Pre-launch Checklist

- [ ] Test payment flow end-to-end
- [ ] Verify webhook is working
- [ ] Test subscription status updates
- [ ] Test restore purchases
- [ ] Deploy backend to production
- [ ] Switch to live Stripe keys
- [ ] Update webhook endpoint
- [ ] Test with real payment methods

### App Store Requirements

Update your App Store listing:
- Add subscription pricing
- Include subscription terms
- Add privacy policy link
- Include terms of service

## 📞 Support

If you need help:
1. Check the logs in your backend
2. Verify all environment variables
3. Test with Stripe's test cards
4. Check webhook events in Stripe Dashboard

The integration is now complete and ready to process real payments! 🎉 
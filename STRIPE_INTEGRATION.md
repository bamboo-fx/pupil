# Stripe Integration

This document outlines the migration from RevenueCat to Stripe for payment processing.

## ✅ What's Included

### 🗄️ **Database Schema Changes**
Updated subscription fields in the `users` table:
- `subscription_status` - 'active', 'expired', 'cancelled', or null
- `subscription_type` - 'monthly', 'annual', or null  
- `subscription_start_date` - When subscription started
- `subscription_end_date` - When subscription ends/ended
- `stripe_customer_id` - Stripe customer ID for linking (renamed from revenuecat_user_id)

### 📱 **App Features**
- **Stripe Payment Sheet**: Native payment UI with Apple Pay and Google Pay support
- **Automatic Sync**: Subscription status syncs with Supabase after purchase
- **Real-time Updates**: User profile includes subscription info
- **Manual Sync**: `syncSubscriptionWithSupabase()` function available
- **Status Management**: Track subscription lifecycle

## 🚀 Setup Instructions

### 1. **Install Dependencies**
```bash
npx expo install @stripe/stripe-react-native
```

### 2. **Update App Configuration**
Add the Stripe plugin to your `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "@stripe/stripe-react-native",
        {
          "merchantIdentifier": "merchant.com.dwang88.vibecode",
          "enableGooglePay": true,
          "enableApplePay": true
        }
      ]
    ]
  }
}
```

### 3. **Run Database Migration**
Run the migration script in your Supabase SQL editor:
```sql
-- Copy and paste the contents of migrate-to-stripe.sql
```

### 4. **Update Stripe Configuration**
Edit `src/config/stripe.ts` and add your Stripe publishable key:

```typescript
export const STRIPE_CONFIG = {
  publishableKey: 'pk_live_your_actual_publishable_key_here', // Replace with your actual key
  merchantIdentifier: 'merchant.com.dwang88.vibecode',
  urlScheme: 'vibecode',
};
```

### 5. **Backend Setup Required**
You'll need to set up a backend service to:
- Create payment intents
- Handle webhook events
- Manage subscription lifecycles

Example endpoint needed:
```typescript
POST /create-payment-intent
{
  "price_id": "price_1234567890",
  "customer_id": "user_uuid"
}
```

## 🔧 Available Functions

### **AuthStore Methods**
```typescript
// Sync Stripe subscription with Supabase
await syncSubscriptionWithSupabase();

// Check subscription status
await checkSubscriptionStatus(userId);
```

### **Stripe Functions**
```typescript
// Purchase a subscription
const result = await purchaseSubscription(productId, userId);

// Get user subscription details
const subscription = await getUserSubscription(userId);

// Get available products
const products = await getAvailableProducts();
```

## 📊 User Object Structure

The `User` interface now includes:
```typescript
interface User {
  // ... existing fields
  subscriptionStatus?: 'active' | 'expired' | 'cancelled' | null;
  subscriptionType?: 'monthly' | 'annual' | null;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  stripeCustomerId?: string; // Changed from revenuecatUserId
}
```

## 🔄 How It Works

### **Purchase Flow**
1. User selects a subscription plan
2. Stripe Payment Sheet is presented
3. User completes payment (credit card, Apple Pay, Google Pay)
4. Payment intent succeeds
5. `syncSubscriptionWithSupabase()` automatically called
6. Subscription data saved to Supabase
7. User object updated with subscription info

### **Payment Methods Supported**
- **Credit/Debit Cards**: All major cards
- **Apple Pay**: iOS devices (requires development build)
- **Google Pay**: Android devices (requires development build)
- **Bank Transfers**: Depending on your Stripe configuration

### **Subscription Management**
- **Active**: User has active subscription
- **Expired**: User had subscription but it's no longer active
- **Cancelled**: User cancelled subscription
- **Null**: User never had a subscription

## 🎯 Benefits Over RevenueCat

### **Cost Savings**
- No RevenueCat subscription fees
- Direct Stripe processing rates
- More transparent pricing

### **Flexibility**
- Full control over payment flow
- Custom subscription logic
- Direct Stripe dashboard access

### **Performance**
- Fewer third-party dependencies
- Native Stripe integration
- Better error handling

## 📈 Usage Examples

### **Check Subscription Status**
```typescript
const { user } = useAuthStore();
const isSubscribed = user?.subscriptionStatus === 'active';
```

### **Feature Gating**
```typescript
const PremiumFeature = () => {
  const { user } = useAuthStore();
  
  if (user?.subscriptionStatus !== 'active') {
    return <UpgradePrompt />;
  }
  
  return <PremiumContent />;
};
```

### **Manual Subscription Sync**
```typescript
const { syncSubscriptionWithSupabase } = useAuthStore();
await syncSubscriptionWithSupabase();
```

## 🛠️ Backend Implementation

You'll need to implement these backend endpoints:

### **1. Create Payment Intent**
```typescript
POST /create-payment-intent
{
  "price_id": "price_monthly_subscription",
  "customer_id": "user_uuid"
}

Response:
{
  "client_secret": "pi_1234567890_secret_abcdef",
  "customer_id": "cus_1234567890"
}
```

### **2. Webhook Handler**
```typescript
POST /stripe-webhook
// Handle subscription events:
// - invoice.payment_succeeded
// - customer.subscription.created
// - customer.subscription.updated
// - customer.subscription.deleted
```

### **3. Subscription Management**
```typescript
GET /subscription/:userId
POST /cancel-subscription
POST /update-subscription
```

## 🔐 Security Considerations

1. **Never expose secret keys** in your mobile app
2. **Use webhooks** for critical subscription events
3. **Validate payments** on your backend
4. **Implement proper error handling**
5. **Log all transactions** for debugging

## 📱 Platform Support

- **iOS**: Full support with Apple Pay
- **Android**: Full support with Google Pay
- **Expo Go**: Limited support (no Apple Pay/Google Pay)
- **Development Build**: Required for full payment method support

## 🆘 Troubleshooting

### **Common Issues**
1. **Payment Sheet not showing**: Check publishable key
2. **Apple Pay not working**: Ensure merchant identifier is correct
3. **Purchase fails**: Check backend payment intent creation
4. **Subscription not syncing**: Verify webhook endpoints

### **Debug Mode**
Enable Stripe debug mode in development:
```typescript
// In stripe.ts
const stripe = new Stripe(publishableKey, {
  testMode: __DEV__,
});
```

## 📋 Migration Checklist

- [x] Install Stripe dependencies
- [x] Update app.json with Stripe plugin
- [x] Create new Stripe configuration
- [x] Update AuthStore to use Stripe functions
- [x] Update UI components (PaywallScreen, SubscriptionInfoScreen)
- [x] Remove RevenueCat dependencies
- [ ] Run database migration
- [ ] Update Stripe configuration with real keys
- [ ] Set up backend payment processing
- [ ] Test payment flow
- [ ] Update App Store/Play Store metadata

## 🎉 Ready for Production

Your app now uses Stripe for payment processing! Make sure to:
1. Update your Stripe configuration with production keys
2. Set up proper backend infrastructure
3. Test the complete payment flow
4. Monitor transactions in Stripe dashboard 
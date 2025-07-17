# RevenueCat-Supabase Integration

This integration automatically syncs RevenueCat subscription data with your Supabase user profiles.

## ✅ What's Included

### 🗄️ **Database Schema**
Added subscription fields to the `users` table:
- `subscription_status` - 'active', 'expired', 'cancelled', or null
- `subscription_type` - 'monthly', 'annual', or null  
- `subscription_start_date` - When subscription started
- `subscription_end_date` - When subscription ends/ended
- `revenuecat_user_id` - RevenueCat user ID for linking

### 📱 **App Features**
- **Automatic Sync**: Subscription status syncs with Supabase after purchase
- **Real-time Updates**: User profile includes subscription info
- **Manual Sync**: `syncSubscriptionWithSupabase()` function available
- **Status Management**: Track subscription lifecycle

## 🚀 Setup Instructions

### 1. **Run Database Migration**
If you have an existing database, run this in your Supabase SQL editor:

```sql
-- Copy and paste the contents of add-subscription-fields.sql
```

### 2. **For New Installations**
The updated `supabase-setup.sql` already includes subscription fields.

### 3. **App Usage**
The integration works automatically:
- Purchase flow syncs subscription to Supabase
- User login loads subscription data
- AuthStore includes subscription methods

## 🔧 Available Functions

### **AuthStore Methods**
```typescript
// Sync RevenueCat subscription with Supabase
await syncSubscriptionWithSupabase();

// Manually update subscription status
await updateSubscriptionStatus('active', 'monthly');
```

### **Direct Database Functions**
```typescript
// Update user subscription in Supabase
await updateUserSubscription(userId, {
  status: 'active',
  type: 'monthly',
  startDate: new Date().toISOString(),
  revenueCatUserId: 'revenue_cat_user_id'
});

// Get user subscription from Supabase
const result = await getUserSubscription(userId);
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
  revenueCatUserId?: string;
}
```

## 🔄 How It Works

### **Purchase Flow**
1. User purchases subscription through RevenueCat
2. Purchase completes successfully
3. `syncSubscriptionWithSupabase()` automatically called
4. RevenueCat customer info fetched
5. Subscription data saved to Supabase
6. User object updated with subscription info

### **Login Flow**
1. User logs in
2. User profile loaded from Supabase
3. Subscription fields included in User object
4. App has access to subscription status

### **Subscription Status Detection**
- **Active**: User has active 'premium' entitlement in RevenueCat
- **Expired**: User had subscription but it's no longer active
- **Cancelled**: User cancelled subscription
- **Null**: User never had a subscription

## 🎯 Benefits

### **For Developers**
- ✅ Single source of truth for user data
- ✅ Offline access to subscription status
- ✅ Database queries for subscription analytics
- ✅ Easy subscription-based feature gating

### **For Users**
- ✅ Consistent subscription status across devices
- ✅ Subscription info in user profile
- ✅ Better user experience with cached data

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

### **Subscription Analytics**
```sql
-- Get subscription stats
SELECT 
  subscription_status,
  subscription_type,
  COUNT(*) as user_count
FROM users 
WHERE subscription_status IS NOT NULL
GROUP BY subscription_status, subscription_type;
```

## 🔍 Troubleshooting

### **Subscription Not Syncing**
1. Check RevenueCat API key is correct
2. Verify 'premium' entitlement exists in RevenueCat
3. Check console logs for sync errors
4. Manually call `syncSubscriptionWithSupabase()`

### **Database Errors**
1. Ensure migration was run correctly
2. Check Supabase RLS policies allow updates
3. Verify user table exists and has correct columns

## 🔒 Security

- RLS policies ensure users can only update their own subscription data
- RevenueCat user ID helps prevent subscription fraud
- Subscription status validated against RevenueCat on sync

## 📞 Support

The integration is designed to be:
- **Automatic**: Works without manual intervention
- **Resilient**: Handles errors gracefully
- **Efficient**: Only syncs when necessary

Your subscription data is now fully integrated between RevenueCat and Supabase! 🎉 
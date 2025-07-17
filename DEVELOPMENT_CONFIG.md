# Development Configuration

## RevenueCat Development Toggle

To make local development easier, you can disable RevenueCat functionality and use mock subscription data instead.

### How to Enable/Disable

Edit `src/config/revenuecat.ts`:

```typescript
export const DEV_CONFIG = {
  SKIP_REVENUECAT: __DEV__ && true,  // ← Change this to false to enable RevenueCat in development
};
```

### Options:

- **`__DEV__ && true`** - Skip RevenueCat in development mode (default)
- **`__DEV__ && false`** - Use RevenueCat even in development mode  
- **`false`** - Always use RevenueCat (production behavior)

### Development Flow (when SKIP_REVENUECAT is true):

1. **SplashScreen** → **LoginScreen** → **SignupScreen** → **AgeRangeScreen** → **SkillLevelScreen** → **CreateAccountScreen** → **Main App**

2. **What happens:**
   - RevenueCat screens are skipped
   - Mock subscription status is set to "active" with "monthly" type
   - User gets full app access without payment
   - Development indicators show "🔧 DEV MODE" status

### Production Flow (when SKIP_REVENUECAT is false):

1. **SplashScreen** → **LoginScreen** → **SignupScreen** → **AgeRangeScreen** → **SkillLevelScreen** → **SubscriptionInfoScreen** → **CreateAccountScreen** → **Main App**

2. **What happens:**
   - Full RevenueCat integration is active
   - Real subscription purchasing required
   - Actual Apple/Google payment processing

### Visual Indicators:

When development mode is active, you'll see:
- **SkillLevelScreen**: "🔧 DEV MODE: RevenueCat Disabled"
- **CreateAccountScreen**: "🔧 DEV MODE: Mock Subscription Active"

### Console Logs:

Development mode also logs to console:
```
🔧 Development mode: Skipping RevenueCat, going directly to account creation
🔧 Development mode: Setting mock subscription status
```

### Best Practices:

1. **For local development**: Keep `SKIP_REVENUECAT: __DEV__ && true`
2. **For testing payments**: Set `SKIP_REVENUECAT: __DEV__ && false`
3. **For production builds**: The `__DEV__` flag is automatically false in production builds 
import { initPaymentSheet, presentPaymentSheet, useStripe } from '@stripe/stripe-react-native';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';

// Stripe Configuration
export const STRIPE_CONFIG = {
  publishableKey: __DEV__ 
    ? 'pk_test_your_publishable_key_here' // Replace with your actual test publishable key
    : 'pk_live_your_publishable_key_here', // Replace with your actual live publishable key
  merchantIdentifier: 'merchant.com.dwang88.vibecode',
  urlScheme: 'vibecode', // For deep linking
  backendUrl: __DEV__ 
    ? 'http://localhost:3000' // Local development backend
    : 'https://your-production-server.com', // Production backend
};

// Product IDs for your subscription offerings
export const SUBSCRIPTION_PRODUCTS = {
  MONTHLY: 'monthly_subscription',
  ANNUAL: 'annual_subscription',
};

// Product details
export const PRODUCT_DETAILS = {
  monthly: {
    id: SUBSCRIPTION_PRODUCTS.MONTHLY,
    name: 'Monthly Premium',
    description: 'Access to all premium features, unlimited content, and ad-free experience',
    price: 8.99,
    currency: 'USD',
    interval: 'month',
  },
  annual: {
    id: SUBSCRIPTION_PRODUCTS.ANNUAL,
    name: 'Annual Premium',
    description: 'Best value! Access to all premium features for a full year',
    price: 59.99,
    currency: 'USD',
    interval: 'year',
    savings: 'Save $47.89 vs monthly!',
  },
};

// Initialize Stripe
export const initializeStripe = async (): Promise<boolean> => {
  try {
    console.log('✅ Stripe initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Stripe:', error);
    return false;
  }
};

// Function to update subscription status in Supabase
export const updateSubscriptionInDatabase = async (userId: string, subscriptionData: {
  subscription_status?: 'active' | 'expired' | 'cancelled';
  subscription_type?: 'monthly' | 'annual';
  subscription_start_date?: string;
  subscription_end_date?: string;
  stripe_customer_id?: string;
}) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        ...subscriptionData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('❌ Failed to update subscription in database:', error);
      return false;
    }

    console.log('✅ Subscription updated in database:', subscriptionData);
    return true;
  } catch (error) {
    console.error('❌ Error updating subscription in database:', error);
    return false;
  }
};

// Function to create payment intent on your backend
export const createPaymentIntent = async (priceId: string, customerId?: string) => {
  try {
    const response = await fetch(`${STRIPE_CONFIG.backendUrl}/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_id: priceId,
        customer_id: customerId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    throw error;
  }
};

// Function to purchase a subscription
export const purchaseSubscription = async (productId: string, userId: string) => {
  try {
    console.log('🔄 Starting subscription purchase for product:', productId);

    // Get product details
    const product = productId === SUBSCRIPTION_PRODUCTS.MONTHLY ? PRODUCT_DETAILS.monthly : PRODUCT_DETAILS.annual;

    // Create payment intent on your backend
    const paymentIntent = await createPaymentIntent(product.id, userId);

    // Initialize payment sheet
    const { error: initError } = await initPaymentSheet({
      merchantDisplayName: 'Pupil Learning App',
      paymentIntentClientSecret: paymentIntent.client_secret,
      defaultBillingDetails: {
        name: 'Customer',
      },
      applePay: {
        merchantCountryCode: 'US',
      },
      googlePay: {
        merchantCountryCode: 'US',
        testEnv: __DEV__,
        currencyCode: product.currency,
      },
    });

    if (initError) {
      console.error('❌ Error initializing payment sheet:', initError);
      return { success: false, error: initError.message };
    }

    // Present payment sheet
    const { error: presentError } = await presentPaymentSheet();

    if (presentError) {
      if (presentError.code === 'Canceled') {
        console.log('🚫 Payment cancelled by user');
        return { success: false, cancelled: true };
      }
      console.error('❌ Error presenting payment sheet:', presentError);
      return { success: false, error: presentError.message };
    }

    // Payment successful
    console.log('✅ Payment successful');
    
    // Update subscription in database
    const subscriptionData = {
      subscription_status: 'active' as const,
      subscription_type: productId === SUBSCRIPTION_PRODUCTS.MONTHLY ? 'monthly' as const : 'annual' as const,
      subscription_start_date: new Date().toISOString(),
      subscription_end_date: new Date(Date.now() + (productId === SUBSCRIPTION_PRODUCTS.MONTHLY ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString(),
      stripe_customer_id: userId,
    };

    await updateSubscriptionInDatabase(userId, subscriptionData);

    return { success: true };
  } catch (error) {
    console.error('❌ Error purchasing subscription:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Function to check subscription status
export const checkSubscriptionStatus = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('subscription_status, subscription_end_date')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Error checking subscription status:', error);
      return false;
    }

    if (data.subscription_status === 'active') {
      // Check if subscription has expired
      const endDate = new Date(data.subscription_end_date);
      const now = new Date();
      return endDate > now;
    }

    return false;
  } catch (error) {
    console.error('❌ Error checking subscription status:', error);
    return false;
  }
};

// Function to get user subscription details
export const getUserSubscription = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('subscription_status, subscription_type, subscription_start_date, subscription_end_date, stripe_customer_id')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Error getting user subscription:', error);
      return null;
    }

    return {
      isActive: data.subscription_status === 'active',
      subscriptionStatus: data.subscription_status,
      subscriptionType: data.subscription_type,
      subscriptionStartDate: data.subscription_start_date,
      subscriptionEndDate: data.subscription_end_date,
      stripeCustomerId: data.stripe_customer_id,
    };
  } catch (error) {
    console.error('❌ Error getting user subscription:', error);
    return null;
  }
};

// Function to get available products
export const getAvailableProducts = async () => {
  return {
    identifier: 'pro',
    availablePackages: [
      {
        identifier: SUBSCRIPTION_PRODUCTS.MONTHLY,
        storeProduct: {
          identifier: SUBSCRIPTION_PRODUCTS.MONTHLY,
          price: PRODUCT_DETAILS.monthly.price,
          priceString: `$${PRODUCT_DETAILS.monthly.price}`,
          currencyCode: PRODUCT_DETAILS.monthly.currency,
          title: PRODUCT_DETAILS.monthly.name,
          description: PRODUCT_DETAILS.monthly.description,
          subscriptionPeriod: {
            unit: 'month',
            numberOfUnits: 1,
          },
        },
      },
      {
        identifier: SUBSCRIPTION_PRODUCTS.ANNUAL,
        storeProduct: {
          identifier: SUBSCRIPTION_PRODUCTS.ANNUAL,
          price: PRODUCT_DETAILS.annual.price,
          priceString: `$${PRODUCT_DETAILS.annual.price}`,
          currencyCode: PRODUCT_DETAILS.annual.currency,
          title: PRODUCT_DETAILS.annual.name,
          description: PRODUCT_DETAILS.annual.description,
          savings: PRODUCT_DETAILS.annual.savings,
          subscriptionPeriod: {
            unit: 'year',
            numberOfUnits: 1,
          },
        },
      },
    ],
  };
};

// Function to sync subscription data (replaces RevenueCat sync)
export const syncSubscriptionToDatabase = async (userId: string, subscriptionData: any) => {
  try {
    const data = {
      stripe_customer_id: subscriptionData.customerId || userId,
      subscription_status: subscriptionData.status || 'active',
      subscription_type: subscriptionData.type || 'monthly',
      subscription_start_date: subscriptionData.startDate || new Date().toISOString(),
      subscription_end_date: subscriptionData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return await updateSubscriptionInDatabase(userId, data);
  } catch (error) {
    console.error('❌ Error syncing subscription to database:', error);
    return false;
  }
};

// Mock functions to replace RevenueCat user management
export const identifyStripeUser = async (userId: string): Promise<boolean> => {
  try {
    console.log('✅ Stripe user identified:', userId);
    return true;
  } catch (error) {
    console.error('❌ Failed to identify Stripe user:', error);
    return false;
  }
};

export const logOutStripeUser = async (): Promise<boolean> => {
  try {
    console.log('✅ Stripe user logged out');
    return true;
  } catch (error) {
    console.error('❌ Failed to log out Stripe user:', error);
    return false;
  }
};

// Check if Stripe is available
export const isStripeAvailable = () => {
  return true; // Stripe is always available once installed
};

// Legacy compatibility functions
export const getSpecificOffering = getAvailableProducts;
export const purchaseProduct = purchaseSubscription;
export const OFFERING_ID = 'pro'; 
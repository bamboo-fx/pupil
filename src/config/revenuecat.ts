import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

// Conditional import - only import if available
let Purchases: any = null;
let PurchasesOffering: any = null;
let PurchasesStoreProduct: any = null;
let CustomerInfo: any = null;

try {
  const purchasesModule = require('react-native-purchases');
  Purchases = purchasesModule.default;
  PurchasesOffering = purchasesModule.PurchasesOffering;
  PurchasesStoreProduct = purchasesModule.PurchasesStoreProduct;
  CustomerInfo = purchasesModule.CustomerInfo;
} catch (error) {
  console.warn('⚠️ RevenueCat not available - using mock mode');
}

// RevenueCat Configuration - Production Ready
const API_KEYS = {
  ios: 'appl_JSZfUEpzwgbXUoaLuvBlsutWjsr', // ✅ REAL API KEY ADDED
};

export const OFFERING_ID = 'pro'; // Your RevenueCat Offering ID

// Product IDs for your subscription offerings
export const PRODUCT_IDS = {
  MONTHLY: 'com.dwang88.vibecode.Monthly',
  ANNUAL: 'com.dwang88.vibecode.yearly',
};

// Function to update subscription status in Supabase
export const updateSubscriptionInDatabase = async (userId: string, subscriptionData: {
  subscription_status?: 'active' | 'expired' | 'cancelled';
  subscription_type?: 'monthly' | 'annual';
  subscription_start_date?: string;
  subscription_end_date?: string;
  revenuecat_user_id?: string;
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

// Function to sync subscription data from RevenueCat to Supabase
export const syncSubscriptionToDatabase = async (userId: string, customerInfo: any) => {
  try {
    if (!customerInfo) {
      console.warn('⚠️ No customer info available for sync');
      return false;
    }

    const subscriptionData: any = {
      revenuecat_user_id: customerInfo.originalAppUserId,
    };

    // Check if user has active subscriptions
    const hasActiveSubscriptions = Object.keys(customerInfo.activeSubscriptions).length > 0;
    const hasActiveEntitlements = Object.keys(customerInfo.entitlements.active).length > 0;

    if (hasActiveSubscriptions || hasActiveEntitlements) {
      subscriptionData.subscription_status = 'active';
      
      // Try to determine subscription type from active subscriptions
      const activeSubscriptions = Object.keys(customerInfo.activeSubscriptions);
      if (activeSubscriptions.length > 0) {
        const productId = activeSubscriptions[0];
        if (productId.toLowerCase().includes('monthly')) {
          subscriptionData.subscription_type = 'monthly';
        } else if (productId.toLowerCase().includes('annual') || productId.toLowerCase().includes('yearly')) {
          subscriptionData.subscription_type = 'annual';
        }
      }

      // Get subscription dates from entitlements
      const entitlements = Object.values(customerInfo.entitlements.active);
      if (entitlements.length > 0) {
        const entitlement = entitlements[0] as any;
        if (entitlement.originalPurchaseDate) {
          subscriptionData.subscription_start_date = entitlement.originalPurchaseDate;
        }
        if (entitlement.expirationDate) {
          subscriptionData.subscription_end_date = entitlement.expirationDate;
        }
      }
    } else {
      // Check if subscription has expired
      const allEntitlements = Object.values(customerInfo.entitlements.all);
      if (allEntitlements.length > 0) {
        subscriptionData.subscription_status = 'expired';
      }
    }

    return await updateSubscriptionInDatabase(userId, subscriptionData);
  } catch (error) {
    console.error('❌ Error syncing subscription to database:', error);
    return false;
  }
};

export const initializePurchases = async () => {
  try {
    // Check if RevenueCat is available
    if (!Purchases) {
      console.error('❌ RevenueCat native module not available');
      return false;
    }

    const apiKey = API_KEYS.ios;

    if (apiKey) {
      await Purchases.configure({ apiKey });
      console.log('✅ RevenueCat initialized successfully');
      
      // Enable debug mode in development
      if (__DEV__) {
        await Purchases.setLogLevel('debug');
      }
      return true;
    } else {
      console.error('❌ RevenueCat API key not set');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to initialize RevenueCat:', error);
    return false;
  }
};

export const getOfferings = async (): Promise<any[]> => {
  try {
    if (!Purchases) {
      console.error('❌ RevenueCat not available');
      return [];
    }
    
    const offerings = await Purchases.getOfferings();
    if (offerings.current) {
      return [offerings.current];
    }
    return Object.values(offerings.all);
  } catch (error) {
    console.error('❌ Failed to get offerings:', error);
    return [];
  }
};

export const getSpecificOffering = async (offeringId: string = OFFERING_ID) => {
  try {
    if (!Purchases) {
      console.error('❌ RevenueCat not available');
      return null;
    }
    
    const offerings = await Purchases.getOfferings();
    return offerings.all[offeringId] || offerings.current;
  } catch (error) {
    console.error('❌ Failed to get specific offering:', error);
    return null;
  }
};

export const purchaseProduct = async (productIdentifier: string) => {
  try {
    if (!Purchases) {
      console.error('❌ RevenueCat not available');
      return { success: false, error: 'RevenueCat not available' };
    }
    
    const purchaseInfo = await Purchases.purchaseStoreProduct(productIdentifier);
    
    // Sync subscription data to database after successful purchase
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user?.id) {
      await syncSubscriptionToDatabase(userData.user.id, purchaseInfo.customerInfo);
    }
    
    return { 
      success: true, 
      customerInfo: purchaseInfo.customerInfo,
      productIdentifier: purchaseInfo.productIdentifier 
    };
  } catch (error: any) {
    if (error.userCancelled) {
      return { success: false, cancelled: true };
    }
    console.error('❌ Purchase failed:', error);
    return { success: false, error: error.message };
  }
};

export const identifyRevenueCatUser = async (userId: string): Promise<boolean> => {
  try {
    if (!Purchases) {
      console.error('❌ RevenueCat not available');
      return false;
    }
    
    await Purchases.logIn(userId);
    console.log('✅ RevenueCat user identified:', userId);
    
    // Sync subscription data after identifying user
    const customerInfo = await Purchases.getCustomerInfo();
    await syncSubscriptionToDatabase(userId, customerInfo);
    
    return true;
  } catch (error) {
    console.error('❌ Failed to identify RevenueCat user:', error);
    return false;
  }
};

export const logOutRevenueCatUser = async (): Promise<boolean> => {
  try {
    if (!Purchases) {
      console.error('❌ RevenueCat not available');
      return false;
    }
    
    await Purchases.logOut();
    console.log('✅ RevenueCat user logged out');
    return true;
  } catch (error) {
    console.error('❌ Failed to log out RevenueCat user:', error);
    return false;
  }
};

export const checkSubscriptionStatus = async (): Promise<boolean> => {
  try {
    if (!Purchases) {
      console.error('❌ RevenueCat not available');
      return false;
    }
    
    const customerInfo = await Purchases.getCustomerInfo();
    console.log('🔍 Customer info:', {
      originalAppUserId: customerInfo.originalAppUserId,
      activeSubscriptions: Object.keys(customerInfo.activeSubscriptions),
      entitlements: Object.keys(customerInfo.entitlements.active),
      allEntitlements: customerInfo.entitlements,
    });
    
    // Check for common entitlement names that might indicate premium access
    const premiumEntitlementNames = ['premium', 'pro', 'premium_access', 'ad_free', 'subscription', 'pupil'];
    
    let isSubscribed = false;
    for (const entitlementName of premiumEntitlementNames) {
      if (customerInfo.entitlements.active[entitlementName] !== undefined) {
        console.log(`✅ Found active entitlement: ${entitlementName}`);
        isSubscribed = true;
        break;
      }
    }
    
    // If no specific entitlements found, check if user has any active subscriptions
    if (!isSubscribed && Object.keys(customerInfo.activeSubscriptions).length > 0) {
      console.log('✅ User has active subscriptions:', Object.keys(customerInfo.activeSubscriptions));
      isSubscribed = true;
    }
    
    console.log(`🎯 Final subscription status: ${isSubscribed ? 'SUBSCRIBED' : 'NOT SUBSCRIBED'}`);
    
    // Sync subscription data to database
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user?.id) {
      await syncSubscriptionToDatabase(userData.user.id, customerInfo);
    }
    
    return isSubscribed;
  } catch (error) {
    console.error('❌ Failed to check subscription:', error);
    return false;
  }
};

export const restorePurchases = async () => {
  try {
    if (!Purchases) {
      console.error('❌ RevenueCat not available');
      return { success: false, error: 'RevenueCat not available' };
    }
    
    const customerInfo = await Purchases.restorePurchases();
    const isSubscribed = customerInfo.entitlements.active['premium'] !== undefined;
    
    // Sync subscription data to database after restore
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user?.id) {
      await syncSubscriptionToDatabase(userData.user.id, customerInfo);
    }
    
    return { success: true, isSubscribed, customerInfo };
  } catch (error) {
    console.error('❌ Failed to restore purchases:', error);
    return { success: false, error: 'Failed to restore purchases' };
  }
};

export const getCustomerInfo = async (): Promise<any | null> => {
  try {
    if (!Purchases) {
      console.error('❌ RevenueCat not available');
      return null;
    }
    
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('❌ Failed to get customer info:', error);
    return null;
  }
};

// Function to get subscription status from database
export const getSubscriptionFromDatabase = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('subscription_status, subscription_type, subscription_start_date, subscription_end_date, revenuecat_user_id')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Failed to get subscription from database:', error);
      return null;
    }

    return {
      status: data.subscription_status,
      type: data.subscription_type,
      startDate: data.subscription_start_date,
      endDate: data.subscription_end_date,
      revenuecatUserId: data.revenuecat_user_id,
    };
  } catch (error) {
    console.error('❌ Error getting subscription from database:', error);
    return null;
  }
};

// Function to check if subscription is active based on database data
export const isSubscriptionActiveInDatabase = async (userId: string): Promise<boolean> => {
  try {
    const subscription = await getSubscriptionFromDatabase(userId);
    
    if (!subscription) {
      return false;
    }

    // Check if subscription is active
    if (subscription.status === 'active') {
      // If there's an end date, check if it's still valid
      if (subscription.endDate) {
        const endDate = new Date(subscription.endDate);
        const now = new Date();
        return now < endDate;
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Error checking subscription status from database:', error);
    return false;
  }
};

// Function to cancel subscription in database (when user cancels)
export const cancelSubscriptionInDatabase = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('❌ Failed to cancel subscription in database:', error);
      return false;
    }

    console.log('✅ Subscription cancelled in database');
    return true;
  } catch (error) {
    console.error('❌ Error cancelling subscription in database:', error);
    return false;
  }
};

// Check if RevenueCat is properly initialized
export const isRevenueCatAvailable = () => {
  return !!Purchases;
}; 
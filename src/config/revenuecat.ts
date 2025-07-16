import { Platform } from 'react-native';

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

// Check if RevenueCat is properly initialized
export const isRevenueCatAvailable = () => {
  return !!Purchases;
}; 
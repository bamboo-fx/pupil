import React, { useEffect, useState } from 'react';
import { View, Alert, ActivityIndicator, StyleSheet, Text, Dimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import RevenueCatUI from 'react-native-purchases-ui';
import { useAuthStore } from '../state/authStore';
import { getSpecificOffering, OFFERING_ID } from '../config/revenuecat';

const { width } = Dimensions.get('window');

// Modern Premium Color Palette
const colors = {
  primary: '#6366f1',      // Indigo-500
  secondary: '#8b5cf6',    // Violet-500  
  background: '#0f0f23',   // Deep navy
  surface: '#1e1b4b',      // Dark indigo
  accent: '#fbbf24',       // Amber-400
  text: '#f8fafc',         // Slate-50
  textSecondary: '#cbd5e1', // Slate-300
  success: '#10b981',      // Emerald-500
  gradient1: '#6366f1',    // Indigo
  gradient2: '#8b5cf6',    // Violet
  gradient3: '#ec4899',    // Pink
};

interface PaywallScreenProps {
  navigation: any;
  route: any;
}

export const PaywallScreen: React.FC<PaywallScreenProps> = ({ navigation, route }) => {
  const { name, email, password } = route.params || {};
  const [offering, setOffering] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { signup } = useAuthStore();

  useEffect(() => {
    loadOffering();
  }, []);

  const loadOffering = async () => {
    try {
      setIsLoading(true);
      const offeringData = await getSpecificOffering(OFFERING_ID);
      
      if (offeringData) {
        setOffering(offeringData);
        console.log('✅ Loaded RevenueCat offering:', offeringData.identifier);
      } else {
        console.error('❌ No offering found with ID:', OFFERING_ID);
        Alert.alert(
          'Error', 
          'Unable to load subscription options. Please try again later.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('❌ Failed to load offering:', error);
      Alert.alert(
        'Error', 
        'Failed to load subscription options. Please try again.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseStart = async () => {
    // First create the account before purchase
    try {
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const accountSuccess = await signup(firstName, lastName, email, password);
      
      if (!accountSuccess) {
        Alert.alert('Error', 'Failed to create account. Please try again.');
        return;
      }
      
      console.log('✅ Account created successfully, proceeding with purchase...');
    } catch (error) {
      console.error('❌ Account creation failed:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    }
  };

  const handlePurchaseComplete = (transaction: any) => {
    console.log('✅ Purchase completed:', transaction);
    Alert.alert(
      'Welcome to Premium! 🎉', 
      'Your subscription is now active and your account has been created.',
      [{ text: 'Get Started', onPress: () => {
        // Navigation will be handled automatically by auth state change
      }}]
    );
  };

  const handlePurchaseError = (error: any) => {
    console.error('❌ Purchase failed:', error);
    if (!error.userCancelled) {
      Alert.alert(
        'Purchase Failed', 
        error.message || 'Something went wrong. Please try again.'
      );
    }
  };

  const handleRestoreComplete = (customerInfo: any) => {
    console.log('✅ Restore completed:', customerInfo);
    const isSubscribed = customerInfo.entitlements.active['premium'] !== undefined;
    
    if (isSubscribed) {
      Alert.alert(
        'Success!', 
        'Your purchases have been restored!'
      );
    } else {
      Alert.alert(
        'No Purchases Found', 
        'No previous purchases were found for this account.'
      );
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleSubscriptionInfo = () => {
    navigation.navigate('SubscriptionInfo');
  };

  const handleTermsPress = () => {
    navigation.navigate('TermsOfUse');
  };

  const handlePrivacyPress = () => {
    navigation.navigate('PrivacyPolicy');
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.container}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading Premium Plans...</Text>
              <Text style={styles.loadingSubtext}>Preparing your upgrade experience</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!offering) {
    return (
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.container}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            {/* Error already handled in loadOffering */}
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.background, colors.surface, colors.background]}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        {/* Premium Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[colors.gradient1, colors.gradient2, colors.gradient3]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <Text style={styles.headerTitle}>✨ Upgrade to Premium</Text>
            <Text style={styles.headerSubtitle}>Unlock unlimited potential</Text>
          </LinearGradient>
        </View>

        {/* Subscription Details - REQUIRED BY APPLE */}
        <View style={styles.subscriptionDetails}>
          <Text style={styles.subscriptionTitle}>VibeCode Premium</Text>
          
          <View style={styles.planDetails}>
            <View style={styles.planRow}>
              <MaterialIcons name="schedule" size={20} color={colors.accent} />
              <View style={styles.planInfo}>
                <Text style={styles.planName}>Monthly Plan</Text>
                <Text style={styles.planPrice}>$8.99/month</Text>
                <Text style={styles.planPeriod}>Monthly – billed every 30 days</Text>
              </View>
            </View>
            
            <View style={styles.planRow}>
              <MaterialIcons name="calendar-today" size={20} color={colors.success} />
              <View style={styles.planInfo}>
                <Text style={styles.planName}>Annual Plan</Text>
                <Text style={styles.planPrice}>$59.99/year</Text>
                <Text style={styles.planPeriod}>Annual – billed every 365 days</Text>
              </View>
            </View>
          </View>

          {/* Subscription Info Button */}
          <Pressable onPress={handleSubscriptionInfo} style={styles.infoButton}>
            <MaterialIcons name="info" size={20} color={colors.primary} />
            <Text style={styles.infoButtonText}>View Full Subscription Details</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* RevenueCat Paywall */}
        <View style={styles.paywallContainer}>
          <RevenueCatUI.Paywall
            options={{ 
              offering,
              // Custom styling for RevenueCat UI
              displayCloseButton: true,
            }}
            onPurchaseStarted={handlePurchaseStart}
            onPurchaseCompleted={handlePurchaseComplete}
            onPurchaseError={handlePurchaseError}
            onRestoreCompleted={handleRestoreComplete}
            onRestoreError={(error) => {
              console.error('❌ Restore failed:', error);
              Alert.alert('Error', 'Failed to restore purchases. Please try again.');
            }}
            onDismiss={handleClose}
          />
        </View>

        {/* Legal Links - REQUIRED BY APPLE */}
        <View style={styles.legalSection}>
          <View style={styles.legalLinks}>
            <Pressable onPress={handleTermsPress} style={styles.legalLink}>
              <Text style={styles.legalLinkText}>Terms of Use</Text>
            </Pressable>
            <Text style={styles.legalSeparator}>•</Text>
            <Pressable onPress={handlePrivacyPress} style={styles.legalLink}>
              <Text style={styles.legalLinkText}>Privacy Policy</Text>
            </Pressable>
          </View>
          <Text style={styles.trustText}>🔒 Secure payment • Cancel anytime • 30-day guarantee</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerGradient: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.9,
  },
  subscriptionDetails: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 10,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  subscriptionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  planDetails: {
    gap: 12,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  planInfo: {
    marginLeft: 12,
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 2,
  },
  planPeriod: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  infoButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  paywallContainer: {
    flex: 1,
    marginHorizontal: 10,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  legalSection: {
    padding: 20,
    alignItems: 'center',
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legalLink: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  legalLinkText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    fontSize: 16,
    color: colors.textSecondary,
    marginHorizontal: 8,
  },
  trustText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 
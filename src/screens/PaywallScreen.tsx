import React, { useEffect, useState } from 'react';
import { View, Alert, ActivityIndicator, StyleSheet, Text, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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

        {/* Trust Indicators */}
        <View style={styles.footer}>
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
  paywallContainer: {
    flex: 1,
    marginHorizontal: 10,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
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
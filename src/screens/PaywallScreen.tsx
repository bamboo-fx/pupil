import React, { useEffect, useState } from 'react';
import { View, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RevenueCatUI from 'react-native-purchases-ui';
import { getSpecificOffering, OFFERING_ID, checkSubscriptionStatus } from '../config/revenuecat';

interface PaywallScreenProps {
  navigation?: any;
  route?: any;
  onSubscriptionChange?: () => void;
}

export const PaywallScreen: React.FC<PaywallScreenProps> = ({ navigation, onSubscriptionChange }) => {
  const [offering, setOffering] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        setIsLoading(false);
      } else {
        console.error('❌ No offering found with ID:', OFFERING_ID);
        Alert.alert(
          'Error', 
          'Unable to load subscription options. Please try again later.',
          [{ text: 'OK', onPress: () => {
            if (navigation?.goBack) {
              navigation.goBack();
            }
          }}]
        );
      }
    } catch (error) {
      console.error('❌ Failed to load offering:', error);
      Alert.alert(
        'Error', 
        'Failed to load subscription options. Please try again.',
        [{ text: 'OK', onPress: () => {
          if (navigation?.goBack) {
            navigation.goBack();
          }
        }}]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseStart = async () => {
    // Account is already created at this point, just proceed with purchase
    console.log('✅ Starting purchase process...');
  };

  const handlePurchaseComplete = async (transaction: any) => {
    console.log('✅ Purchase completed:', transaction);
    
    // Check subscription status to trigger navigation update
    try {
      const isSubscribed = await checkSubscriptionStatus();
      if (isSubscribed) {
        console.log('✅ Subscription confirmed active');
        // Trigger parent component to refresh subscription status
        if (onSubscriptionChange) {
          onSubscriptionChange();
        }
      }
    } catch (error) {
      console.error('❌ Error checking subscription after purchase:', error);
    }

    Alert.alert(
      'Welcome to Premium! 🎉', 
      'Your subscription is now active!',
      [{ text: 'Get Started', onPress: () => {
        // Navigation will be handled by subscription status change
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

  const handleRestoreComplete = async (customerInfo: any) => {
    console.log('✅ Restore completed:', customerInfo);
    const isSubscribed = customerInfo.entitlements.active['premium'] !== undefined;
    
    if (isSubscribed) {
      // Trigger parent component to refresh subscription status
      if (onSubscriptionChange) {
        onSubscriptionChange();
      }
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
    // Only navigate back if navigation is available
    if (navigation?.goBack) {
      navigation.goBack();
    }
    // If no navigation (when used as root screen), do nothing
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!offering) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          {/* Error already handled in loadOffering */}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <RevenueCatUI.Paywall
        options={{ offering }}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 
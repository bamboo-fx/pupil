import React, { useEffect, useState } from 'react';
import { View, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RevenueCatUI from 'react-native-purchases-ui';
import { useAuthStore } from '../state/authStore';
import { getSpecificOffering, OFFERING_ID } from '../config/revenuecat';

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
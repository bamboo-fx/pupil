import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, Pressable, Alert, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { getSpecificOffering, OFFERING_ID, purchaseProduct } from '../config/stripe';
import { useAuthStore } from '../state/authStore';

interface SubscriptionInfoScreenProps {
  navigation: any;
  route: any;
}

export const SubscriptionInfoScreen: React.FC<SubscriptionInfoScreenProps> = ({ navigation, route }) => {
  const { name, email, password, ageRange, skillLevel } = route.params || {};
  const [offering, setOffering] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { signup } = useAuthStore();

  useEffect(() => {
    loadOffering();
  }, []);

  const loadOffering = async () => {
    try {
      setIsLoading(true);
      const offeringData = await getSpecificOffering();
      
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

  const handlePurchase = async (productIdentifier: string) => {
    if (isPurchasing) return;
    
    try {
      setIsPurchasing(true);
      
      // First create the account if we have the details
      if (name && email && password) {
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        const accountSuccess = await signup(firstName, lastName, email, password);
        
        if (!accountSuccess) {
          Alert.alert('Error', 'Failed to create account. Please try again.');
          return;
        }
      }

      // Proceed with purchase
      const result = await purchaseProduct(productIdentifier, ''); // User ID will be handled inside the function
      
      if (result.success) {
        // Sync subscription with Supabase after successful purchase
        const syncSubscriptionWithSupabase = (useAuthStore.getState() as any).syncSubscriptionWithSupabase;
        if (typeof syncSubscriptionWithSupabase === 'function') {
          await syncSubscriptionWithSupabase();
        }
        
        if (name && email && password) {
          // User came from signup flow
          Alert.alert(
            'Welcome to Premium! 🎉', 
            'Your subscription is now active and your account has been created.',
            [{ text: 'Get Started', onPress: () => {
              // Navigation will be handled automatically by auth state change
            }}]
          );
        } else {
          // User came from skill level screen, need to create account
          Alert.alert(
            'Purchase Successful! 🎉', 
            'Now let\'s create your account.',
            [{ text: 'Continue', onPress: () => {
              navigation.navigate('CreateAccount', { ageRange, skillLevel });
            }}]
          );
        }
      } else if (!result.cancelled) {
        Alert.alert(
          'Purchase Failed', 
          result.error || 'Something went wrong. Please try again.'
        );
      }
    } catch (error) {
      console.error('❌ Purchase failed:', error);
      Alert.alert(
        'Purchase Failed', 
        'Something went wrong. Please try again.'
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  const openTermsOfService = () => {
    Linking.openURL('https://www.trypupil.com/terms');
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://www.trypupil.com/privacy');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#60a5fa" />
              <Text style={styles.loadingText}>Loading subscription information...</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </Pressable>
            <Text style={styles.headerTitle}>Choose Your Plan</Text>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Service Title and Description */}
            <BlurView intensity={20} tint="dark" style={styles.serviceInfoCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                style={styles.cardGradient}
              >
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceTitle}>Pupil Premium Learning Subscription</Text>
                  <Text style={styles.serviceDescription}>
                    Get unlimited access to coding lessons, interactive tutorials, practice problems, and personalized learning analytics to accelerate your programming journey.
                  </Text>
                </View>
              </LinearGradient>
            </BlurView>

            {/* Subscription Plans */}
            {offering && offering.availablePackages && offering.availablePackages.map((pkg: any) => (
              <BlurView key={pkg.identifier} intensity={20} tint="dark" style={styles.planCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  style={styles.cardGradient}
                >
                  <View style={styles.planContent}>
                    <View style={styles.planHeader}>
                      <Text style={styles.planTitle}>
                        {pkg.storeProduct.subscriptionPeriod?.unit === 'month' ? 'Monthly Plan' : 'Annual Plan'}
                      </Text>
                      <Text style={styles.planPrice}>
                        {pkg.storeProduct.priceString}
                        {pkg.storeProduct.subscriptionPeriod?.unit === 'month' ? '/month' : '/year'}
                      </Text>
                    </View>

                    <View style={styles.planDetails}>
                      <Text style={styles.planDuration}>
                        <Text style={styles.label}>Subscription Length: </Text>
                        {pkg.storeProduct.subscriptionPeriod?.unit === 'month' 
                          ? '1 month (automatically renews monthly)' 
                          : '1 year (automatically renews annually)'}
                      </Text>
                      
                      {pkg.storeProduct.subscriptionPeriod?.unit === 'year' && (
                        <Text style={styles.planValue}>
                          <Text style={styles.label}>Price per month: </Text>
                          {(parseFloat(pkg.storeProduct.price) / 12).toFixed(2)} {pkg.storeProduct.currencyCode}/month
                        </Text>
                      )}
                    </View>

                    <View style={styles.featuresContainer}>
                      <Text style={styles.featuresTitle}>What you get:</Text>
                      <Text style={styles.feature}>• Unlimited access to all coding lessons</Text>
                      <Text style={styles.feature}>• Interactive programming tutorials</Text>
                      <Text style={styles.feature}>• Practice problems and challenges</Text>
                      <Text style={styles.feature}>• Personalized learning analytics</Text>
                      <Text style={styles.feature}>• Progress tracking and achievements</Text>
                      <Text style={styles.feature}>• Ad-free learning experience</Text>
                    </View>

                    <Pressable
                      style={[styles.subscribeButton, isPurchasing && styles.subscribeButtonDisabled]}
                      onPress={() => handlePurchase(pkg.storeProduct.identifier)}
                      disabled={isPurchasing}
                    >
                      <LinearGradient
                        colors={['#60a5fa', '#3b82f6', '#2563eb']}
                        style={styles.subscribeGradient}
                      >
                        <Text style={styles.subscribeText}>
                          {isPurchasing ? 'Processing...' : `Subscribe ${pkg.storeProduct.priceString}`}
                        </Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                </LinearGradient>
              </BlurView>
            ))}

            {/* Subscription Terms */}
            <BlurView intensity={20} tint="dark" style={styles.termsCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                style={styles.cardGradient}
              >
                <View style={styles.termsContent}>
                  <Text style={styles.termsTitle}>Subscription Terms</Text>
                  <Text style={styles.termsText}>
                    • Payment will be charged to your Apple ID account at confirmation of purchase
                  </Text>
                  <Text style={styles.termsText}>
                    • Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period
                  </Text>
                  <Text style={styles.termsText}>
                    • Account will be charged for renewal within 24 hours prior to the end of the current period
                  </Text>
                  <Text style={styles.termsText}>
                    • Subscriptions may be managed and auto-renewal turned off in Account Settings after purchase
                  </Text>
                  <Text style={styles.termsText}>
                    • Any unused portion of a free trial period will be forfeited when purchasing a subscription
                  </Text>
                </View>
              </LinearGradient>
            </BlurView>

            {/* Legal Links */}
            <BlurView intensity={20} tint="dark" style={styles.legalCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                style={styles.cardGradient}
              >
                <View style={styles.legalContent}>
                  <Text style={styles.legalTitle}>Legal Information</Text>
                  <Text style={styles.legalText}>
                    By subscribing, you agree to our Terms of Service and Privacy Policy:
                  </Text>
                  
                  <Pressable style={styles.legalLink} onPress={openTermsOfService}>
                    <Text style={styles.linkText}>Terms of Use (EULA)</Text>
                    <MaterialIcons name="arrow-forward-ios" size={16} color="#60a5fa" />
                  </Pressable>
                  
                  <Pressable style={styles.legalLink} onPress={openPrivacyPolicy}>
                    <Text style={styles.linkText}>Privacy Policy</Text>
                    <MaterialIcons name="arrow-forward-ios" size={16} color="#60a5fa" />
                  </Pressable>
                </View>
              </LinearGradient>
            </BlurView>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  serviceInfoCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  planCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  termsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  legalCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardGradient: {
    padding: 20,
  },
  serviceInfo: {
    alignItems: 'center',
  },
  serviceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  serviceDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  planContent: {
    gap: 16,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#60a5fa',
  },
  planDetails: {
    gap: 8,
  },
  planDuration: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  planValue: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  label: {
    fontWeight: '600',
    color: 'white',
  },
  featuresContainer: {
    gap: 8,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  feature: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  subscribeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  subscribeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  termsContent: {
    gap: 12,
  },
  termsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
  },
  legalContent: {
    gap: 12,
  },
  legalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  legalText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  legalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#60a5fa',
  },
}); 
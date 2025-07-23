import React, { useEffect, useState } from 'react';
import { View, Alert, ActivityIndicator, StyleSheet, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { getSpecificOffering, OFFERING_ID, checkSubscriptionStatus, purchaseProduct, PRODUCT_DETAILS } from '../config/stripe';
import { useAuthStore } from '../state/authStore';

interface PaywallScreenProps {
  navigation?: any;
  route?: any;
  onSubscriptionChange?: () => void;
}

const { width } = Dimensions.get('window');

export const PaywallScreen: React.FC<PaywallScreenProps> = ({ navigation, onSubscriptionChange }) => {
  const [offering, setOffering] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const { user } = useAuthStore();

  useEffect(() => {
    loadOffering();
  }, []);

  const loadOffering = async () => {
    try {
      setIsLoading(true);
      const offeringData = await getSpecificOffering();
      
      if (offeringData) {
        setOffering(offeringData);
        console.log('✅ Loaded Stripe offering:', offeringData.identifier);
      } else {
        console.error('❌ No offering found');
        Alert.alert(
          'Error', 
          'Unable to load subscription options. Please try again later.',
          [{ text: 'OK', onPress: () => navigation?.goBack?.() }]
        );
      }
    } catch (error) {
      console.error('❌ Failed to load offering:', error);
      Alert.alert(
        'Error', 
        'Failed to load subscription options. Please try again.',
        [{ text: 'OK', onPress: () => navigation?.goBack?.() }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (productId: string) => {
    if (isPurchasing || !user) return;
    
    try {
      setIsPurchasing(true);
      const result = await purchaseProduct(productId, user.id);
      
      if (result.success) {
        try {
          const { syncSubscriptionWithSupabase } = useAuthStore.getState();
          await syncSubscriptionWithSupabase();
          console.log('✅ Subscription synced to Supabase');
        } catch (error) {
          console.error('❌ Error syncing subscription to Supabase:', error);
        }
        
        try {
          const isSubscribed = await checkSubscriptionStatus(user.id);
          if (isSubscribed) {
            console.log('✅ Subscription confirmed active');
            if (onSubscriptionChange) {
              onSubscriptionChange();
            }
          }
        } catch (error) {
          console.error('❌ Error checking subscription after purchase:', error);
        }

        Alert.alert(
          'Welcome to Premium! 🎉', 
          'Your subscription is now active! You can now access all premium features.',
          [{ text: 'Get Started', onPress: () => {} }]
        );
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

  const handleRestoreComplete = async () => {
    try {
      if (!user) return;
      
      const isSubscribed = await checkSubscriptionStatus(user.id);
      
      if (isSubscribed) {
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
    } catch (error) {
      console.error('❌ Restore failed:', error);
      Alert.alert(
        'Restore Failed', 
        'Unable to restore purchases. Please try again.'
      );
    }
  };

  const features = [
    {
      icon: 'code',
      title: 'Advanced Coding Questions',
      description: 'Algorithm challenges and complex problems'
    },
    {
      icon: 'psychology',
      title: 'AI-Powered Explanations',
      description: 'Detailed explanations for every concept'
    },
    {
      icon: 'trending-up',
      title: 'Progress Tracking',
      description: 'Track your learning journey and improvements'
    },
    {
      icon: 'all-inclusive',
      title: 'Unlimited Access',
      description: 'No limits on questions or practice sessions'
    },
    {
      icon: 'block',
      title: 'Ad-Free Experience',
      description: 'Learn without interruptions'
    },
    {
      icon: 'emoji-events',
      title: 'Priority Support',
      description: 'Get help when you need it most'
    }
  ];

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
          <SafeAreaView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Loading subscription options...</Text>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  if (!offering) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
          <SafeAreaView style={styles.errorContainer}>
            <Text style={styles.errorText}>Unable to load subscription options</Text>
            <Pressable style={styles.retryButton} onPress={loadOffering}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </Pressable>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  const monthlyPackage = offering.availablePackages.find((pkg: any) => 
    pkg.storeProduct.subscriptionPeriod?.unit === 'month'
  );
  const annualPackage = offering.availablePackages.find((pkg: any) => 
    pkg.storeProduct.subscriptionPeriod?.unit === 'year'
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Pressable style={styles.closeButton} onPress={() => navigation?.goBack?.()}>
                <MaterialIcons name="close" size={24} color="white" />
              </Pressable>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Unlock Premium</Text>
                <Text style={styles.headerSubtitle}>Take your coding skills to the next level</Text>
              </View>
            </View>

            {/* Features List */}
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>What's Included</Text>
              {features.map((feature, index) => (
                <BlurView key={index} intensity={20} tint="light" style={styles.featureItem}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    style={styles.featureContent}
                  >
                    <View style={styles.featureIcon}>
                      <MaterialIcons name={feature.icon as any} size={20} color="#667eea" />
                    </View>
                    <View style={styles.featureText}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                    <MaterialIcons name="check-circle" size={24} color="#4ade80" />
                  </LinearGradient>
                </BlurView>
              ))}
            </View>

            {/* Pricing Section */}
            <View style={styles.pricingContainer}>
              <Text style={styles.pricingTitle}>Choose Your Plan</Text>
              
              {/* Plan Toggle */}
              <View style={styles.planToggleContainer}>
                <BlurView intensity={20} tint="light" style={styles.planToggle}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                    style={styles.planToggleGradient}
                  >
                    <Pressable
                      style={[styles.planToggleOption, selectedPlan === 'monthly' && styles.planToggleOptionActive]}
                      onPress={() => setSelectedPlan('monthly')}
                    >
                      <Text style={[styles.planToggleText, selectedPlan === 'monthly' && styles.planToggleTextActive]}>
                        Monthly
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.planToggleOption, selectedPlan === 'annual' && styles.planToggleOptionActive]}
                      onPress={() => setSelectedPlan('annual')}
                    >
                      <Text style={[styles.planToggleText, selectedPlan === 'annual' && styles.planToggleTextActive]}>
                        Annual
                      </Text>
                      <View style={styles.savingsBadge}>
                        <Text style={styles.savingsText}>Save 33%</Text>
                      </View>
                    </Pressable>
                  </LinearGradient>
                </BlurView>
              </View>

              {/* Selected Plan Details */}
              <BlurView intensity={20} tint="light" style={styles.selectedPlanCard}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  style={styles.selectedPlanContent}
                >
                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>
                      {selectedPlan === 'monthly' ? PRODUCT_DETAILS.monthly.name : PRODUCT_DETAILS.annual.name}
                    </Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.planPrice}>
                        ${selectedPlan === 'monthly' ? PRODUCT_DETAILS.monthly.price : PRODUCT_DETAILS.annual.price}
                      </Text>
                      <Text style={styles.planInterval}>
                        /{selectedPlan === 'monthly' ? 'month' : 'year'}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.planDescription}>
                    {selectedPlan === 'monthly' ? PRODUCT_DETAILS.monthly.description : PRODUCT_DETAILS.annual.description}
                  </Text>

                  {selectedPlan === 'annual' && (
                    <View style={styles.savingsContainer}>
                      <MaterialIcons name="savings" size={16} color="#4ade80" />
                      <Text style={styles.savingsDescription}>{PRODUCT_DETAILS.annual.savings}</Text>
                    </View>
                  )}

                  <Pressable
                    style={[styles.subscribeButton, isPurchasing && styles.subscribeButtonDisabled]}
                    onPress={() => {
                      const packageToSelect = selectedPlan === 'monthly' ? monthlyPackage : annualPackage;
                      handlePurchase(packageToSelect.storeProduct.identifier);
                    }}
                    disabled={isPurchasing}
                  >
                    <LinearGradient
                      colors={['#4ade80', '#22c55e', '#16a34a']}
                      style={styles.subscribeGradient}
                    >
                      {isPurchasing ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <MaterialIcons name="lock-open" size={20} color="white" />
                          <Text style={styles.subscribeText}>
                            Start Premium - ${selectedPlan === 'monthly' ? PRODUCT_DETAILS.monthly.price : PRODUCT_DETAILS.annual.price}
                          </Text>
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>
                </LinearGradient>
              </BlurView>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Pressable style={styles.restoreButton} onPress={handleRestoreComplete}>
                <Text style={styles.restoreText}>Restore Purchases</Text>
              </Pressable>
              
              <Text style={styles.disclaimerText}>
                Subscription will auto-renew unless cancelled 24 hours before the end of the current period.
              </Text>
            </View>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 16,
    marginBottom: 24,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  featureItem: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  pricingContainer: {
    marginBottom: 32,
  },
  pricingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  planToggleContainer: {
    marginBottom: 20,
  },
  planToggle: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  planToggleGradient: {
    flexDirection: 'row',
    padding: 4,
  },
  planToggleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    position: 'relative',
  },
  planToggleOptionActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  planToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  planToggleTextActive: {
    color: 'white',
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: '#4ade80',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  selectedPlanCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  selectedPlanContent: {
    padding: 24,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4ade80',
  },
  planInterval: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 4,
  },
  planDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  savingsDescription: {
    fontSize: 14,
    color: '#4ade80',
    marginLeft: 8,
    fontWeight: '600',
  },
  subscribeButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  subscribeButtonDisabled: {
    opacity: 0.7,
  },
  subscribeGradient: {
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  subscribeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  restoreButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  restoreText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textDecorationLine: 'underline',
  },
  disclaimerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 16,
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
    color: 'rgba(255,255,255,0.8)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
}); 
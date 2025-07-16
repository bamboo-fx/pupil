import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { getSpecificOffering, OFFERING_ID } from '../config/revenuecat';

const colors = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  background: '#0f0f23',
  surface: '#1e1b4b',
  accent: '#fbbf24',
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  success: '#10b981',
};

interface SubscriptionInfoScreenProps {
  navigation: any;
}

export const SubscriptionInfoScreen: React.FC<SubscriptionInfoScreenProps> = ({ navigation }) => {
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
      }
    } catch (error) {
      console.error('Failed to load offering:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleTermsPress = () => {
    navigation.navigate('TermsOfUse');
  };

  const handlePrivacyPress = () => {
    navigation.navigate('PrivacyPolicy');
  };

  const handleManageSubscription = () => {
    Linking.openURL('https://apps.apple.com/account/subscriptions');
  };

  const formatPrice = (product: any) => {
    if (!product) return 'Loading...';
    return `${product.priceString || '$8.99'}`;
  };

  const formatPeriod = (product: any) => {
    if (!product) return 'Loading...';
    
    if (product.identifier?.includes('monthly') || product.identifier?.includes('Monthly')) {
      return 'Monthly – billed every 30 days';
    } else if (product.identifier?.includes('yearly') || product.identifier?.includes('annual')) {
      return 'Annual – billed every 365 days';
    }
    return 'Subscription period';
  };

  const getSubscriptionName = () => {
    return 'VibeCode Premium';
  };

  return (
    <LinearGradient
      colors={[colors.background, colors.surface]}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Subscription Info</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            {/* Premium Badge */}
            <View style={styles.premiumBadge}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.badgeGradient}
              >
                <MaterialIcons name="stars" size={24} color={colors.text} />
                <Text style={styles.badgeText}>Premium Subscription</Text>
              </LinearGradient>
            </View>

            {/* Subscription Details */}
            <View style={styles.subscriptionCard}>
              <Text style={styles.cardTitle}>Subscription Plans</Text>
              
              {isLoading ? (
                <Text style={styles.loadingText}>Loading subscription details...</Text>
              ) : (
                <>
                  {/* Monthly Plan */}
                  <View style={styles.planItem}>
                    <View style={styles.planHeader}>
                      <MaterialIcons name="schedule" size={20} color={colors.accent} />
                      <Text style={styles.planName}>{getSubscriptionName()} - Monthly</Text>
                    </View>
                    <Text style={styles.planPrice}>$8.99/month</Text>
                    <Text style={styles.planPeriod}>Monthly – billed every 30 days</Text>
                  </View>

                  {/* Annual Plan */}
                  <View style={styles.planItem}>
                    <View style={styles.planHeader}>
                      <MaterialIcons name="calendar-today" size={20} color={colors.success} />
                      <Text style={styles.planName}>{getSubscriptionName()} - Annual</Text>
                    </View>
                    <Text style={styles.planPrice}>$59.99/year</Text>
                    <Text style={styles.planPeriod}>Annual – billed every 365 days</Text>
                    <Text style={styles.savingsBadge}>Save 40% compared to monthly</Text>
                  </View>
                </>
              )}
            </View>

            {/* Features */}
            <View style={styles.featuresCard}>
              <Text style={styles.cardTitle}>Premium Features</Text>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <MaterialIcons name="check-circle" size={20} color={colors.success} />
                  <Text style={styles.featureText}>Unlimited learning sessions</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons name="check-circle" size={20} color={colors.success} />
                  <Text style={styles.featureText}>Advanced progress tracking</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons name="check-circle" size={20} color={colors.success} />
                  <Text style={styles.featureText}>Priority customer support</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons name="check-circle" size={20} color={colors.success} />
                  <Text style={styles.featureText}>Ad-free experience</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons name="check-circle" size={20} color={colors.success} />
                  <Text style={styles.featureText}>Exclusive premium content</Text>
                </View>
              </View>
            </View>

            {/* Subscription Management */}
            <View style={styles.managementCard}>
              <Text style={styles.cardTitle}>Subscription Management</Text>
              <Text style={styles.managementText}>
                • Subscriptions automatically renew unless canceled at least 24 hours before the end of the current period
              </Text>
              <Text style={styles.managementText}>
                • You can manage and cancel your subscription in your Apple ID Account Settings
              </Text>
              <Text style={styles.managementText}>
                • Payment will be charged to your Apple ID account at confirmation of purchase
              </Text>
              <Text style={styles.managementText}>
                • No refunds for unused portions of subscription periods
              </Text>
              
              <Pressable onPress={handleManageSubscription} style={styles.manageButton}>
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  style={styles.buttonGradient}
                >
                  <MaterialIcons name="settings" size={20} color={colors.text} />
                  <Text style={styles.buttonText}>Manage Subscription</Text>
                </LinearGradient>
              </Pressable>
            </View>

            {/* Legal Links */}
            <View style={styles.legalCard}>
              <Text style={styles.cardTitle}>Legal Information</Text>
              
              <Pressable onPress={handleTermsPress} style={styles.legalLink}>
                <MaterialIcons name="description" size={20} color={colors.accent} />
                <Text style={styles.linkText}>Terms of Use</Text>
                <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
              </Pressable>
              
              <Pressable onPress={handlePrivacyPress} style={styles.legalLink}>
                <MaterialIcons name="privacy-tip" size={20} color={colors.accent} />
                <Text style={styles.linkText}>Privacy Policy</Text>
                <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Support */}
            <View style={styles.supportCard}>
              <Text style={styles.cardTitle}>Need Help?</Text>
              <Text style={styles.supportText}>
                Have questions about your subscription? Contact our support team at support@vibecode.app
              </Text>
            </View>

            <View style={styles.bottomSpacing} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 20,
  },
  premiumBadge: {
    marginBottom: 24,
  },
  badgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 8,
  },
  subscriptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featuresCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  managementCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  legalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  supportCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  planItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 4,
  },
  planPeriod: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  savingsBadge: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 12,
    flex: 1,
  },
  managementText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  manageButton: {
    marginTop: 16,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  legalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  linkText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
  supportText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  bottomSpacing: {
    height: 40,
  },
}); 
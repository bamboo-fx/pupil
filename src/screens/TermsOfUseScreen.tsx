import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const colors = {
  primary: '#6366f1',
  background: '#0f0f23',
  surface: '#1e1b4b',
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
};

interface TermsOfUseScreenProps {
  navigation: any;
}

export const TermsOfUseScreen: React.FC<TermsOfUseScreenProps> = ({ navigation }) => {
  const handleBack = () => {
    navigation.goBack();
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
          <Text style={styles.headerTitle}>Terms of Use</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.lastUpdated}>Last updated: January 15, 2025</Text>
            
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.sectionText}>
              By downloading, installing, or using VibeCode ("the App"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the App.
            </Text>

            <Text style={styles.sectionTitle}>2. Subscription Services</Text>
            <Text style={styles.sectionText}>
              VibeCode offers premium subscription services that provide access to advanced features, unlimited content, and an ad-free experience.
            </Text>
            
            <Text style={styles.subSectionTitle}>Subscription Plans:</Text>
            <Text style={styles.bulletText}>• Monthly Premium: $8.99/month, billed every 30 days</Text>
            <Text style={styles.bulletText}>• Annual Premium: $59.99/year, billed every 365 days</Text>
            
            <Text style={styles.subSectionTitle}>Automatic Renewal:</Text>
            <Text style={styles.sectionText}>
              Your subscription will automatically renew unless you cancel at least 24 hours before the end of the current period. You can manage your subscription and turn off auto-renewal in your Apple ID Account Settings.
            </Text>

            <Text style={styles.sectionTitle}>3. Payment Terms</Text>
            <Text style={styles.sectionText}>
              Payment will be charged to your Apple ID account at confirmation of purchase. Subscriptions automatically renew unless auto-renew is turned off at least 24-hours before the end of the current period.
            </Text>

            <Text style={styles.sectionTitle}>4. Cancellation Policy</Text>
            <Text style={styles.sectionText}>
              You may cancel your subscription at any time. Cancellations take effect at the end of the current billing period. No refunds will be provided for unused portions of a subscription period.
            </Text>

            <Text style={styles.sectionTitle}>5. Free Trial</Text>
            <Text style={styles.sectionText}>
              If offered, free trials give you access to premium features for a limited time. You may cancel during the trial period to avoid charges. If you don't cancel, you'll be charged the subscription fee.
            </Text>

            <Text style={styles.sectionTitle}>6. User Conduct</Text>
            <Text style={styles.sectionText}>
              You agree to use the App only for lawful purposes and in accordance with these Terms. You will not use the App to violate any applicable laws or regulations.
            </Text>

            <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
            <Text style={styles.sectionText}>
              The App and its content are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works based on the App.
            </Text>

            <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
            <Text style={styles.sectionText}>
              To the maximum extent permitted by law, VibeCode shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the App.
            </Text>

            <Text style={styles.sectionTitle}>9. Changes to Terms</Text>
            <Text style={styles.sectionText}>
              We reserve the right to update these Terms of Use at any time. Changes will be effective immediately upon posting within the App.
            </Text>

            <Text style={styles.sectionTitle}>10. Contact Information</Text>
            <Text style={styles.sectionText}>
              If you have questions about these Terms of Use, please contact us at support@vibecode.app
            </Text>

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
  lastUpdated: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  bulletText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    marginBottom: 6,
    paddingLeft: 16,
  },
  bottomSpacing: {
    height: 40,
  },
}); 
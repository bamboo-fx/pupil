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

interface PrivacyPolicyScreenProps {
  navigation: any;
}

export const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ navigation }) => {
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
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.lastUpdated}>Last updated: January 15, 2025</Text>
            
            <Text style={styles.sectionTitle}>1. Introduction</Text>
            <Text style={styles.sectionText}>
              VibeCode ("we," "our," or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.
            </Text>

            <Text style={styles.sectionTitle}>2. Information We Collect</Text>
            
            <Text style={styles.subSectionTitle}>Account Information:</Text>
            <Text style={styles.bulletText}>• Name and email address (when you create an account)</Text>
            <Text style={styles.bulletText}>• Username and password</Text>
            <Text style={styles.bulletText}>• Profile preferences and settings</Text>
            
            <Text style={styles.subSectionTitle}>Usage Data:</Text>
            <Text style={styles.bulletText}>• App usage statistics and analytics</Text>
            <Text style={styles.bulletText}>• Learning progress and achievements</Text>
            <Text style={styles.bulletText}>• Feature interactions and preferences</Text>
            
            <Text style={styles.subSectionTitle}>Device Information:</Text>
            <Text style={styles.bulletText}>• Device type and operating system</Text>
            <Text style={styles.bulletText}>• App version and crash reports</Text>
            <Text style={styles.bulletText}>• IP address and general location</Text>

            <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
            <Text style={styles.sectionText}>
              We use your information to:
            </Text>
            <Text style={styles.bulletText}>• Provide and improve our services</Text>
            <Text style={styles.bulletText}>• Personalize your learning experience</Text>
            <Text style={styles.bulletText}>• Process subscription payments</Text>
            <Text style={styles.bulletText}>• Send important updates and notifications</Text>
            <Text style={styles.bulletText}>• Analyze app performance and usage</Text>
            <Text style={styles.bulletText}>• Prevent fraud and ensure security</Text>

            <Text style={styles.sectionTitle}>4. Information Sharing</Text>
            <Text style={styles.sectionText}>
              We do not sell, trade, or rent your personal information to third parties. We may share information with:
            </Text>
            <Text style={styles.bulletText}>• Service providers (payment processing, analytics)</Text>
            <Text style={styles.bulletText}>• Legal authorities when required by law</Text>
            <Text style={styles.bulletText}>• Business partners with your explicit consent</Text>

            <Text style={styles.sectionTitle}>5. Data Security</Text>
            <Text style={styles.sectionText}>
              We implement industry-standard security measures to protect your information, including encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure.
            </Text>

            <Text style={styles.sectionTitle}>6. Data Retention</Text>
            <Text style={styles.sectionText}>
              We retain your information for as long as your account is active or as needed to provide services. You can request account deletion at any time, which will remove your personal data within 30 days.
            </Text>

            <Text style={styles.sectionTitle}>7. Your Rights</Text>
            <Text style={styles.sectionText}>
              You have the right to:
            </Text>
            <Text style={styles.bulletText}>• Access and update your personal information</Text>
            <Text style={styles.bulletText}>• Delete your account and associated data</Text>
            <Text style={styles.bulletText}>• Opt out of marketing communications</Text>
            <Text style={styles.bulletText}>• Request a copy of your data</Text>

            <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
            <Text style={styles.sectionText}>
              Our app is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware of such information, we will delete it immediately.
            </Text>

            <Text style={styles.sectionTitle}>9. Third-Party Services</Text>
            <Text style={styles.sectionText}>
              Our app may contain links to third-party services or integrate with external platforms. We are not responsible for the privacy practices of these third parties.
            </Text>

            <Text style={styles.sectionTitle}>10. International Transfers</Text>
            <Text style={styles.sectionText}>
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
            </Text>

            <Text style={styles.sectionTitle}>11. Changes to This Policy</Text>
            <Text style={styles.sectionText}>
              We may update this Privacy Policy from time to time. We will notify you of any significant changes through the app or via email.
            </Text>

            <Text style={styles.sectionTitle}>12. Contact Us</Text>
            <Text style={styles.sectionText}>
              If you have questions about this Privacy Policy or want to exercise your rights, please contact us at:
            </Text>
            <Text style={styles.bulletText}>• Email: privacy@vibecode.app</Text>
            <Text style={styles.bulletText}>• Support: support@vibecode.app</Text>

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
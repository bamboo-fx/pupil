import React, { useEffect, useState } from "react";
import { AuthNavigator } from "./AuthNavigator";
import { AppNavigator } from "./AppNavigator";
import { PaywallScreen } from "../screens/PaywallScreen";
import { useAuthStore } from "../state/authStore";
import { checkSubscriptionStatus } from "../config/stripe";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const SimpleRootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  useEffect(() => {
    // Only check subscription status if user is authenticated
    if (isAuthenticated && !authLoading) {
      checkUserSubscription();
    } else if (!isAuthenticated) {
      // Reset subscription status when not authenticated
      setIsSubscribed(null);
    }
  }, [isAuthenticated, authLoading]);

  const checkUserSubscription = async () => {
    setSubscriptionLoading(true);
    try {
      if (!user) {
        setIsSubscribed(false);
        return;
      }
      const subscribed = await checkSubscriptionStatus(user.id);
      setIsSubscribed(subscribed);
      console.log('🔍 Subscription status:', subscribed ? 'SUBSCRIBED' : 'NOT SUBSCRIBED');
    } catch (error) {
      console.error('❌ Failed to check subscription status:', error);
      // On error, assume not subscribed to show paywall
      setIsSubscribed(false);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  // Show loading spinner while checking auth or subscription
  if (authLoading || (isAuthenticated && subscriptionLoading)) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      </SafeAreaView>
    );
  }

  // Not authenticated → show auth flow
  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  // Authenticated but not subscribed → show paywall
  if (isAuthenticated && isSubscribed === false) {
    return <PaywallScreen navigation={null} onSubscriptionChange={checkUserSubscription} />;
  }

  // Authenticated and subscribed → show main app
  if (isAuthenticated && isSubscribed === true) {
    return <AppNavigator />;
  }

  // Fallback loading state
  return (
    <SafeAreaView style={styles.loadingContainer}>
      <View style={styles.loadingContent}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
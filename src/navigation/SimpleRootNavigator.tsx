import React from "react";
import { AuthNavigator } from "./AuthNavigator";
import { AppNavigator } from "./AppNavigator";
import { useAuthStore } from "../state/authStore";

export const SimpleRootNavigator: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
};
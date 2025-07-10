import React from "react";
import { SimpleAuthNavigator } from "./SimpleAuthNavigator";
import { AppNavigator } from "./AppNavigator";
import { useAuthStore } from "../state/authStore";

export const SimpleRootNavigator: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return isAuthenticated ? <AppNavigator /> : <SimpleAuthNavigator />;
};
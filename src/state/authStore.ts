import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock successful login
        const user = {
          id: '1',
          name: email.split('@')[0],
          email: email,
        };
        
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false 
        });
        
        return true;
      },

      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock successful signup
        const user = {
          id: Date.now().toString(),
          name: name,
          email: email,
        };
        
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false 
        });
        
        return true;
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'dsa-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
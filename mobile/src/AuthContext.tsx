import { Alert, Platform } from 'react-native';
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

import { setAuthToken } from './api/client';

export type AuthUser = {
  id: number;
  email: string;
  walletAddress: string;
};

type AuthContextValue = {
  isLoggedIn: boolean;
  isInitializing: boolean;
  token: string | null;
  user: AuthUser | null;
  login: (token: string, profile?: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'pistis_auth_session_v1';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        const saved = JSON.parse(raw) as { token?: string; user?: AuthUser | null } | null;
        if (!saved?.token) {
          await AsyncStorage.removeItem(STORAGE_KEY);
          return;
        }

        let canUseBiometric = false;
        try {
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          const enrolled = await LocalAuthentication.isEnrolledAsync();
          canUseBiometric = hasHardware && enrolled;
        } catch (error) {
          console.error('Biometric capability check failed', error);
        }

        if (canUseBiometric) {
          const baseOptions: LocalAuthentication.LocalAuthenticationOptions = {
            promptMessage: 'Unlock Consent App',
            cancelLabel: 'Use different account',
          };

          let result = await LocalAuthentication.authenticateAsync(
            Platform.OS === 'ios'
              ? {
                  ...baseOptions,
                  fallbackLabel: 'Use passcode',
                  disableDeviceFallback: true,
                }
              : baseOptions
          );

          if (!result.success && Platform.OS === 'ios') {
            console.warn('Biometric unlock failed, retrying with device fallback', result.error);
            result = await LocalAuthentication.authenticateAsync(baseOptions);
          }

          if (!result.success) {
            Alert.alert('Authentication required', 'Unlock with Face ID / Touch ID or device passcode to resume.');
            await AsyncStorage.removeItem(STORAGE_KEY);
            return;
          }
        }

        setToken(saved.token);
        setUser(saved.user ?? null);
      } catch (error) {
        console.error('Auth session restore failed', error);
        await AsyncStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsInitializing(false);
      }
    };

    restoreSession();
  }, []);

  const persistSession = async (nextToken: string | null, profile: AuthUser | null) => {
    try {
      if (nextToken) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: profile }));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Auth session persist failed', error);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoggedIn: Boolean(token),
      isInitializing,
      token,
      user,
      login: (newToken: string, profile?: AuthUser) => {
        setToken(newToken);
        setUser(profile ?? null);
        void persistSession(newToken, profile ?? null);
      },
      logout: () => {
        setToken(null);
        setUser(null);
        void persistSession(null, null);
      },
    }),
    [token, user, isInitializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

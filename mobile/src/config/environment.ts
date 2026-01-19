import Constants from 'expo-constants';

const getApiBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  const extraUrl = (Constants?.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl;
  return envUrl || extraUrl || 'http://10.0.241.222:4000';
};

export const API_BASE_URL = getApiBaseUrl();

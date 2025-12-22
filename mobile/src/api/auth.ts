import apiClient from './client';

export type AuthResponse = {
  token: string;
  user: {
    id: number;
    email: string;
    walletAddress: string;
  };
};

export const register = async (email: string, password: string, walletAddress: string): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', {
    email,
    password,
    walletAddress,
  });
  return response.data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', {
    email,
    password,
  });
  return response.data;
};

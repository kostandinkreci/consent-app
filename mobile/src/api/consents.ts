import apiClient from './client';
import { Consent } from '../types/navigation';

export type CreateConsentPayload = {
  title: string;
  description: string;
  validFrom?: string;
  validTo?: string;
  partnerEmail?: string;
};

export const createConsent = async (data: CreateConsentPayload): Promise<Consent> => {
  const response = await apiClient.post<Consent>('/consents/create', data);
  return response.data;
};

export const listConsents = async (): Promise<Consent[]> => {
  const response = await apiClient.get<Consent[]>('/consents');
  return response.data;
};

export const getConsent = async (id: string): Promise<Consent> => {
  const response = await apiClient.get<Consent>(`/consents/${id}`);
  return response.data;
};

export const joinConsent = async (joinCode: string): Promise<Consent> => {
  const response = await apiClient.post<Consent>('/consents/join', { joinCode });
  return response.data;
};

export const confirmConsent = async (consentId: string): Promise<Consent> => {
  const response = await apiClient.post<Consent>('/consents/confirm', { consentId });
  return response.data;
};

export const revokeConsent = async (consentId: string): Promise<Consent> => {
  const response = await apiClient.post<Consent>('/consents/revoke', { consentId });
  return response.data;
};

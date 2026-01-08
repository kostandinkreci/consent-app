export type ConsentStatus = 'PENDING' | 'ACTIVE' | 'REVOKED';

export type Consent = {
  id: string;
  title: string;
  description: string;
  partnerEmail?: string | null;
  initiatorEmail?: string | null;
  joinCode?: string | null;
  validFrom?: string | null;
  validTo?: string | null;
  status: ConsentStatus;
  initiatorConfirmed?: boolean;
  partnerConfirmed?: boolean;
  blockchainId?: string | null;
  txHash?: string | null;
  createdAt?: string | null;
  confirmedAt?: string | null;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  CreateConsent: undefined;
  MyConsents: undefined;
  JoinConsent: undefined;
  ConsentDetails: {
    consentId: string;
  };
  Settings: undefined;
};

import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppStackParamList, Consent } from '../types/navigation';
import { confirmConsent, getConsent, revokeConsent } from '../api/consents';
import { colors, spacing, typography } from '../theme';
import Banner from '../components/Banner';

type Props = NativeStackScreenProps<AppStackParamList, 'ConsentDetails'>;

const ConsentDetailsScreen = ({ route }: Props) => {
  const { consentId } = route.params;
  const [consent, setConsent] = useState<Consent | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchConsent = async () => {
      try {
        setError(null);
        const data = await getConsent(consentId);
        if (isMounted) {
          setConsent(data ?? null);
        }
      } catch (error) {
        console.error('Failed to load consent details', error);
        setError('Unable to load this consent. Please try again.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchConsent();
    return () => {
      isMounted = false;
    };
  }, [consentId]);

  const requireBiometric = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !enrolled) {
      Alert.alert('Biometric unavailable', 'Set up Face ID / Touch ID in system settings to continue.');
      return false;
    }

    const baseOptions: LocalAuthentication.LocalAuthenticationOptions = {
      promptMessage: 'Verify identity',
      cancelLabel: 'Cancel',
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
      console.warn('Biometric confirmation failed, retrying with device fallback', result.error);
      result = await LocalAuthentication.authenticateAsync({
        ...baseOptions,
        promptMessage: 'Verify identity (Face ID / Passcode)',
      });
    }

    if (!result.success) {
      Alert.alert('Verification failed', 'Face ID / Touch ID (or your passcode) is required to continue.');
    }

    return result.success;
  };

  const handleConfirm = async () => {
    if (!consent) return;

    try {
      const ok = await requireBiometric();
      if (!ok) return;

      setActionLoading(true);
      setError(null);
      const updated = await confirmConsent(consent.id);
      setConsent(updated);
      Alert.alert('Confirmed', 'Consent confirmed successfully.');
    } catch (error) {
      console.error('Confirm consent failed', error);
      setError('Could not confirm consent.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!consent) return;

    try {
      const ok = await requireBiometric();
      if (!ok) return;

      setActionLoading(true);
      setError(null);
      const updated = await revokeConsent(consent.id);
      setConsent(updated);
      Alert.alert('Revoked', 'Consent was revoked.');
    } catch (error) {
      console.error('Revoke consent failed', error);
      setError('Could not revoke consent.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading consent...</Text>
      </View>
    );
  }

  if (!consent) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.value}>Consent not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{consent.title}</Text>
      <Text style={styles.subtitle}>Status: <Text style={[styles.status, statusColor(consent.status)]}>{consent.status}</Text></Text>

      {error ? <Banner tone="error" message={error} /> : null}

      <Text style={styles.label}>Initiator</Text>
      <Text style={styles.value}>{consent.initiatorEmail ?? 'Unknown'}</Text>

      <Text style={styles.label}>Partner</Text>
      <Text style={styles.value}>{consent.partnerEmail ?? 'Awaiting partner'}</Text>

      <Text style={styles.label}>Created</Text>
      <Text style={styles.value}>{formatTimestamp(consent.createdAt, 'Unknown')}</Text>
      <Text style={styles.label}>Confirmed</Text>
      <Text style={styles.value}>{formatTimestamp(consent.confirmedAt, 'Not yet')}</Text>

      {consent.description ? (
        <>
          <Text style={styles.label}>Details</Text>
          <Text style={styles.value}>{consent.description}</Text>
        </>
      ) : null}

      {consent.joinCode ? (
        <>
          <Text style={styles.label}>Join Code</Text>
          <Text style={styles.value}>{consent.joinCode}</Text>
        </>
      ) : null}

      <Text style={styles.label}>Initiator Confirmed</Text>
      <Text style={styles.value}>{consent.initiatorConfirmed ? 'Yes' : 'No'}</Text>
      <Text style={styles.label}>Partner Confirmed</Text>
      <Text style={styles.value}>{consent.partnerConfirmed ? 'Yes' : 'No'}</Text>

      <View style={styles.buttonGroup}>
        <Pressable
          style={[styles.primaryButton, (actionLoading || consent.status === 'ACTIVE') && styles.buttonDisabled]}
          onPress={handleConfirm}
          disabled={actionLoading || consent.status === 'ACTIVE'}
        >
          <Text style={styles.primaryButtonText}>{actionLoading ? 'Working...' : 'Confirm with Biometric'}</Text>
        </Pressable>
        <Pressable style={[styles.dangerButton, actionLoading && styles.buttonDisabled]} onPress={handleRevoke} disabled={actionLoading}>
          <Text style={styles.primaryButtonText}>Revoke consent</Text>
        </Pressable>
      </View>
    </View>
  );
};

const statusColor = (status: Consent['status']) => {
  switch (status) {
    case 'ACTIVE':
      return { color: colors.success };
    case 'REVOKED':
      return { color: colors.error };
    default:
      return { color: colors.warning };
  }
};

const formatTimestamp = (value: string | null | undefined, fallback: string) => {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.md,
  },
  status: {
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  value: {
    fontSize: 18,
    marginTop: spacing.xs,
    color: colors.text,
  },
  buttonGroup: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.text,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#C0392B',
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default ConsentDetailsScreen;

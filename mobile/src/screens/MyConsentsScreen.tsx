import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import { AppStackParamList, Consent } from '../types/navigation';
import { deleteConsent, listConsents } from '../api/consents';
import { useAuth } from '../AuthContext';
import { colors, spacing, typography } from '../theme';
import Banner from '../components/Banner';

type Props = NativeStackScreenProps<AppStackParamList, 'MyConsents'>;

const MyConsentsScreen = ({ navigation }: Props) => {
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();

  const counterpartyLabel = (consent: Consent) => {
    if (!user?.email) {
      return consent.partnerEmail ?? consent.initiatorEmail ?? 'Unknown participant';
    }

    return user.email === consent.initiatorEmail
      ? consent.partnerEmail ?? 'Awaiting partner'
      : consent.initiatorEmail ?? 'Awaiting initiator';
  };

  const fetchConsents = useCallback(
    async (isRefreshing = false) => {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        setError(null);
        const data = await listConsents();
        setConsents(data);
      } catch (error) {
        console.error('Failed to load consents', error);
        setError('Unable to load consent sessions right now. Check your connection and try again.');
      } finally {
        if (isRefreshing) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      fetchConsents();
    }, [fetchConsents])
  );

  const handleDeleteConfirm = async (consentId: string) => {
    try {
      setDeletingId(consentId);
      setError(null);
      await deleteConsent(consentId);
      setConsents((prev) => prev.filter((consent) => consent.id !== consentId));
    } catch (error) {
      console.error('Failed to delete consent', error);
      setError('Unable to delete this consent right now. Try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDelete = (item: Consent) => {
    const isActive = item.status === 'ACTIVE';
    const message = isActive
      ? 'Active consents must be revoked before deletion.'
      : 'Delete this consent? This cannot be undone.';

    Alert.alert('Delete consent', message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (isActive) return;
          handleDeleteConfirm(item.id);
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Consent }) => (
    <TouchableOpacity
      style={styles.consentItem}
      onPress={() => navigation.navigate('ConsentDetails', { consentId: item.id })}
    >
      <View style={styles.consentHeader}>
        <Text style={styles.consentTitle}>{item.title}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
          disabled={deletingId === item.id}
        >
          <Text style={styles.deleteButtonText}>{deletingId === item.id ? 'Deleting...' : 'Delete'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.consentPartner}>{counterpartyLabel(item)}</Text>
      <Text style={styles.consentTimestamp}>Created: {formatTimestamp(item.createdAt, 'Unknown')}</Text>
      <Text style={[styles.consentStatus, statusColor(item.status)]}>{item.status}</Text>
    </TouchableOpacity>
  );

  if (loading && consents.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading consents...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Consents</Text>
      <Text style={styles.subtitle}>Track your active, pending, and revoked consent sessions.</Text>
      {error ? <Banner tone="error" message={error} /> : null}
      <FlatList
        data={consents}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No consent sessions yet.</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchConsents(true)} />}
      />
    </View>
  );
};

const statusColor = (status: Consent['status']) => {
  switch (status) {
    case 'ACTIVE':
      return { color: colors.success };
    case 'REVOKED':
      return { color: colors.error };
    case 'PENDING':
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
  list: {
    gap: spacing.sm,
  },
  consentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  consentItem: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  consentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  deleteButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  deleteButtonText: {
    color: colors.error,
    fontWeight: '600',
  },
  consentPartner: {
    color: colors.textMuted,
    marginVertical: spacing.xs,
  },
  consentTimestamp: {
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  consentStatus: {
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.text,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});

export default MyConsentsScreen;

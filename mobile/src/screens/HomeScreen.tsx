import { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';

import { AppStackParamList } from '../types/navigation';
import { useAuth } from '../AuthContext';
import { useSettings } from '../SettingsContext';
import { API_BASE_URL } from '../config/environment';
import { colors as baseColors, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: Props) => {
  const { logout } = useAuth();
  const { palette, themeMode, language } = useSettings();
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [biometricStatus, setBiometricStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');

  const gradientColors = useMemo(
    () => (themeMode === 'Dark' ? ['#111936', '#0F1428'] : ['#E8EDFF', '#F7F9FF']),
    [themeMode]
  );

  const t = useMemo(
    () =>
      language === 'Deutsch'
        ? {
            dashboard: 'Consent Dashboard',
            strap: 'Verfolge, teile und bestaetige Einverstaendnisse sicher.',
            create: 'Einverstaendnis erstellen',
            createSub: 'Neuen Vertrag starten und Partner einladen.',
            join: 'Mit Code beitreten',
            joinSub: 'Gib den erhaltenen Beitrittscode ein.',
            myConsents: 'Meine Einverstaendnisse',
            myConsentsSub: 'Aktive, ausstehende oder widerrufene Sitzungen pruefen.',
            pending: 'Ausstehend',
            active: 'Aktiv',
            revoked: 'Widerrufen',
            system: 'Systemstatus',
            biometric: 'Biometrie',
            biometricCheck: 'Pruefe Verfuegbarkeit...',
            biometricOk: 'Face ID / Touch ID verfuegbar.',
            biometricNo: 'Nicht verfuegbar auf diesem Geraet.',
            network: 'Netzwerk',
            networkCheck: 'Pruefe API...',
            networkOk: 'Backend erreichbar.',
            networkNo: 'Backend offline/nicht erreichbar.',
          }
        : {
            dashboard: 'Consent Dashboard',
            strap: 'Track, share, and verify consent sessions securely.',
            create: 'Create Consent',
            createSub: 'Start a new agreement and invite your partner.',
            join: 'Join via Code',
            joinSub: 'Enter a join code shared with you.',
            myConsents: 'My Consents',
            myConsentsSub: 'Review active, pending, or revoked sessions.',
            pending: 'Pending',
            active: 'Active',
            revoked: 'Revoked',
            system: 'System status',
            biometric: 'Biometric',
            biometricCheck: 'Checking availability...',
            biometricOk: 'Face ID / Touch ID available.',
            biometricNo: 'Not available on this device.',
            network: 'Network',
            networkCheck: 'Checking API...',
            networkOk: 'Backend reachable.',
            networkNo: 'Backend offline/unreachable.',
          },
    [language]
  );

  const refreshStatus = useCallback(() => {
    const checkApi = async () => {
      try {
        setApiStatus('checking');
        const response = await fetch(`${API_BASE_URL}/health`);
        setApiStatus(response.ok ? 'online' : 'offline');
      } catch {
        setApiStatus('offline');
      }
    };

    const checkBiometric = async () => {
      setBiometricStatus('checking');
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setBiometricStatus(hasHardware && enrolled ? 'available' : 'unavailable');
      } catch {
        setBiometricStatus('unavailable');
      }
    };

    checkApi();
    checkBiometric();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshStatus();
    }, [refreshStatus])
  );

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.profile}>
            <View style={[styles.avatar, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <Text style={[styles.avatarText, { color: palette.text }]}>P</Text>
            </View>
            <View>
              <Text style={[styles.topLabel, { color: palette.textMuted }]}>Pistis</Text>
              <Text style={[styles.topValue, { color: palette.text }]}>Consent Dashboard</Text>
            </View>
          </View>
          <View style={styles.iconGroup}>
            <Pressable
              style={[styles.iconButton, { backgroundColor: palette.surface, borderColor: palette.border }]}
              onPress={() => navigation.navigate('Settings')}
            >
              <Feather name="settings" size={20} color={palette.text} />
            </Pressable>
            <Pressable
              style={[styles.iconButton, { backgroundColor: palette.surface, borderColor: palette.border }]}
              onPress={logout}
            >
              <Feather name="log-out" size={20} color={palette.text} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.hero, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <Image source={require('../../assets/pistis-logo.png')} style={styles.logo} resizeMode="contain" />
          <View style={styles.heroText}>
            <Text style={[styles.title, { color: palette.text }]}>{t.dashboard}</Text>
            <Text style={[styles.subtitle, { color: palette.textMuted }]}>{t.strap}</Text>
            <View style={styles.chipRow}>
              <View style={[styles.chip, styles.chipInfo, { borderColor: palette.border, backgroundColor: palette.surface }]}>
                <Feather name="shield" color={palette.text} size={14} />
                <Text style={[styles.chipText, { color: palette.text }]}>Biometric</Text>
              </View>
              <View style={[styles.chip, styles.chipSuccess, { borderColor: palette.border, backgroundColor: palette.surface }]}>
                <Feather name="activity" color={palette.text} size={14} />
                <Text style={[styles.chipText, { color: palette.text }]}>On-chain</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.cards}>
          <Pressable
            style={[styles.primaryCard, { backgroundColor: palette.primary }]}
            onPress={() => navigation.navigate('CreateConsent')}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: palette.text }]}>{t.create}</Text>
              <Ionicons name="add-circle" size={22} color={palette.text} />
            </View>
            <Text style={[styles.cardSubtitle, { color: palette.textMuted }]}>{t.createSub}</Text>
          </Pressable>

          <Pressable
            style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
            onPress={() => navigation.navigate('JoinConsent')}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: palette.text }]}>{t.join}</Text>
              <Feather name="hash" size={20} color={palette.text} />
            </View>
            <Text style={[styles.cardSubtitle, { color: palette.textMuted }]}>{t.joinSub}</Text>
          </Pressable>

          <Pressable
            style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
            onPress={() => navigation.navigate('MyConsents')}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: palette.text }]}>{t.myConsents}</Text>
              <Feather name="list" size={20} color={palette.text} />
            </View>
            <Text style={[styles.cardSubtitle, { color: palette.textMuted }]}>{t.myConsentsSub}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.chip, styles.chipWarning, { borderColor: palette.border }]}>
                <Text style={[styles.chipText, { color: palette.text }]}>{t.pending}</Text>
              </View>
              <View style={[styles.chip, styles.chipSuccess, { borderColor: palette.border }]}>
                <Text style={[styles.chipText, { color: palette.text }]}>{t.active}</Text>
              </View>
              <View style={[styles.chip, styles.chipError, { borderColor: palette.border }]}>
                <Text style={[styles.chipText, { color: palette.text }]}>{t.revoked}</Text>
              </View>
            </View>
          </Pressable>
        </View>

        <View style={styles.systemSection}>
          <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>{t.system}</Text>
          <Pressable style={[styles.statusCard, { backgroundColor: palette.surface, borderColor: palette.border }]} onPress={refreshStatus}>
            <View style={[styles.statusIcon, { backgroundColor: palette.background, borderColor: palette.border }]}>
              <Feather name="smartphone" size={16} color={palette.text} />
            </View>
            <View style={styles.statusText}>
              <Text style={[styles.infoTitle, { color: palette.text }]}>{t.biometric}</Text>
              <Text style={[styles.infoSubtitle, { color: palette.textMuted }]}>
                {biometricStatus === 'checking'
                  ? t.biometricCheck
                  : biometricStatus === 'available'
                  ? t.biometricOk
                  : t.biometricNo}
              </Text>
            </View>
          </Pressable>
          <Pressable style={[styles.statusCard, { backgroundColor: palette.surface, borderColor: palette.border }]} onPress={refreshStatus}>
            <View style={[styles.statusIcon, { backgroundColor: palette.background, borderColor: palette.border }]}>
              <Feather name="wifi" size={16} color={palette.text} />
            </View>
            <View style={styles.statusText}>
              <Text style={[styles.infoTitle, { color: palette.text }]}>{t.network}</Text>
              <Text style={[styles.infoSubtitle, { color: palette.textMuted }]}>
                {apiStatus === 'checking'
                  ? t.networkCheck
                  : apiStatus === 'online'
                  ? t.networkOk
                  : t.networkNo}
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: baseColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: baseColors.border,
  },
  avatarText: {
    fontWeight: '700',
  },
  topLabel: {
    fontSize: 12,
  },
  topValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: baseColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: baseColors.border,
  },
  iconGroup: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  hero: {
    borderRadius: 16,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
  },
  logo: {
    width: 110,
    height: 110,
  },
  heroText: {
    flex: 1,
    gap: spacing.sm,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.body,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipInfo: {
    backgroundColor: '#1F2746',
  },
  chipSuccess: {
    backgroundColor: '#1E3A35',
  },
  chipWarning: {
    backgroundColor: '#3B2C1C',
  },
  chipError: {
    backgroundColor: '#3A2020',
  },
  cards: {
    gap: spacing.md,
  },
  card: {
    padding: spacing.lg,
    borderRadius: 14,
    borderWidth: 1,
  },
  primaryCard: {
    padding: spacing.lg,
    borderRadius: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardSubtitle: {
    marginTop: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  systemSection: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statusCard: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statusText: {
    flex: 1,
    gap: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoSubtitle: {
    marginTop: spacing.xs,
  },
  logout: {
    backgroundColor: baseColors.error,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default HomeScreen;



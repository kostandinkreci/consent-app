import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppStackParamList } from '../types/navigation';
import { colors as baseColors, spacing, typography } from '../theme';
import { useAuth } from '../AuthContext';
import { useSettings } from '../SettingsContext';

type Props = NativeStackScreenProps<AppStackParamList, 'Settings'>;

const languages = ['English', 'Deutsch'] as const;
const themes = ['Dark', 'Light'] as const;

const SettingsScreen = (_props: Props) => {
  const { logout } = useAuth();
  const { language, setLanguage, themeMode, setThemeMode } = useSettings();

  const palette = useMemo(
    () =>
      themeMode === 'Dark'
        ? {
            background: baseColors.background,
            surface: baseColors.surface,
            border: baseColors.border,
            text: baseColors.text,
            textMuted: baseColors.textMuted,
            primaryMuted: baseColors.primaryMuted,
            error: baseColors.error,
            success: baseColors.success,
          }
        : {
            background: '#F5F7FF',
            surface: '#FFFFFF',
            border: '#D5DBED',
            text: '#0F1428',
            textMuted: '#606B85',
            primaryMuted: '#6F8CFF',
            error: '#E07C7C',
            success: '#45D6A6',
          },
    [themeMode]
  );

  const t = useMemo(
    () =>
      language === 'Deutsch'
        ? {
            header: 'Einstellungen',
            language: 'Sprache',
            theme: 'Modus',
            dark: 'Dunkel',
            light: 'Hell',
            helper: 'Schalte hier das Erscheinungsbild um.',
            account: 'Konto',
            signOut: 'Abmelden',
          }
        : {
            header: 'Settings',
            language: 'Language',
            theme: 'Theme',
            dark: 'Dark',
            light: 'Light',
            helper: 'Toggle the appearance here.',
            account: 'Account',
            signOut: 'Sign out',
          },
    [language]
  );

  return (
    <LinearGradient colors={themeMode === 'Dark' ? ['#111936', '#0F1428'] : ['#E8EDFF', '#F7F9FF']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: 'transparent' }]}>
        <Text style={[styles.header, { color: palette.text }]}>{t.header}</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>{t.language}</Text>
          {languages.map((lang) => (
            <Pressable
              key={lang}
              style={[
                styles.row,
                {
                  backgroundColor: palette.surface,
                  borderColor: language === lang ? palette.primaryMuted : palette.border,
                },
              ]}
              onPress={() => setLanguage(lang)}
            >
              <View style={styles.rowLeft}>
                <Feather name="globe" size={18} color={palette.text} />
                <Text style={[styles.rowText, { color: palette.text }]}>{lang}</Text>
              </View>
              {language === lang ? <Feather name="check-circle" size={18} color={palette.success} /> : null}
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>{t.theme}</Text>
          {themes.map((mode) => (
            <Pressable
              key={mode}
              style={[
                styles.row,
                {
                  backgroundColor: palette.surface,
                  borderColor: themeMode === mode ? palette.primaryMuted : palette.border,
                },
              ]}
              onPress={() => setThemeMode(mode)}
            >
              <View style={styles.rowLeft}>
                <Feather name={mode === 'Dark' ? 'moon' : 'sun'} size={18} color={palette.text} />
                <Text style={[styles.rowText, { color: palette.text }]}>{mode === 'Dark' ? t.dark : t.light} mode</Text>
              </View>
              {themeMode === mode ? <Feather name="check-circle" size={18} color={palette.success} /> : null}
            </Pressable>
          ))}
          <Text style={[styles.helper, { color: palette.textMuted }]}>{t.helper}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>{t.account}</Text>
          <Pressable
            style={[
              styles.row,
              {
                backgroundColor: palette.surface,
                borderColor: palette.error,
              },
            ]}
            onPress={logout}
          >
            <View style={styles.rowLeft}>
              <Feather name="log-out" size={18} color={palette.text} />
              <Text style={[styles.rowText, { color: palette.text }]}>{t.signOut}</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    ...typography.title,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    color: baseColors.textMuted,
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  row: {
    borderRadius: 14,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  rowText: {
    color: baseColors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  helper: {
    color: baseColors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  dangerRow: {
    borderColor: baseColors.error,
  },
});

export default SettingsScreen;

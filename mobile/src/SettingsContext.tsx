import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors as baseColors } from './theme';

type ThemeMode = 'Dark' | 'Light';
type Language = 'English' | 'Deutsch';

export type AppPalette = {
  background: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryMuted: string;
  success: string;
  warning: string;
  error: string;
};

type SettingsContextValue = {
  language: Language;
  themeMode: ThemeMode;
  palette: AppPalette;
  setLanguage: (lang: Language) => void;
  setThemeMode: (mode: ThemeMode) => void;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const STORAGE_KEY = 'pistis_settings_v1';

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('English');
  const [themeMode, setThemeModeState] = useState<ThemeMode>('Dark');

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { language?: Language; themeMode?: ThemeMode };
          if (parsed.language) setLanguageState(parsed.language);
          if (parsed.themeMode) setThemeModeState(parsed.themeMode);
        }
      } catch (error) {
        console.error('Settings load failed', error);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const persist = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ language, themeMode }));
      } catch (error) {
        console.error('Settings persist failed', error);
      }
    };
    persist();
  }, [language, themeMode]);

  const palette = useMemo<AppPalette>(
    () =>
      themeMode === 'Dark'
        ? {
            background: baseColors.background,
            surface: baseColors.surface,
            border: baseColors.border,
            text: baseColors.text,
            textMuted: baseColors.textMuted,
            primary: baseColors.primary,
            primaryMuted: baseColors.primaryMuted,
            success: baseColors.success,
            warning: baseColors.warning,
            error: baseColors.error,
          }
        : {
            background: '#E9ECF6',
            surface: '#FFFFFF',
            border: '#C9D2E6',
            text: '#0E1A33',
            textMuted: '#55617A',
            primary: '#5C7CFF',
            primaryMuted: '#8FA5FF',
            success: '#2FB488',
            warning: '#E3A546',
            error: '#D96B6B',
          },
    [themeMode]
  );

  const value = useMemo<SettingsContextValue>(
    () => ({
      language,
      themeMode,
      palette,
      setLanguage: (lang) => setLanguageState(lang),
      setThemeMode: (mode) => setThemeModeState(mode),
    }),
    [language, themeMode, palette]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};

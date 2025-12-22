import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme';

type Props = {
  tone?: 'info' | 'error' | 'success';
  message: ReactNode;
};

const toneMap = {
  info: {
    backgroundColor: colors.surface,
    borderColor: colors.primaryMuted,
    textColor: colors.text,
  },
  error: {
    backgroundColor: '#25131A',
    borderColor: colors.error,
    textColor: colors.error,
  },
  success: {
    backgroundColor: '#0E241C',
    borderColor: colors.success,
    textColor: colors.success,
  },
};

export const Banner = ({ tone = 'info', message }: Props) => {
  const palette = toneMap[tone];
  return (
    <View style={[styles.container, { backgroundColor: palette.backgroundColor, borderColor: palette.borderColor }]}>
      <Text style={[styles.text, { color: palette.textColor }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default Banner;

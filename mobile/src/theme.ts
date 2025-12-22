export const colors = {
  background: '#0F1428',
  surface: '#161E36',
  primary: '#6F8CFF',
  primaryMuted: '#9FB6FF',
  text: '#F7F9FF',
  textMuted: '#B8C2D9',
  border: '#232C4A',
  success: '#45D6A6',
  warning: '#F4B967',
  error: '#E07C7C',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  title: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: colors.text,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
  },
  body: {
    fontSize: 15,
    color: colors.textMuted,
  },
};

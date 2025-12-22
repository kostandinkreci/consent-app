import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppStackParamList, Consent } from '../types/navigation';
import { joinConsent } from '../api/consents';
import { colors, spacing, typography } from '../theme';
import Banner from '../components/Banner';

type Props = NativeStackScreenProps<AppStackParamList, 'JoinConsent'>;

const JoinConsentScreen = ({ navigation }: Props) => {
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState<Consent | null>(null);

  const handleJoin = async () => {
    if (!joinCode.trim()) {
      setError('Enter the invite code from your partner.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const consent = await joinConsent(joinCode.trim());
      setJoined(consent);
      Alert.alert('Joined', 'You joined the consent session. You can now review and confirm.');
      navigation.navigate('ConsentDetails', { consentId: consent.id });
    } catch (err) {
      console.error('Join failed', err);
      setError('Join failed. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join Consent</Text>
      <Text style={styles.subtitle}>Paste the join code your partner shared to enter the session.</Text>
      {error ? <Banner tone="error" message={error} /> : null}
      {joined ? <Banner tone="success" message={`Joined: ${joined.title}`} /> : null}

      <TextInput
        style={styles.input}
        placeholder="Join code"
        placeholderTextColor={colors.textMuted}
        value={joinCode}
        onChangeText={setJoinCode}
        autoCapitalize="none"
      />

      <Pressable style={[styles.primaryButton, loading && styles.buttonDisabled]} onPress={handleJoin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Join</Text>}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  title: {
    ...typography.title,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 12,
    padding: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default JoinConsentScreen;

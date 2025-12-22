import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppStackParamList } from '../types/navigation';
import { createConsent } from '../api/consents';
import { colors, spacing, typography } from '../theme';
import Banner from '../components/Banner';

type Props = NativeStackScreenProps<AppStackParamList, 'CreateConsent'>;

const CreateConsentScreen = ({ navigation }: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createConsent({
        title: title.trim(),
        description: description.trim(),
        validFrom,
        validTo,
        partnerEmail: partnerEmail.trim() || undefined,
      });

      Alert.alert('Consent created', 'Your consent session has been created.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Create consent failed', error);
      setError('Could not create the consent right now. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Consent</Text>
      <Text style={styles.subtitle}>Define the details your partner will review and sign.</Text>

      {error ? <Banner tone="error" message={error} /> : null}

      <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} placeholderTextColor={colors.textMuted} />
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        placeholderTextColor={colors.textMuted}
      />
      <TextInput
        style={styles.input}
        placeholder="Valid From"
        value={validFrom}
        onChangeText={setValidFrom}
        placeholderTextColor={colors.textMuted}
      />
      <TextInput
        style={styles.input}
        placeholder="Valid To"
        value={validTo}
        onChangeText={setValidTo}
        placeholderTextColor={colors.textMuted}
      />
      <TextInput
        style={styles.input}
        placeholder="Partner Email (optional)"
        value={partnerEmail}
        onChangeText={setPartnerEmail}
        autoCapitalize="none"
        placeholderTextColor={colors.textMuted}
      />

      <Pressable
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Create</Text>}
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  multiline: {
    height: 120,
    textAlignVertical: 'top',
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

export default CreateConsentScreen;

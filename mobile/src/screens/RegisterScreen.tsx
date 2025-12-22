import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { register as registerRequest } from '../api/auth';
import { useAuth } from '../AuthContext';
import { AuthStackParamList } from '../types/navigation';
import { colors, spacing, typography } from '../theme';
import Banner from '../components/Banner';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleRegister = async () => {
    if (!email.trim() || !password || !confirmPassword || !walletAddress.trim()) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords are identical.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { token, user } = await registerRequest(email.trim(), password, walletAddress.trim());
      login(token, user);
    } catch (error) {
      console.error('Registration failed', error);
      setError('Registration failed. Please check your details and network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.avoiding}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Image source={require('../../assets/pistis-logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Set up your credentials and wallet to manage consent securely.</Text>

          {error ? <Banner tone="error" message={error} /> : null}

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm Password"
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            value={walletAddress}
            onChangeText={setWalletAddress}
            placeholder="Wallet Address"
            autoCapitalize="none"
          />

          <Pressable style={[styles.primaryButton, loading && styles.buttonDisabled]} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Create Account</Text>}
          </Pressable>
          <View style={styles.loginLink}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.secondaryButtonText}>Back to Login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  avoiding: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    gap: spacing.md,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
  },
  title: {
    ...typography.title,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 12,
    padding: spacing.md,
  },
  loginLink: {
    marginTop: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
  },
  footerText: {
    color: colors.textMuted,
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
  secondaryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  secondaryButtonText: {
    color: colors.primaryMuted,
    fontWeight: '600',
  },
});

export default RegisterScreen;

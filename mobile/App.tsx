import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/AuthContext';
import { SettingsProvider } from './src/SettingsContext';

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </SafeAreaProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}

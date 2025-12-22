import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';

import { useAuth } from '../AuthContext';
import { AppStackParamList, AuthStackParamList } from '../types/navigation';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CreateConsentScreen from '../screens/CreateConsentScreen';
import MyConsentsScreen from '../screens/MyConsentsScreen';
import ConsentDetailsScreen from '../screens/ConsentDetailsScreen';
import JoinConsentScreen from '../screens/JoinConsentScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { colors } from '../theme';

enableScreens();

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

const RootNavigator = () => {
  const { isLoggedIn, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <NavigationContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Preparing session...</Text>
        </View>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <AppStack.Navigator>
          <AppStack.Screen name="Home" component={HomeScreen} options={{ title: 'Consent App' }} />
          <AppStack.Screen name="CreateConsent" component={CreateConsentScreen} options={{ title: 'Create Consent' }} />
          <AppStack.Screen name="MyConsents" component={MyConsentsScreen} options={{ title: 'My Consents' }} />
          <AppStack.Screen name="JoinConsent" component={JoinConsentScreen} options={{ title: 'Join Consent' }} />
          <AppStack.Screen name="ConsentDetails" component={ConsentDetailsScreen} options={{ title: 'Consent Details' }} />
          <AppStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        </AppStack.Navigator>
      ) : (
        <AuthStack.Navigator>
          <AuthStack.Screen name="Login" component={LoginScreen} />
          <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    color: colors.text,
    fontSize: 16,
  },
});

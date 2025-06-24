import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import theme from './src/config/theme';

// Screens
import JournalScreen from './src/screens/JournalScreen';
import ActionScreen from './src/screens/ActionScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PinScreen from './src/screens/PinScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Main stack navigator that handles the PIN flow
function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Pin" component={PinScreen} />
      <Stack.Screen name="App" component={AppDrawer} />
    </Stack.Navigator>
  );
}

// Drawer navigator for the main app
function AppDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="Journal"
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        overlayColor: 'transparent',
        drawerStyle: {
          width: '70%',
        },
      }}
    >
      <Drawer.Screen name="Journal" component={JournalScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer theme={{
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            primary: theme.colors.primary,
            background: theme.colors.background,
            card: theme.colors.surface,
            text: theme.colors.text,
            border: theme.colors.placeholder,
          },
        }}>
          <MainStack />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

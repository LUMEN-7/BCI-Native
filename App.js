import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  Anton_400Regular,
  useFonts as useAntonFonts,
} from '@expo-google-fonts/anton';
import {
  TitilliumWeb_400Regular,
  TitilliumWeb_600SemiBold,
  TitilliumWeb_700Bold,
  useFonts as useTitilliumFonts,
} from '@expo-google-fonts/titillium-web';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import appStyles from './src/theme/appStyles';

export default function App() {
  const [antonLoaded] = useAntonFonts({ Anton_400Regular });
  const [titilliumLoaded] = useTitilliumFonts({
    TitilliumWeb_400Regular,
    TitilliumWeb_600SemiBold,
    TitilliumWeb_700Bold,
  });

  if (!antonLoaded || !titilliumLoaded) return null;

  return (
    <GestureHandlerRootView style={appStyles.root}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

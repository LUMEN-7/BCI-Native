import {
  NavigationContainer,
} from "@react-navigation/native";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import {
  View,
} from "react-native";

import { useAuth } from "../context/AuthContext";

import GlobalNavbar from "../components/GlobalNavbar";
import LoadingState from "../components/LoadingState";

import {
  headerOptions,
} from "./styles";

import FloatingNotes from "../components/FloatingNotes";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import TwoFactorScreen from "../screens/TwoFactorScreen";
import WelcomeScreen from "../screens/WelcomeScreen";

import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import VehicleDetailScreen from "../screens/VehicleDetailScreen";

import CompareScreen from "../screens/CompareScreen";
import CompareResultScreen from "../screens/CompareResultScreen";

import SavedScreen from "../screens/SavedScreen";

import NotesScreen from "../screens/NotesScreen";
import NoteEditorScreen from "../screens/NoteEditorScreen";

import AlertsScreen from "../screens/AlertsScreen";

import InsightsScreen from "../screens/InsightsScreen";

import ProfileScreen from "../screens/ProfileScreen";
import EditProfileScreen from "../screens/EditProfileScreen";

import WorkspaceAccessScreen from "../screens/WorkspaceAccessScreen";
import WorkspaceScreen from "../screens/WorkspaceScreen";

const RootStack =
  createNativeStackNavigator();

const MainStack =
  createNativeStackNavigator();

const AuthStackNavigator =
  createNativeStackNavigator();

/*
 * Wrapper usado pelas telas principais.
 *
 * Ele mantém o conteúdo original intacto e apenas
 * coloca o navbar global por cima.
 */
function withGlobalShell(
  ScreenComponent,
  routeName,
  rootScreen = false
) {
  return function GlobalScreen(props) {
    const shellNavigation = rootScreen ? {
      ...props.navigation,
      navigate: (name, params) => ['Home', 'Search', 'Compare', 'Insights', 'Alerts', 'WorkspaceAccess', 'Saved', 'Notes', 'Profile'].includes(name)
        ? props.navigation.navigate('Main', { screen: name, params })
        : props.navigation.navigate(name, params),
    } : props.navigation;
    return (
      <View style={{ flex: 1 }}>
        <ScreenComponent {...props} />

        <GlobalNavbar
          navigation={shellNavigation}
          currentRoute={routeName}
        />

        <FloatingNotes
          navigation={shellNavigation}
        />
      </View>
    );
  };
}

/*
 * Componentes principais com Navbar.
 */

const HomeWithNavbar =
  withGlobalShell(
    HomeScreen,
    "Home"
  );

const VehicleDetailWithNavbar = withGlobalShell(VehicleDetailScreen, 'VehicleDetail', true);

const SearchWithNavbar =
  withGlobalShell(
    SearchScreen,
    "Search"
  );

const CompareWithNavbar =
  withGlobalShell(
    CompareScreen,
    "Compare"
  );

const InsightsWithNavbar =
  withGlobalShell(
    InsightsScreen,
    "Insights"
  );

const AlertsWithNavbar =
  withGlobalShell(
    AlertsScreen,
    "Alerts"
  );

const WorkspaceAccessWithNavbar =
  withGlobalShell(
    WorkspaceAccessScreen,
    "WorkspaceAccess"
  );

const SavedWithNavbar =
  withGlobalShell(
    SavedScreen,
    "Saved"
  );

const NotesWithNavbar =
  withGlobalShell(
    NotesScreen,
    "Notes"
  );

const ProfileWithNavbar =
  withGlobalShell(
    ProfileScreen,
    "Profile"
  );

/*
 * Navegação principal.
 *
 * Não usamos mais Drawer.
 * O próprio GlobalNavbar controla a navegação.
 */
function MainNavigator() {
  return (
    <MainStack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,

        contentStyle: {
          backgroundColor: "#F7F7F5",
        },
      }}
    >
      <MainStack.Screen
        name="Home"
        component={HomeWithNavbar}
      />

      <MainStack.Screen
        name="Search"
        component={SearchWithNavbar}
      />

      <MainStack.Screen
        name="Compare"
        component={CompareWithNavbar}
      />

      <MainStack.Screen
        name="Insights"
        component={InsightsWithNavbar}
      />

      <MainStack.Screen
        name="Alerts"
        component={AlertsWithNavbar}
      />

      <MainStack.Screen
        name="WorkspaceAccess"
        component={
          WorkspaceAccessWithNavbar
        }
      />

      <MainStack.Screen
        name="Saved"
        component={SavedWithNavbar}
      />

      <MainStack.Screen
        name="Notes"
        component={NotesWithNavbar}
      />

      <MainStack.Screen
        name="Profile"
        component={ProfileWithNavbar}
      />
    </MainStack.Navigator>
  );
}

/*
 * Login / cadastro.
 *
 * Aqui o navbar não aparece.
 */
function AuthStack() {
  return (
    <AuthStackNavigator.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStackNavigator.Screen
        name="Login"
        component={LoginScreen}
      />

      <AuthStackNavigator.Screen
        name="Register"
        component={RegisterScreen}
      />

      <AuthStackNavigator.Screen
        name="ResetPassword"
        component={
          ResetPasswordScreen
        }
      />

      <AuthStackNavigator.Screen
        name="TwoFactor"
        component={TwoFactorScreen}
      />
    </AuthStackNavigator.Navigator>
  );
}

/*
 * Stack autenticada.
 *
 * Main = telas normais com navbar global.
 *
 * As telas abaixo são fluxos secundários
 * como detalhe e edição.
 */
function AppStack() {
  const { user } = useAuth();

  const displayName =
    user?.nomeExibicao ||
    user?.NomeExibicao ||
    user?.userName ||
    "";

  const needsWelcome =
    !displayName.trim();

  return (
    <RootStack.Navigator
      initialRouteName={
        needsWelcome
          ? "Welcome"
          : "Main"
      }
      screenOptions={
        headerOptions
      }
    >
      <RootStack.Screen
        name="Main"
        component={MainNavigator}
        options={{
          headerShown: false,
        }}
      />

      <RootStack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          headerShown: false,
        }}
      />

      <RootStack.Screen
        name="VehicleDetail"
        component={
          VehicleDetailWithNavbar
        }
        options={{
          headerShown: false,
        }}
      />

      <RootStack.Screen
        name="CompareResult"
        component={
          CompareResultScreen
        }
        options={{
          title: "Comparação",
        }}
      />

      <RootStack.Screen
        name="NoteEditor"
        component={
          NoteEditorScreen
        }
        options={{
          title: "BCI Nota",
        }}
      />

      <RootStack.Screen
        name="EditProfile"
        component={
          EditProfileScreen
        }
        options={{
          title: "Editar perfil",
        }}
      />

      <RootStack.Screen
        name="ResetPassword"
        component={
          ResetPasswordScreen
        }
        options={{
          title:
            "Redefinir senha",
        }}
      />

      <RootStack.Screen
        name="Workspace"
        component={
          WorkspaceScreen
        }
        options={{
          title: "Workspace",
        }}
      />
    </RootStack.Navigator>
  );
}

export default function AppNavigator() {
  const {
    user,
    booting,
  } = useAuth();

  if (booting) {
    return (
      <LoadingState
        label="Preparando o BCI..."
      />
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <AppStack />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

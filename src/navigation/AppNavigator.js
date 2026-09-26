import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import DrawerContent from '../components/DrawerContent';
import LoadingState from '../components/LoadingState';
import { drawerStyle, headerOptions } from './styles';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import TwoFactorScreen from '../screens/TwoFactorScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import VehicleDetailScreen from '../screens/VehicleDetailScreen';
import CompareScreen from '../screens/CompareScreen';
import CompareResultScreen from '../screens/CompareResultScreen';
import SavedScreen from '../screens/SavedScreen';
import NotesScreen from '../screens/NotesScreen';
import NoteEditorScreen from '../screens/NoteEditorScreen';
import AlertsScreen from '../screens/AlertsScreen';
import InsightsScreen from '../screens/InsightsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import WorkspaceAccessScreen from '../screens/WorkspaceAccessScreen';
import WorkspaceScreen from '../screens/WorkspaceScreen';

const Stack=createNativeStackNavigator(); const Drawer=createDrawerNavigator();
function MainDrawer(){return <Drawer.Navigator drawerContent={(p)=><DrawerContent {...p}/>} screenOptions={{...headerOptions,drawerType:'front',drawerStyle}}>
  <Drawer.Screen name="Home" component={HomeScreen} options={{title:'Início'}}/><Drawer.Screen name="Search" component={SearchScreen} options={{title:'Pesquisar'}}/><Drawer.Screen name="Compare" component={CompareScreen} options={{title:'Comparar'}}/><Drawer.Screen name="Insights" component={InsightsScreen}/><Drawer.Screen name="Alerts" component={AlertsScreen} options={{title:'Alertas'}}/><Drawer.Screen name="WorkspaceAccess" component={WorkspaceAccessScreen} options={{title:'Workspace'}}/><Drawer.Screen name="Saved" component={SavedScreen} options={{title:'Salvos'}}/><Drawer.Screen name="Notes" component={NotesScreen} options={{title:'BCI Notas'}}/><Drawer.Screen name="Profile" component={ProfileScreen} options={{title:'Perfil'}}/>
</Drawer.Navigator>}
function AuthStack(){return <Stack.Navigator screenOptions={{headerShown:false}}><Stack.Screen name="Login" component={LoginScreen}/><Stack.Screen name="Register" component={RegisterScreen}/><Stack.Screen name="ResetPassword" component={ResetPasswordScreen}/><Stack.Screen name="TwoFactor" component={TwoFactorScreen}/></Stack.Navigator>}
function AppStack(){const {user}=useAuth(); const needsWelcome=!(user?.nomeExibicao||user?.NomeExibicao||user?.userName||'').trim(); return <Stack.Navigator initialRouteName={needsWelcome?'Welcome':'Main'} screenOptions={headerOptions}><Stack.Screen name="Main" component={MainDrawer} options={{headerShown:false}}/><Stack.Screen name="Welcome" component={WelcomeScreen} options={{headerShown:false}}/><Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} options={{title:'Modelo'}}/><Stack.Screen name="CompareResult" component={CompareResultScreen} options={{title:'Comparação'}}/><Stack.Screen name="NoteEditor" component={NoteEditorScreen} options={{title:'BCI Nota'}}/><Stack.Screen name="EditProfile" component={EditProfileScreen} options={{title:'Editar perfil'}}/><Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{title:'Redefinir senha'}}/><Stack.Screen name="Workspace" component={WorkspaceScreen} options={{title:'Workspace'}}/></Stack.Navigator>}
export default function AppNavigator(){const {user,booting}=useAuth(); if(booting)return <LoadingState label="Preparando o BCI..."/>; return <NavigationContainer>{user?<AppStack/>:<AuthStack/>}</NavigationContainer>}

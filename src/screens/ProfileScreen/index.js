import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import { Action, Feedback, Heading, s } from '../../components/MobileUI';
import { useAuth } from '../../context/AuthContext';
import { pick } from '../../utils/vehicleAdapters';
export default function ProfileScreen({
  navigation
}) {
  const {
      user,
      signOut
    } = useAuth(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const name = pick(user, 'nomeExibicao', 'userName') || 'Usuário',
    email = pick(user, 'email') || '',
    photo = pick(user, 'fotoPerfilUrl');
  async function logout() {
    setBusy(true);
    try {
      await signOut();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return <Screen><View style={[s.panel, {
      alignItems: 'center',
      paddingVertical: 32,
      gap: 20
    }]}>{photo ? <Image source={{
        uri: photo
      }} style={{
        width: 96,
        height: 96,
        borderRadius: 96
      }} /> : <View style={{
        width: 96,
        height: 96,
        borderRadius: 96,
        backgroundColor: '#00142E',
        alignItems: 'center',
        justifyContent: 'center'
      }}><Text style={[s.title, s.white, {
          fontSize: 40
        }]}>{name[0].toUpperCase()}</Text></View>}<Text style={s.eyebrow}>SEU PERFIL</Text><Text style={[s.title, {
        fontSize: 43,
        lineHeight: 49,
        textAlign: 'center'
      }]}>{name}</Text><Text style={[s.body, {
        textAlign: 'center'
      }]}>{email}</Text></View><Heading eyebrow="Preferências" title="CONFIGURAÇÕES" description="Gerencie seus dados e sua experiência no app." />
    {[['EditProfile', 'pencil-outline', 'Editar perfil', 'Atualize seus dados e sua foto.'], ['ResetPassword', 'lock-closed-outline', 'Redefinir senha', 'Mantenha sua conta protegida.']].map(([route, icon, title, body]) => <Pressable key={route} accessibilityRole="button" style={[s.panel, s.row]} onPress={() => navigation.navigate(route)}><Ionicons name={icon} size={23} color="#0562D2" /><View style={s.grow}><Text style={s.strong}>{title}</Text><Text style={s.body}>{body}</Text></View><Ionicons name="chevron-forward-outline" size={20} color="#8290A0" /></Pressable>)}
    <View style={{
      gap: 12,
      marginTop: 20,
      paddingTop: 24,
      borderTopWidth: 1,
      borderColor: '#E1E5EB'
    }}><Heading title="ENCERRAR SESSÃO" description="Você poderá entrar novamente quando precisar." /><Action secondary danger icon="log-out-outline" title="Sair da conta" loading={busy} onPress={logout} /><Feedback error={error} /></View>
  </Screen>;
}

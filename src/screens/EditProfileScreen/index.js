import { useState } from 'react';
import { Image, Linking, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Screen from '../../components/Screen';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import { Action, Back, Feedback, Heading, s } from '../../components/MobileUI';
import { beginTwoFactor, confirmTwoFactor, disableTwoFactor, removeProfilePhoto, updateProfile, uploadProfilePhoto } from '../../services/userService';
import { updateStoredUser } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { pick } from '../../utils/vehicleAdapters';
export default function EditProfileScreen({
  navigation
}) {
  const {
      user,
      setUser
    } = useAuth(),
    [name, setName] = useState(pick(user, 'nomeExibicao', 'userName') || ''),
    [photo, setPhoto] = useState(pick(user, 'fotoPerfilUrl') || null),
    [setup, setSetup] = useState(null),
    [code, setCode] = useState(''),
    [enabled, setEnabled] = useState(pick(user, 'doisFatoresAtivo') === true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  async function patch(changes) {
    setUser(await updateStoredUser(changes));
  }
  async function run(operation) {
    if (busy) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await operation();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function choose() {
    await run(async () => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) throw new Error('Permita acesso às fotos para escolher uma imagem.');
      const r = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: .8,
        allowsEditing: true,
        aspect: [1, 1]
      });
      if (r.canceled) return;
      const response = await uploadProfilePhoto(r.assets[0]),
        uri = pick(response, 'fotoPerfilUrl');
      if (!uri) throw new Error('Não foi possível obter a foto atualizada.');
      setPhoto(uri);
      await patch({
        fotoPerfilUrl: uri
      });
      setMessage('Foto atualizada.');
    });
  }
  const qr = pick(setup, 'qrCodeUri', 'qrCode') || '',
    manual = pick(setup, 'chaveManual') || (() => {
      try {
        return new URL(qr).searchParams.get('secret');
      } catch {
        return '';
      }
    })();
  return <Screen><PageHeader eyebrow="Sua conta" title="EDITAR PERFIL" description="Personalize sua identidade e proteja seu acesso." /><Back navigation={navigation} />
    <View style={s.panel}><Heading eyebrow="Identidade" title="FOTO DO PERFIL" />{photo ? <Image source={{
        uri: photo
      }} style={{
        width: 96,
        height: 96,
        borderRadius: 96
      }} /> : <View style={{
        width: 96,
        height: 96,
        borderRadius: 96,
        backgroundColor: '#EDF4FC',
        alignItems: 'center',
        justifyContent: 'center'
      }}><Text style={s.title}>{name[0]?.toUpperCase() || 'U'}</Text></View>}<Text style={s.body}>Escolha uma foto para identificar você no BCI.</Text><View style={s.wrap}><Action title="Trocar foto" icon="camera-outline" disabled={busy} onPress={choose} />{photo && <Action secondary title="Remover foto" disabled={busy} onPress={() => run(async () => {
          await removeProfilePhoto();
          setPhoto(null);
          await patch({
            fotoPerfilUrl: null
          });
        })} />}</View></View>
    <View style={s.panel}><Heading eyebrow="Dados pessoais" title="SUAS INFORMAÇÕES" /><FormField label="Nome de exibição" value={name} onChangeText={setName} maxLength={100} /><FormField label="E-mail" value={pick(user, 'email') || ''} editable={false} /><Action title="Salvar alterações" loading={busy} onPress={() => run(async () => {
        if (name.trim().length < 2) throw new Error('Informe um nome com pelo menos 2 caracteres.');
        await updateProfile(name.trim());
        await patch({
          nomeExibicao: name.trim()
        });
        setMessage('Perfil atualizado.');
      })} /></View>
    <View style={s.panel}><Heading eyebrow="Segurança" title="AUTENTICAÇÃO EM DUAS ETAPAS" description="Adicione uma camada de proteção com seu aplicativo autenticador." /><Text style={[s.strong, {
        color: enabled ? '#16876E' : '#687482'
      }]}>{enabled ? 'Proteção ativada' : 'Proteção desativada'}</Text>
      {enabled ? <Action secondary title="Desativar 2FA" disabled={busy} onPress={() => run(async () => {
        await disableTwoFactor();
        setEnabled(false);
        await patch({
          doisFatoresAtivo: false
        });
        setMessage('Autenticação em duas etapas desativada.');
      })} /> : setup ? <><Text style={s.body}>1. Adicione esta conta ao seu aplicativo autenticador.</Text>{/^data:image\//.test(qr) && <Image source={{
          uri: qr
        }} style={{
          width: 190,
          height: 190
        }} />}{manual && <Text selectable style={[s.strong, {
          letterSpacing: 2
        }]}>{manual}</Text>}{/^otpauth:\/\//.test(qr) && <Action secondary title="Abrir autenticador" onPress={() => Linking.openURL(qr).catch(() => setError('Abra seu autenticador e informe a chave manual.'))} />}<Text style={s.body}>2. Digite o código de seis dígitos gerado pelo aplicativo.</Text><FormField label="Código de verificação" value={code} onChangeText={v => setCode(v.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" /><Action title="Confirmar 2FA" disabled={busy || code.length !== 6} onPress={() => run(async () => {
          await confirmTwoFactor(code);
          setEnabled(true);
          setSetup(null);
          setCode('');
          await patch({
            doisFatoresAtivo: true
          });
          setMessage('Autenticação em duas etapas ativada.');
        })} /><Action secondary title="Cancelar configuração" disabled={busy} onPress={() => {
          setSetup(null);
          setCode('');
        }} /></> : <Action title="Ativar 2FA" disabled={busy} onPress={() => run(async () => setSetup(await beginTwoFactor()))} />}
    </View><Feedback error={error} />{!!message && <Text accessibilityRole="alert" style={[s.body, {
      color: '#16876E'
    }]}>{message}</Text>}
  </Screen>;
}

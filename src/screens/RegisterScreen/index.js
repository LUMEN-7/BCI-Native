import { useState } from 'react';
import { Text } from 'react-native';
import AuthFrame from '../../components/MobileUI/AuthFrame';
import { Action, Back, Feedback, Heading, s } from '../../components/MobileUI';
import FormField from '../../components/FormField';
import { register } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { isValidEmail, validatePassword } from '../../utils/validators';
export default function RegisterScreen({
  navigation
}) {
  const {
      establish
    } = useAuth(),
    [name, setName] = useState(''),
    [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [confirm, setConfirm] = useState(''),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(false);
  async function submit() {
    const pass = validatePassword(password);
    if (name.trim().length < 3 || !isValidEmail(email) || pass.length || password !== confirm) return setError(password !== confirm ? 'As senhas não coincidem.' : pass.length ? 'A senha precisa ter ' + pass.join(', ') + '.' : 'Revise nome e e-mail.');
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const result = await register(name.trim(), email.trim(), password);
      await establish(result);
    } catch (e) {
      setError(e.message || 'Não foi possível criar a conta.');
    } finally {
      setLoading(false);
    }
  }
  return <AuthFrame><Back navigation={navigation} /><Text style={s.eyebrow}>FORD · BCI</Text><Heading eyebrow="Cadastro" title="CRIAR CONTA." description="Crie seu acesso para começar a explorar análises de inteligência competitiva." /><FormField label="Nome" value={name} onChangeText={setName} /><FormField label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" /><FormField label="Senha" value={password} onChangeText={setPassword} secureTextEntry /><FormField label="Confirmar senha" value={confirm} onChangeText={setConfirm} secureTextEntry /><Text style={s.meta}>Mínimo de 8 caracteres, uma letra maiúscula e um número.</Text><Feedback error={error} /><Action title="Cadastrar" icon="arrow-forward-outline" loading={loading} onPress={submit} /><Action secondary title="Já tenho conta" onPress={() => navigation.goBack()} /></AuthFrame>;
}

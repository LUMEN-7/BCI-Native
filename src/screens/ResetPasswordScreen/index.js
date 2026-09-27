import { useState } from 'react';
import { Text, View } from 'react-native';
import Screen from '../../components/Screen';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import { Action, Back, Feedback, Heading, s } from '../../components/MobileUI';
import { requestPasswordReset, resetPassword } from '../../services/authService';
import { isValidEmail, validatePassword } from '../../utils/validators';
export default function ResetPasswordScreen({
  navigation
}) {
  const [email, setEmail] = useState(''),
    [code, setCode] = useState(''),
    [password, setPassword] = useState(''),
    [confirm, setConfirm] = useState(''),
    [step, setStep] = useState(1),
    [message, setMessage] = useState(''),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(false);
  async function send() {
    if (!isValidEmail(email)) return setError('Informe um e-mail válido.');
    setLoading(true);
    setError('');
    try {
      await requestPasswordReset(email.trim());
      setStep(2);
      setMessage('Código enviado para seu e-mail.');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  async function finish() {
    const missing = validatePassword(password);
    if (code.length !== 6 || missing.length || password !== confirm) return setError(code.length !== 6 ? 'Informe o código de 6 dígitos.' : password !== confirm ? 'As senhas não coincidem.' : 'A senha precisa ter ' + missing.join(', ') + '.');
    setLoading(true);
    setError('');
    try {
      await resetPassword(email.trim(), code, password);
      setStep(3);
      setMessage('Senha alterada com sucesso.');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  return <Screen><Back navigation={navigation} /><PageHeader eyebrow="Segurança" title="REDEFINIR SENHA" description="Confirme sua identidade e defina uma nova senha para recuperar seu acesso." /><View style={s.panel}><Heading eyebrow="01 · Verificação" title="CONFIRME SUA IDENTIDADE" /><FormField label="E-mail" value={email} onChangeText={setEmail} editable={step === 1} keyboardType="email-address" autoCapitalize="none" />{step === 1 ? <Action title="Enviar código" loading={loading} onPress={send} /> : step === 2 ? <><FormField label="Código recebido por e-mail" value={code} onChangeText={v => setCode(v.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" /><Action secondary title="Reenviar código" disabled={loading} onPress={send} /><Action secondary title="Usar outro e-mail" disabled={loading} onPress={() => {
          setStep(1);
          setCode('');
          setMessage('');
        }} /></> : null}</View>{step === 2 && <View style={s.panel}><Heading eyebrow="02 · Nova senha" title="PROTEJA SUA CONTA" /><FormField label="Nova senha" value={password} onChangeText={setPassword} secureTextEntry /><FormField label="Confirmar nova senha" value={confirm} onChangeText={setConfirm} secureTextEntry /><Action title="Redefinir senha" loading={loading} onPress={finish} /></View>}<Feedback error={error} />{!!message && <Text accessibilityRole="alert" style={[s.body, {
      color: '#16876E'
    }]}>{message}</Text>}{step === 3 && <Action title="Voltar" onPress={() => navigation.goBack()} />}</Screen>;
}

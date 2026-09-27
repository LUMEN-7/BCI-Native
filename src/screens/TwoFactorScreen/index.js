import { useState } from 'react';
import { Text, View } from 'react-native';
import FormField from '../../components/FormField';
import { Action as AppButton } from '../../components/MobileUI';
import AuthFrame from '../../components/MobileUI/AuthFrame';
import { verifyTwoFactor } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import styles from './styles';
export default function TwoFactorScreen({
  route
}) {
  const {
    establish
  } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit() {
    if (code.length !== 6) {
      setError('Digite os 6 números do código.');
      return;
    }
    setLoading(true);
    try {
      await establish(await verifyTwoFactor(route.params?.challengeToken, code));
    } catch (e) {
      setError(e.message || 'Código inválido.');
    } finally {
      setLoading(false);
    }
  }
  return <AuthFrame><View style={styles.card}><Text style={styles.kicker}>SEGURANÇA</Text><Text style={styles.title}>VERIFICAÇÃO EM DUAS ETAPAS</Text><Text style={styles.body}>Digite o código do seu autenticador para concluir o login.</Text><FormField label="Código" value={code} onChangeText={v => setCode(v.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" error={error} /><AppButton title="Verificar" onPress={submit} loading={loading} /></View></AuthFrame>;
}

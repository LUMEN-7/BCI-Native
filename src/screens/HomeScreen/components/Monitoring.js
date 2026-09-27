import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { pick } from '../../../utils/vehicleAdapters';
import SectionHeading from './SectionHeading';
import styles from '../styles';
export default function Monitoring({ alerts, loading, onReview }) {
  const latest = alerts?.[0];
  return <View style={styles.section}>
    <SectionHeading>MONITORAMENTO</SectionHeading>
    {alerts === null ? loading ? <ActivityIndicator color="#0562D2"/> : <Text style={styles.body}>Não foi possível consultar os alertas.</Text> : alerts.length ? <>
      <View style={styles.monitoringHeading}><Text style={styles.monitoringTitle}>{alerts.length === 1 ? 'ALERTA AGUARDA REVISÃO' : 'ALERTAS AGUARDAM REVISÃO'}</Text><Ionicons name="warning-outline" size={27} color="#8393A7"/></View>
      <Text style={styles.monitoringDescription}>{alerts.length} {alerts.length === 1 ? 'notificação não lida' : 'notificações não lidas'} para acompanhar.</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Revisar alertas" onPress={onReview} style={({ pressed }) => [styles.alertCard, pressed && styles.pressed]}><View style={styles.alertDot}/><View style={styles.flex}><Text style={styles.alertTitle}>{pick(latest, 'titulo') || 'Atualização disponível'}</Text>{typeof pick(latest, 'mensagem', 'subtitulo') === 'string' && <Text style={styles.body}>{pick(latest, 'mensagem', 'subtitulo')}</Text>}<View style={styles.reviewLink}><Text style={styles.linkText}>Revisar alertas</Text><Ionicons name="arrow-forward" size={16} color="#0562D2"/></View></View></Pressable>
    </> : <Pressable accessibilityRole="button" accessibilityLabel="Abrir alertas" onPress={onReview} style={styles.alertsEmpty}><View style={styles.checkCircle}><Ionicons name="checkmark-outline" size={24} color="#2B8F6C"/></View><View style={styles.flex}><Text style={styles.allClear}>Monitoramento em dia</Text><Text style={styles.body}>Nenhum alerta não lido.</Text></View></Pressable>}
  </View>;
}

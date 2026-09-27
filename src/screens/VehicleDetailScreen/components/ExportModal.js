import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Action from '../../../components/SearchAction';
import { exportCar } from '../../../services/exportService';
import styles from '../styles';

export default function ExportModal({ lineageId, onClose }) {
  const [format, setFormat] = useState('csv');
  const [separator, setSeparator] = useState(',');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  async function confirm() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try { await exportCar(lineageId, format, separator); onClose(); }
    catch (e) { setError(e.message || 'Não foi possível exportar o veículo.'); }
    finally { lock.current = false; setBusy(false); }
  }
  return <Modal visible transparent animationType="fade" onRequestClose={() => !busy && onClose()}><SafeAreaView style={styles.modalBackdrop}><View accessibilityViewIsModal style={styles.exportSheet}><ScrollView contentContainerStyle={styles.exportContent}>
    <View style={styles.legendHeader}><View style={styles.flex}><Text style={styles.eyebrow}>EXPORTAÇÃO</Text><Text accessibilityRole="header" style={styles.sectionTitle}>EXPORTAR DADOS</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Fechar exportação" disabled={busy} onPress={onClose} style={styles.circle}><Ionicons name="close-outline" size={24} color="#00142E"/></Pressable></View>
    <Text style={styles.body}>Escolha o formato dos dados do servidor.</Text>
    <View style={styles.formats}>{['csv', 'xlsx', 'json', 'xml'].map(option => <Pressable accessibilityRole="radio" accessibilityState={{ checked: format === option, disabled: busy }} disabled={busy} onPress={() => setFormat(option)} key={option} style={[styles.format, format === option && styles.formatSelected]}><Text style={styles.subheading}>{option.toUpperCase()}</Text></Pressable>)}</View>
    {format === 'csv' && <View style={styles.separatorOptions}><Text style={styles.subheading}>Separador do CSV</Text>{[[',', 'Vírgula (,)'], [';', 'Ponto e vírgula (;)']].map(([value, label]) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: separator === value, disabled: busy }} disabled={busy} style={styles.separatorOption} key={value} onPress={() => setSeparator(value)}><Ionicons name={separator === value ? 'radio-button-on-outline' : 'radio-button-off-outline'} size={22} color="#0562D2"/><Text style={styles.body}>{label}</Text></Pressable>)}</View>}
    <Text style={styles.muted}>A ficha complementar guardada apenas neste dispositivo não faz parte da exportação do servidor.</Text>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    <Action title={busy ? 'Preparando exportação...' : 'Salvar ou compartilhar'} icon="share-outline" loading={busy} onPress={confirm}/>
    <Action title="Cancelar" variant="ghost" disabled={busy} onPress={onClose}/>
  </ScrollView></View></SafeAreaView></Modal>;
}

import { useRef, useState } from 'react';
import { Image, Platform, Pressable, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import AppButton from '../../components/SearchAction';
import FormField from './SearchField';
import { importVehicle } from '../../services/carsService';
import { EMPTY_VEHICLE, FIELD_GROUPS, FEATURE_GROUPS, buildImportPayload, normalizeVehicle, parseVehicleFile } from '../../utils/vehicleImport';
import ModalShell from './ModalShell';
import styles from './modalStyles';

export default function ImportVehicleModal({ initialVehicle, onClose, onSaved }) {
  const [step, setStep] = useState(initialVehicle ? 'form' : 'choice');
  const [vehicle, setVehicle] = useState(() => ({ ...EMPTY_VEHICLE, ...normalizeVehicle(initialVehicle?.raw || {}), ...(initialVehicle?.importForm || {}) }));
  const [fileName, setFileName] = useState('');
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  function update(field, value) { setVehicle(current => ({ ...current, [field]: value })); setError(''); }
  async function perform(operation) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try { await operation(); } catch (e) { setError(e.message || 'Não foi possível concluir a operação.'); }
    finally { lock.current = false; setBusy(false); }
  }
  function readFile() {
    perform(async () => {
      const result = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/csv', 'text/comma-separated-values', 'text/plain', 'application/vnd.ms-excel'], copyToCacheDirectory: true, multiple: false });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (asset.size > 5 * 1024 * 1024) throw new Error('Escolha um arquivo de até 5 MB.');
      const text = Platform.OS === 'web' ? await asset.file.text() : await new File(asset.uri).text();
      const parsed = parseVehicleFile(text, asset.name);
      setFileName(asset.name); setRecords(parsed);
      if (parsed.length === 1) { setVehicle(parsed[0]); setStep('form'); }
      else setStep('select');
    });
  }
  function photo() {
    perform(async () => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) throw new Error('Permita o acesso às fotos para enviar uma imagem.');
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.7, base64: true });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset.base64) throw new Error('Não foi possível ler a imagem selecionada.');
      if (asset.base64.length > 7 * 1024 * 1024) throw new Error('Escolha uma imagem menor (até 5 MB).');
      update('image', `data:image/jpeg;base64,${asset.base64}`);
    });
  }
  function review() {
    try { buildImportPayload(vehicle); setError(''); setStep('review'); }
    catch (e) { setError(e.message); }
  }
  function save() {
    perform(async () => {
      const result = await importVehicle(buildImportPayload(vehicle));
      if (!result?.carro || !(result.carro.linhagemId ?? result.carro.id)) throw new Error('O servidor não retornou o veículo salvo. Atualize a pesquisa antes de tentar novamente.');
      await onSaved(result, vehicle, initialVehicle?.id);
      onClose();
    });
  }
  const allFields = [...FIELD_GROUPS.flatMap(group => group.fields), ...FEATURE_GROUPS];
  return <ModalShell kind="import" title={step === 'choice' ? 'Como deseja importar?' : step === 'review' ? 'Revisar antes de salvar' : initialVehicle ? 'Editar veículo importado' : 'Ficha do veículo'} onClose={onClose} busy={busy}>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    {step === 'choice' ? <>
      <Pressable accessibilityRole="button" disabled={busy} onPress={readFile} style={styles.choiceCard}><Ionicons name="cloud-upload-outline" size={32} color="#0562D2"/><Text style={styles.choiceTitle}>{busy ? 'Lendo arquivo...' : 'Importar automaticamente do arquivo'}</Text><Text style={styles.text}>Leia um CSV ou JSON e preencha a ficha com os dados encontrados.</Text></Pressable>
      <Pressable accessibilityRole="button" disabled={busy} onPress={() => setStep('form')} style={styles.choiceCard}><Ionicons name="document-text-outline" size={32} color="#0562D2"/><Text style={styles.choiceTitle}>Preencher ficha manualmente</Text><Text style={styles.text}>Comece com uma ficha vazia e informe os dados do veículo.</Text></Pressable>
    </> : step === 'select' ? <>
      <Text style={styles.text}>{fileName}: {records.length} veículos. Escolha uma ficha para revisar e salvar.</Text>
      {records.map((record, i) => <Pressable key={i} accessibilityRole="button" style={styles.choice} onPress={() => { setVehicle(record); setStep('form'); }}><Text style={styles.text}>{i + 1}. {record.brand} {record.modelo} {record.ano}</Text></Pressable>)}
      <AppButton title="Escolher outro arquivo" variant="ghost" onPress={readFile} loading={busy}/>
    </> : <>
      {!!fileName && <Text style={styles.text}>Arquivo: {fileName}</Text>}
      {!!vehicle.image && <Image accessibilityLabel="Imagem do veículo" source={{ uri: vehicle.image }} style={styles.image}/>}
      {step === 'form' ? <>
        <AppButton title="Enviar imagem" variant="secondary" disabled={busy} onPress={photo}/>
        <FormField label="URL da imagem (opcional)" value={vehicle.image?.startsWith('data:') ? '' : vehicle.image || ''} onChangeText={value => update('image', value)} autoCapitalize="none" editable={!busy}/>
        {!!vehicle.image && <AppButton title="Remover imagem" variant="ghost" disabled={busy} onPress={() => update('image', '')}/>}
        {FIELD_GROUPS.map(group => <View key={group.title} style={styles.card}><Text style={styles.eyebrow}>FICHA TÉCNICA</Text><Text style={styles.sectionTitle}>{group.title}</Text>{group.fields.map(([field, label, placeholder]) => <FormField key={field} label={label} value={String(vehicle[field] ?? '')} placeholder={placeholder} editable={!busy} onChangeText={value => update(field, value)}/>)}</View>)}
        <View style={styles.card}><Text style={styles.heading}>Itens adicionais</Text>{FEATURE_GROUPS.map(([field, label]) => <FormField key={field} label={`${label} (um por linha)`} multiline value={Array.isArray(vehicle[field]) ? vehicle[field].join('\n') : String(vehicle[field] || '')} editable={!busy} onChangeText={value => update(field, value)}/>)}</View>
        <AppButton title="Revisar ficha" disabled={busy} onPress={review}/>
        {!initialVehicle && <AppButton title="Voltar às opções" disabled={busy} variant="ghost" onPress={() => setStep('choice')}/>}
      </> : <>
        <View style={styles.card}>{allFields.filter(([field]) => vehicle[field]).map(([field, label]) => <View key={field}><Text style={styles.heading}>{label}</Text><Text style={styles.text}>{String(vehicle[field])}</Text></View>)}</View>
        <Text style={styles.text}>Motor, consumo geral, descrição e itens adicionais ficam na ficha deste dispositivo. Os demais campos serão enviados ao servidor.</Text>
        {initialVehicle && <Text style={styles.text}>A ficha revisada será reenviada pela importação, como no web. A API determina a versão e a linhagem resultantes.</Text>}
        <AppButton title={initialVehicle ? 'Salvar ficha revisada' : 'Salvar veículo'} loading={busy} onPress={save}/>
        <AppButton title="Voltar e corrigir" disabled={busy} variant="secondary" onPress={() => setStep('form')}/>
      </>}
    </>}
  </ModalShell>;
}

import { Alert, Linking, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ConfidenceBadge from '../../../components/ConfidenceBadge';
import { isMissing, resolveSource } from '../../../utils/vehicleAdapters';
import styles from '../styles';

export function SourceLink({ source, sources }) {
  const resolved = resolveSource(source, sources);
  if (!resolved) return null;
  if (!resolved.url) return <Text style={styles.sourceText}>{resolved.name}</Text>;
  return <Pressable accessibilityRole="link" accessibilityLabel={`Abrir fonte ${resolved.name}`} style={styles.sourceLink} onPress={() => Linking.openURL(resolved.url).catch(() => Alert.alert('Fonte indisponível', 'Não foi possível abrir este endereço.'))}>
    <Ionicons name="link-outline" size={14} color="#0562D2"/><Text style={styles.sourceText}>{resolved.name}</Text>
  </Pressable>;
}
export default function FieldEvidence({ field, sources, showSources }) {
  if (!field || isMissing(field)) return null;
  return <View style={styles.evidence}>
    {field.origin === 'ai' ? <Text style={styles.aiTag}>Estimado por IA · 0%</Text> : field.origin === 'imported' ? <Text style={styles.muted}>Informado na importação · sem verificação</Text> : <ConfidenceBadge confidence={field.confidence} conflict={field.conflict}/>}
    {field.conflict && <Text style={styles.conflict}>Fontes com valores divergentes</Text>}
    {showSources && field.origin !== 'ai' && <>
      {field.source != null ? <SourceLink source={field.source} sources={sources}/> : <Text style={styles.muted}>Fonte não informada</Text>}
      {field.conflict && field.alternatives?.map((item, index) => <View style={styles.alternative} key={index}>
        <Text style={styles.body}>{item.value} · {item.confidence}%</Text><SourceLink source={item.source} sources={sources}/>
      </View>)}
    </>}
  </View>;
}

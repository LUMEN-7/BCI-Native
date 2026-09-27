import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isMissing } from '../../../utils/vehicleAdapters';
import FieldEvidence from './FieldEvidence';
import styles from '../styles';

const specs = [['engine', 'speedometer-outline', 'Motor'], ['power', 'flash-outline', 'Potência'], ['type', 'car-sport-outline', 'Tipo'], ['consumption', 'water-outline', 'Consumo']];
function summary(field) {
  if (isMissing(field)) return 'Dado não disponível';
  if (field.origin === 'ai') return 'Estimado por IA · 0%';
  if (field.origin === 'imported') return 'Informado na importação';
  return `${field.confidence}% de confiança${field.conflict ? ' · conflito' : ''}`;
}
export default function MainSpecs({ car, showSources }) {
  return <View style={styles.specGrid}>{specs.map(([key, icon, label]) => <View key={key} style={styles.specCell}>
    <View style={styles.specCard}>
      <View style={styles.specIcon}><Ionicons name={icon} size={18} color="#DBE4EF"/></View>
      <Text style={styles.specLabel}>{label}</Text><Text style={styles.specValue}>{car.specs[key].value}</Text>
      <Text style={styles.specMeta}>{summary(car.specs[key])}</Text>
    </View>
    {showSources && !isMissing(car.specs[key]) && <View style={styles.specSources}><FieldEvidence field={car.specs[key]} sources={car.sources} showSources/></View>}
  </View>)}</View>;
}

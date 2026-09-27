import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FieldEvidence from './FieldEvidence';
import styles from '../styles';

const specs = [['engine', 'speedometer-outline', 'Motor'], ['power', 'flash-outline', 'Potência'], ['type', 'car-sport-outline', 'Categoria'], ['consumption', 'water-outline', 'Consumo']];
export default function MainSpecs({ car, showSources }) {
  return <View style={styles.specGrid}>{specs.map(([key, icon, label]) => <View key={key} style={styles.specCard}>
    <View style={styles.specIcon}><Ionicons name={icon} size={22} color="#0562D2"/></View>
    <Text style={styles.specLabel}>{label}</Text><Text style={styles.specValue}>{car.specs[key].value}</Text>
    <FieldEvidence field={car.specs[key]} sources={car.sources} showSources={showSources}/>
  </View>)}</View>;
}

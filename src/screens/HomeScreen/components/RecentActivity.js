import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { pick } from '../../../utils/vehicleAdapters';
import { activityDate } from '../homeData';
import SectionHeading from './SectionHeading';
import styles from '../styles';
export default function RecentActivity({ items, loading, onSaved }) {
  return <View style={styles.section}>
    <SectionHeading>ATIVIDADE RECENTE</SectionHeading>
    {items === null ? loading ? <ActivityIndicator color="#0562D2"/> : <Text style={styles.body}>Não foi possível carregar as comparações.</Text> : !items.length ? <Text style={styles.body}>Suas comparações salvas aparecerão aqui.</Text> : <View style={styles.activityList}>{items.map(item => <Pressable accessibilityRole="button" accessibilityLabel={`Ver comparações salvas: ${pick(item, 'titulo') || 'Comparação'}`} onPress={onSaved} key={String(pick(item, 'id'))} style={({ pressed }) => [styles.activityRow, pressed && styles.pressed]}>
      <View style={styles.activityIcon}><Ionicons name="git-compare-outline" size={20} color="#00142E"/></View><View style={styles.flex}><Text style={styles.activityType}>COMPARAÇÃO SALVA</Text><Text style={styles.activityTitle}>{pick(item, 'titulo') || 'Comparação salva'}</Text>{!!activityDate(pick(item, 'dataSalvamento')) && <Text style={styles.activityDate}>{activityDate(pick(item, 'dataSalvamento'))}</Text>}</View><Ionicons name="arrow-forward" size={18} color="#7C8B9D"/>
    </Pressable>)}</View>}
  </View>;
}

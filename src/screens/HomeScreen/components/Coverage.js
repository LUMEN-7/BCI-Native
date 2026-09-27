import { ActivityIndicator, Text, View } from 'react-native';
import { savedCoverage } from '../homeData';
import SectionHeading from './SectionHeading';
import styles from '../styles';
export default function Coverage({ cars, loading }) {
  const groups = savedCoverage(cars || []);
  return <View style={styles.section}>
    <SectionHeading>DISTRIBUIÇÃO DOS SALVOS</SectionHeading>
    {cars === null ? loading ? <ActivityIndicator color="#0562D2"/> : <Text style={styles.body}>Não foi possível carregar seus modelos salvos.</Text> : !groups.length ? <View style={styles.empty}><Text style={styles.emptyTitle}>Seu acompanhamento começa aqui</Text><Text style={styles.body}>Salve modelos na pesquisa para visualizar suas categorias nesta área.</Text></View> : <>
      <Text style={styles.coverageDescription}>Participação das categorias nos seus {cars.length} modelos salvos.</Text>
      <View style={styles.coverageList}>{groups.map(item => <View key={item.name}>
        <View style={styles.coverageHeader}><Text style={styles.coverageName}>{item.name}</Text><Text style={styles.coverageValue}>{item.percentage}%</Text></View>
        <View accessibilityRole="progressbar" accessibilityLabel={item.name} accessibilityValue={{ min: 0, max: 100, now: item.percentage, text: `${item.count} de ${cars.length} modelos` }} style={styles.coverageTrack}><View style={[styles.coverageFill, { width: `${item.percentage}%` }]}/></View>
      </View>)}</View>
    </>}
  </View>;
}

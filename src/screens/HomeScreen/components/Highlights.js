import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SectionHeading from './SectionHeading';
import styles from '../styles';

const SHORTCUTS = [
  { category: 'PESQUISA', title: 'EXPLORE MODELOS', description: 'Encontre veículos e consulte suas fichas técnicas.', route: 'Search' },
  { category: 'COMPARAÇÃO', title: 'COMPARE VEÍCULOS', description: 'Analise dois modelos e identifique suas diferenças.', route: 'Compare' },
  { category: 'INTELIGÊNCIA', title: 'INSIGHTS DO MERCADO', description: 'Acesse as análises disponíveis no BCI.', route: 'Insights' },
];
export default function Highlights({ cars, loading, navigation }) {
  const hasCars = !!cars?.length;
  const items = hasCars ? cars.slice(0, 3).map(car => ({ category: car.type === 'Não informado' ? car.brand : car.type, title: car.name, description: [car.brand, car.engine !== 'Não informado' && car.engine].filter(Boolean).join(' · '), car })) : SHORTCUTS;
  return <View style={styles.section}>
    <SectionHeading>{hasCars ? 'DESTAQUES DOS SEUS MODELOS' : 'EXPLORE O BCI'}</SectionHeading>
    {loading && !cars ? <ActivityIndicator color="#0562D2" accessibilityLabel="Carregando modelos salvos"/> : null}
    <View style={styles.highlights}>{items.map((item, index) => <Pressable key={item.car?.id || item.route} accessibilityRole="button" accessibilityLabel={item.car ? `Explorar ${item.title}` : item.title} onPress={() => item.car ? navigation.navigate('VehicleDetail', { lineageId: item.car.id, car: item.car }) : navigation.navigate(item.route)} style={({ pressed }) => [styles.highlight, index === 0 && styles.featured, pressed && styles.pressed]}>
      <View><Text style={[styles.cardCategory, index === 0 && styles.inverseMuted]}>{item.category}</Text><Text style={[styles.cardTitle, index === 0 && styles.inverse]}>{item.title}</Text><Text style={[styles.cardDescription, index === 0 && styles.inverseMuted]}>{item.description}</Text></View>
      <Ionicons name="arrow-forward" size={21} color={index === 0 ? '#fff' : '#64748B'} style={styles.cardArrow}/>
    </Pressable>)}</View>
  </View>;
}

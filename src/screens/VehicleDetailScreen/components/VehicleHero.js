import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ConfidenceBadge from '../../../components/ConfidenceBadge';
import Action from '../../../components/SearchAction';
import { isMissing } from '../../../utils/vehicleAdapters';
import styles from '../styles';

export default function VehicleHero({ car, onCompare }) {
  const [imageError, setImageError] = useState(false);
  useEffect(() => setImageError(false), [car.image]);
  return <View style={styles.hero}>
    <View style={styles.preview}>
      {car.image && !imageError ? <Image source={{ uri: car.image }} style={styles.image} resizeMode="contain" accessibilityLabel={`Imagem de ${car.name}`} onError={() => setImageError(true)}/> : <View style={styles.imagePlaceholder}><Ionicons name="car-sport-outline" size={60} color="#98A6B6"/><Text style={styles.muted}>Imagem não disponível</Text></View>}
      <View style={styles.imageBadges}>
        {car.isImported && <Text style={styles.pill}>IMPORTADO</Text>}
        {car.isFuture && <Text style={styles.pill}>MODELO FUTURO</Text>}
      </View>
    </View>
    <View style={styles.heroCopy}>
      <Text style={styles.eyebrow}>{car.brand || 'MARCA NÃO INFORMADA'}</Text>
      <Text accessibilityRole="header" style={styles.heroTitle}>{car.model}</Text>
      <View style={styles.identityRow}>
        {car.year !== '' && <Text style={styles.year}>{car.year}</Text>}
        {!isMissing(car.specs.type) && <Text style={styles.category}>{car.specs.type.value}</Text>}
      </View>
      <Text style={styles.body}>{car.description || 'Descrição não informada na ficha do veículo.'}</Text>
      {car.descriptionOrigin === 'ai' && <Text style={styles.aiTag}>Descrição estimada por IA</Text>}
      <View style={styles.confidenceRow}><Text style={styles.muted}>Confiança dos dados</Text><ConfidenceBadge confidence={car.averageConfidence}/></View>
      <Action title="Comparar modelo" icon="git-compare-outline" onPress={onCompare}/>
    </View>
  </View>;
}

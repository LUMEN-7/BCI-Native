import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SearchAction from '../SearchAction';
import styles from './styles';

export default function VehicleCard({ car, onPress, onFavorite, onSchedule, onEdit, favorite = false, selected = false, actionLabel }) {
  const [failedImage, setFailedImage] = useState(null);
  return <View style={[styles.card, selected && styles.selected]}>
    <View style={styles.top}>
      <Text style={styles.brand}>{String(car.brand || '').toUpperCase()}</Text>
      {car.isImported && <Text style={styles.badge}>IMPORTADO</Text>}
      {onFavorite && <Pressable accessibilityRole="button" accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} accessibilityState={{ selected: favorite }} onPress={onFavorite} style={[styles.favorite, favorite && styles.favoriteActive]}>
        <Ionicons name={favorite ? 'bookmark' : 'bookmark-outline'} size={20} color={favorite ? '#fff' : '#00142E'}/>
      </Pressable>}
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel={`${actionLabel || 'Explorar modelo'}: ${car.brand} ${car.name}`} onPress={onPress}>
      <View style={styles.imageWrap}>{car.image && failedImage !== car.image ? <Image source={{ uri: car.image }} style={styles.image} onError={() => setFailedImage(car.image)}/> : <View style={styles.placeholder}><Ionicons name="car-sport-outline" size={44} color="#8794A6"/><Text style={styles.metaText}>Sem foto disponível</Text></View>}</View>
      <Text style={styles.category}>{car.type || 'Veículo'}</Text>
      <Text style={styles.name}>{car.model || car.name}</Text>
      <Text style={styles.year}>{car.year}</Text>
      <View style={styles.details}><Text style={styles.action}>{actionLabel || 'EXPLORAR MODELO'}</Text><Ionicons name="arrow-forward" size={20} color="#0562D2"/></View>
    </Pressable>
    {car.isImported ? (onEdit && <SearchAction title="Editar" icon="create-outline" compact variant="secondary" onPress={onEdit}/>) : onSchedule && <SearchAction title="Agendar Pesquisa" icon="alarm-outline" compact variant="secondary" onPress={onSchedule}/>}
  </View>;
}

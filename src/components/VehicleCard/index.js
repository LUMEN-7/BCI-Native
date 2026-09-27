import { useState } from 'react';
import { Image, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles';

export default function VehicleCard({ car, onPress, onFavorite, onSchedule, onEdit, favorite = false, selected = false, actionLabel }) {
  const [failedImage, setFailedImage] = useState(null);
  const { width } = useWindowDimensions();
  return <View style={[styles.card, selected && styles.selected]}>
    <View style={styles.top}>
      <Text style={styles.brand}>{String(car.brand || '').toUpperCase()}</Text>
      {car.isImported && <Text style={styles.badge}>IMPORTADO</Text>}
      {!car.isImported && onSchedule && <Pressable accessibilityRole="button" accessibilityLabel={`Agendar pesquisa de ${car.name}`} onPress={onSchedule} style={styles.iconButton}><Ionicons name="alarm-outline" size={20} color="#64748B"/></Pressable>}
      {onFavorite && <Pressable accessibilityRole="button" accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} accessibilityState={{ selected: favorite }} onPress={onFavorite} style={[styles.iconButton, favorite && styles.favoriteActive]}><Ionicons name={favorite ? 'star' : 'star-outline'} size={20} color={favorite ? '#fff' : '#00142E'}/></Pressable>}
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel={`${actionLabel || 'Explorar modelo'}: ${car.brand} ${car.name}`} onPress={onPress}>
      <View style={[styles.imageWrap, width < 400 && styles.smallImage]}>{car.image && failedImage !== car.image ? <Image source={{ uri: car.image }} style={styles.image} onError={() => setFailedImage(car.image)}/> : <View style={styles.placeholder}><Ionicons name="car-sport-outline" size={44} color="#9AA5B2"/><Text style={styles.metaText}>Sem foto disponível</Text></View>}</View>
      <Text style={styles.category}>{car.type || 'Veículo'}</Text>
      <Text style={styles.name}>{car.model || car.name}</Text>
      <Text style={styles.year}>{car.year}</Text>
    </Pressable>
    <View style={styles.actions}>
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.details, pressed && styles.pressed]}><Text style={styles.action}>{actionLabel || 'EXPLORAR MODELO'}</Text><Ionicons name="arrow-forward" size={20} color="#fff"/></Pressable>
      {car.isImported && onEdit && <Pressable accessibilityRole="button" accessibilityLabel={`Editar ${car.name}`} onPress={onEdit} style={({ pressed }) => [styles.edit, pressed && styles.pressed]}><Ionicons name="create-outline" size={19} color="#fff"/><Text style={styles.action}>EDITAR</Text></Pressable>}
    </View>
  </View>;
}

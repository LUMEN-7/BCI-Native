import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles';
import AppButton from '../AppButton';
export default function VehicleCard({ car, onPress, onFavorite, onSchedule, favorite=false, selected=false, actionLabel }) {
  return <Pressable onPress={onPress} style={[styles.card,selected&&styles.selected]}>
    <View style={styles.imageWrap}>{car.image?<Image source={{uri:car.image}} style={styles.image}/>:<View style={styles.placeholder}><Ionicons name="car-sport-outline" size={34} color="#66768A"/></View>}
      {onFavorite?<Pressable onPress={onFavorite} hitSlop={12} style={styles.favorite}><Ionicons name={favorite?'bookmark':'bookmark-outline'} size={20} color={favorite?'#0562D2':'#00142E'}/></Pressable>:null}
    </View>
    <Text style={styles.brand}>{String(car.brand||'').toUpperCase()}</Text><Text style={styles.name}>{car.name||`${car.model||''} ${car.year||''}`}</Text>
    <View style={styles.meta}><Text style={styles.metaText}>{car.engine||car.type||'Dados BCI'}</Text>{actionLabel?<Text style={styles.action}>{actionLabel}</Text>:null}</View>
    {onSchedule ? <AppButton title="Agendar Pesquisa" compact variant="secondary" onPress={e => { e.stopPropagation(); onSchedule(); }}/> : null}
  </Pressable>;
}

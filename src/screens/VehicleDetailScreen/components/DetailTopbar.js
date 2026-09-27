import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles';

function Action({ icon, label, onPress, busy, disabled, active, danger }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled || !!busy, busy: !!busy }} disabled={disabled || busy} onPress={onPress} style={[styles.topAction, disabled && styles.disabled]}>
    <View style={[styles.circle, active && styles.activeCircle]}>{busy ? <ActivityIndicator color="#0562D2"/> : <Ionicons name={icon} size={21} color={danger ? '#A43737' : active ? '#0562D2' : '#00142E'}/>}</View>
    <Text style={styles.actionLabel}>{label}</Text>
  </Pressable>;
}
export default function DetailTopbar({ onBack, onHome, onExport, onEdit, onDelete, onFavorite, isImported, favorite, saving, deleting, ready, favoritesReady }) {
  return <View style={styles.topbar}>
    <Action icon="arrow-back-outline" label="Voltar" onPress={onBack}/>
    <Action icon="home-outline" label="Home" onPress={onHome}/>
    <Action icon={favorite ? 'star' : 'star-outline'} label={favorite ? 'Remover salvo' : 'Salvar'} active={favorite} onPress={onFavorite} busy={saving} disabled={!ready || !favoritesReady || deleting}/>
    <Action icon="download-outline" label="Exportar" onPress={onExport} disabled={!ready || deleting}/>
    {isImported && <>
      <Action icon="create-outline" label="Editar" onPress={onEdit} disabled={saving || deleting}/>
      <Action icon="trash-outline" label="Excluir" onPress={onDelete} busy={deleting} disabled={saving} danger/>
    </>}
  </View>;
}

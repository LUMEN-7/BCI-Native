import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles';

function Action({ icon, label, onPress, busy, disabled, active, danger, caption }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled || !!busy, busy: !!busy, selected: !!active }} disabled={disabled || busy} onPress={onPress} style={({ pressed }) => [styles.topAction, caption && styles.topActionCaption, active && styles.activeCircle, disabled && styles.disabled, pressed && styles.pressed]}>
    {busy ? <ActivityIndicator color={active ? '#fff' : '#0562D2'}/> : <Ionicons name={icon} size={20} color={danger ? '#A43737' : active ? '#fff' : '#00142E'}/>}
    {caption && <Text style={[styles.actionLabel, danger && styles.dangerLabel]}>{caption}</Text>}
  </Pressable>;
}
export default function DetailTopbar({ onBack, onHome, onExport, onEdit, onDelete, onFavorite, isImported, favorite, saving, deleting, ready, favoritesReady }) {
  return <View style={styles.topbar}>
    <View style={styles.topbarRow}>
      <Action icon="arrow-back-outline" label="Voltar" caption="Voltar" onPress={onBack}/>
      <View style={styles.topbarActions}>
        <Action icon="home-outline" label="Ir para Home" onPress={onHome}/>
        <Action icon={favorite ? 'star' : 'star-outline'} label={favorite ? 'Remover dos salvos' : 'Salvar pesquisa'} active={favorite} onPress={onFavorite} busy={saving} disabled={!ready || !favoritesReady || deleting}/>
        <Action icon="download-outline" label="Exportar dados" onPress={onExport} disabled={!ready || deleting}/>
      </View>
    </View>
    {isImported && <View style={styles.importedActions}>
      <Action icon="create-outline" label="Editar veículo importado" caption="Editar" onPress={onEdit} disabled={saving || deleting}/>
      <Action icon="trash-outline" label="Excluir ficha importada" caption="Excluir" onPress={onDelete} busy={deleting} disabled={saving} danger/>
    </View>}
  </View>;
}

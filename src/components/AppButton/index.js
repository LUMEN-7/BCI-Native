import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import styles from './styles';
export default function AppButton({ title, onPress, variant='primary', disabled=false, loading=false, icon=null, compact=false }) {
  const isDisabled = disabled || loading;
  return (
    <Pressable disabled={isDisabled} onPress={onPress} style={({pressed})=>[
      styles.shadow,
      compact && styles.compactShadow,
      variant==='secondary' && styles.secondaryShadow,
      variant==='ghost' && styles.ghostShadow,
      pressed && !isDisabled && styles.pressed,
      isDisabled && styles.disabled,
    ]}>
      <View style={[styles.face, compact && styles.compactFace, variant==='secondary' && styles.secondaryFace, variant==='ghost' && styles.ghostFace]}>
        {loading ? <ActivityIndicator color={variant==='primary' ? '#fff' : '#00142E'} /> : <>{icon}<Text style={[styles.text, variant!=='primary' && styles.darkText]}>{title}</Text></>}
      </View>
    </Pressable>
  );
}

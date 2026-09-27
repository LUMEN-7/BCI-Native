import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../../theme/typography';

export default function SearchAction({ title, onPress, variant = 'primary', compact, loading, disabled, icon, selected }) {
  const inactive = disabled || loading;
  const primary = variant === 'primary';
  const color = primary ? '#fff' : '#00142E';
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!inactive, busy: !!loading, ...(selected == null ? {} : { selected }) }} disabled={inactive} onPress={onPress}
    style={({ pressed }) => [styles.button, primary ? styles.primary : variant === 'ghost' ? styles.ghost : styles.secondary, compact && styles.compact, inactive && styles.disabled, pressed && styles.pressed]}>
    {loading ? <ActivityIndicator color={color}/> : icon ? <Ionicons name={icon} size={19} color={color}/> : null}
    <Text style={[styles.label, { color }]}>{title}</Text>
  </Pressable>;
}

const styles = StyleSheet.create({
  button: { minHeight: 48, borderRadius: 28, paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1 },
  primary: { backgroundColor: '#0562D2', borderColor: '#0562D2' },
  secondary: { backgroundColor: '#fff', borderColor: '#D6E1EE' },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  compact: { minHeight: 44, paddingHorizontal: 14, paddingVertical: 8 },
  label: { fontFamily: fonts.bold, fontSize: 15, flexShrink: 1, textAlign: 'center' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.78 },
});

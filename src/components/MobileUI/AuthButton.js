import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';

export default function AuthButton({ title, icon, dark = false, loading, disabled, onPress }) {
  const color = dark ? '#fff' : colors.primary;
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!(disabled || loading), busy: !!loading }} disabled={disabled || loading} onPress={onPress}
    style={({ pressed }) => [styles.button, dark && styles.dark, pressed && styles.pressed, (disabled || loading) && styles.disabled]}>
    {loading && <ActivityIndicator color={color}/>}
    <Text style={[styles.label, { color }]}>{title}</Text>
    {!loading && icon && <Ionicons name={icon} size={18} color={color}/>}
  </Pressable>;
}
const styles = StyleSheet.create({
  button: { minHeight: 44, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 999, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 13, boxShadow: '0px 7px 14px rgba(0,20,46,0.16), 0px 2px 5px rgba(0,20,46,0.08)' },
  dark: { backgroundColor: colors.primary, boxShadow: '0px 7px 14px rgba(0,20,46,0.16)' },
  label: { fontFamily: fonts.bold, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', flexShrink: 1, textAlign: 'center' },
  pressed: { transform: [{ translateY: 1 }], boxShadow: '0px 3px 6px rgba(0,20,46,0.16)' },
  disabled: { opacity: 0.5 },
});

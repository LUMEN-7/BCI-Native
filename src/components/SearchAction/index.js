import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts } from '../../theme/typography';

export default function SearchAction({ title, onPress, variant = 'primary', compact, loading, disabled, icon, selected, badge }) {
  const inactive = disabled || loading;
  const color = variant === 'primary' ? '#fff' : variant === 'accent' ? '#0562D2' : '#00142E';
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!inactive, busy: !!loading, ...(selected == null ? {} : { selected }) }} disabled={inactive} onPress={onPress}
    style={({ pressed }) => [styles.button, styles[variant] || styles.secondary, compact && styles.compact, inactive && styles.disabled, pressed && styles.pressed]}>
    {loading ? <ActivityIndicator color={color}/> : icon ? <Ionicons name={icon} size={18} color={color}/> : null}
    <Text style={[styles.label, { color }]}>{title}</Text>
    {badge != null && <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>}
  </Pressable>;
}
const styles = StyleSheet.create({
  button: { minHeight: 48, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1 },
  primary: { backgroundColor: '#00142E', borderColor: '#00142E', boxShadow: '0px 6px 16px rgba(0,20,46,0.14)' },
  accent: { backgroundColor: '#EDF4FC', borderColor: 'rgba(5,98,210,0.25)' },
  muted: { backgroundColor: '#F0F2F5', borderColor: 'rgba(0,20,46,0.08)' },
  secondary: { backgroundColor: '#fff', borderColor: '#DCE3EC' },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  compact: { minHeight: 44, paddingHorizontal: 14, paddingVertical: 8 },
  label: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', flexShrink: 1, textAlign: 'center' },
  badge: { borderRadius: 12, paddingHorizontal: 7, paddingVertical: 2, backgroundColor: '#00142E' },
  badgeText: { fontFamily: fonts.bold, fontSize: 10, color: '#fff' },
  disabled: { opacity: 0.5 }, pressed: { opacity: 0.78 },
});

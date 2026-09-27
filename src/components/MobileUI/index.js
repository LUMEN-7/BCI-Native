import { ActivityIndicator, Pressable, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors as c } from '../../theme/colors';
import { fonts as f } from '../../theme/typography';
export function Action({
  title,
  icon,
  onPress,
  secondary,
  disabled,
  loading,
  danger,
  compact
}) {
  return <Pressable accessibilityRole="button" accessibilityState={{
    disabled: !!(disabled || loading),
    busy: !!loading
  }} disabled={disabled || loading} onPress={onPress} style={({
    pressed
  }) => [s.button, secondary && s.secondary, compact && s.compact, (disabled || loading) && {
    opacity: .5
  }, pressed && {
    opacity: .75
  }]}>{loading ? <ActivityIndicator color={secondary ? c.primary : '#fff'} /> : icon ? <Ionicons name={icon} size={18} color={danger ? c.error : secondary ? c.primary : '#fff'} /> : null}<Text style={[s.buttonText, secondary && s.dark, danger && {
      color: c.error
    }]}>{title}</Text></Pressable>;
}
export function Tabs({
  items,
  value,
  onChange
}) {
  return <View style={s.tabs}>{items.map(item => <Pressable key={item.id} accessibilityRole="tab" accessibilityState={{
      selected: value === item.id
    }} onPress={() => onChange(item.id)} style={[s.tab, value === item.id && s.active]}><Text style={[s.tabText, value === item.id && s.white]}>{item.label}{item.count != null ? ` · ${item.count}` : ''}</Text></Pressable>)}</View>;
}
export function Heading({
  eyebrow,
  title,
  description
}) {
  return <View style={s.heading}>{eyebrow && <Text style={s.eyebrow}>{eyebrow}</Text>}<Text accessibilityRole="header" style={s.title}>{title}</Text>{description && <Text style={s.body}>{description}</Text>}</View>;
}
export function Feedback({
  error,
  retry
}) {
  return error ? <View style={s.errorBox}><Text accessibilityRole="alert" style={s.error}>{error}</Text>{retry && <Action secondary compact title="Tentar novamente" onPress={retry} />}</View> : null;
}
export function Back({
  navigation,
  title = 'Voltar'
}) {
  return <View style={{
    alignSelf: 'flex-start'
  }}><Action secondary compact icon="arrow-back" title={title} onPress={() => navigation.goBack()} /></View>;
}
export const s = StyleSheet.create({
  panel: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,20,46,.07)',
    borderRadius: 24,
    padding: 20,
    gap: 16
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  grow: {
    flex: 1,
    minWidth: 0
  },
  button: {
    minHeight: 48,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: c.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  secondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,20,46,.12)'
  },
  compact: {
    minHeight: 44,
    paddingHorizontal: 14
  },
  buttonText: {
    fontFamily: f.bold,
    fontSize: 12,
    letterSpacing: .6,
    color: '#fff',
    textTransform: 'uppercase',
    flexShrink: 1
  },
  dark: {
    color: c.primary
  },
  white: {
    color: '#fff'
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tab: {
    flexGrow: 1,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#ECEEF0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  active: {
    backgroundColor: c.primary
  },
  tabText: {
    fontFamily: f.bold,
    color: c.primary,
    fontSize: 11,
    textTransform: 'uppercase'
  },
  heading: {
    gap: 7,
    marginTop: 8
  },
  eyebrow: {
    color: c.secondary,
    fontFamily: f.bold,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase'
  },
  title: {
    color: c.primary,
    fontFamily: f.title,
    fontSize: 27,
    lineHeight: 32,
    textTransform: 'uppercase'
  },
  body: {
    color: '#687482',
    fontFamily: f.body,
    fontSize: 15,
    lineHeight: 23
  },
  strong: {
    fontFamily: f.bold,
    color: c.primary,
    fontSize: 17
  },
  meta: {
    fontFamily: f.body,
    fontSize: 12,
    color: c.muted
  },
  rule: {
    height: 1,
    backgroundColor: '#E5E8EB',
    marginVertical: 8
  },
  errorBox: {
    backgroundColor: '#FFF0F1',
    padding: 16,
    borderRadius: 18,
    gap: 12
  },
  error: {
    color: c.error,
    fontFamily: f.body,
    fontSize: 14
  },
  pill: {
    backgroundColor: '#EDF4FC',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999
  }
});

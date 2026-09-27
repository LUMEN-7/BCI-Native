import { StyleSheet } from 'react-native';
import { fonts } from '../../theme/typography';
export default StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 23, padding: 18, borderWidth: 1, borderColor: 'transparent', boxShadow: '0px 10px 28px rgba(0,20,46,0.07), 0px 2px 5px rgba(0,20,46,0.035)' },
  selected: { borderColor: '#0562D2' },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brand: { flex: 1, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 2, color: '#00142E' },
  badge: { fontFamily: fonts.bold, fontSize: 9, letterSpacing: 0.8, color: '#0562D2', backgroundColor: '#EAF1FB', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 6 },
  iconButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(0,20,46,0.08)', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  favoriteActive: { backgroundColor: '#00142E', borderColor: '#00142E' },
  imageWrap: { height: 220, overflow: 'hidden', marginTop: 6, marginBottom: 14 },
  smallImage: { height: 190 },
  image: { width: '100%', height: '100%', resizeMode: 'contain' },
  placeholder: { flex: 1, borderRadius: 18, backgroundColor: '#F7F8FA', alignItems: 'center', justifyContent: 'center', gap: 8 },
  metaText: { fontFamily: fonts.body, fontSize: 12, color: '#8994A2' },
  category: { fontFamily: fonts.body, fontSize: 10, color: '#8994A2', textTransform: 'uppercase', letterSpacing: 2 },
  name: { fontFamily: fonts.title, fontSize: 29, lineHeight: 34, color: '#00142E', textTransform: 'uppercase', marginTop: 7 },
  year: { fontFamily: fonts.body, fontSize: 14, color: '#7D8793', marginTop: 5 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 18, flexWrap: 'wrap' },
  details: { flexGrow: 1, minHeight: 50, borderRadius: 99, paddingHorizontal: 18, paddingVertical: 12, backgroundColor: '#00142E', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, boxShadow: '0px 6px 16px rgba(0,20,46,0.14)' },
  edit: { minHeight: 50, borderRadius: 99, paddingHorizontal: 16, backgroundColor: '#0562D2', flexDirection: 'row', alignItems: 'center', gap: 6 },
  action: { flexShrink: 1, fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.8, color: '#fff' },
  pressed: { opacity: 0.8 },
});

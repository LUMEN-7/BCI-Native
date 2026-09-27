import { StyleSheet } from 'react-native';
import { fonts } from '../../theme/typography';
export default StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: '#E1E7EF', padding: 18, gap: 12, shadowColor: '#00142E', shadowOpacity: 0.05, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 2 },
  selected: { borderColor: '#0562D2', borderWidth: 2 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brand: { flex: 1, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.7, color: '#00142E' },
  badge: { fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1, color: '#0562D2', backgroundColor: '#EAF3FF', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  favorite: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#DFE6EF', alignItems: 'center', justifyContent: 'center' },
  favoriteActive: { backgroundColor: '#00142E', borderColor: '#00142E' },
  imageWrap: { height: 185, borderRadius: 18, overflow: 'hidden', backgroundColor: '#F5F7FA', marginBottom: 16 },
  image: { width: '100%', height: '100%', resizeMode: 'contain' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  metaText: { fontFamily: fonts.body, fontSize: 13, color: '#64748B' },
  category: { fontFamily: fonts.semibold, fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1.2 },
  name: { fontFamily: fonts.title, fontSize: 27, color: '#00142E', textTransform: 'uppercase', marginTop: 5 },
  year: { fontFamily: fonts.body, fontSize: 16, color: '#526176', marginTop: 3 },
  details: { borderTopWidth: 1, borderColor: '#ECF0F5', marginTop: 16, paddingTop: 16, paddingBottom: 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  action: { flex: 1, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1, color: '#0562D2' },
});

import { StyleSheet } from 'react-native';
import { fonts } from '../../theme/typography';
export default StyleSheet.create({
  screenContent: { padding: 0, paddingBottom: 0, gap: 0 },
  top: { paddingTop: 24, paddingBottom: 20, gap: 14 },
  controls: { gap: 12, backgroundColor: '#EAF0F7', padding: 16, borderRadius: 24 },
  row: { flexDirection: 'row', gap: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  field: { flex: 1 },
  small: { width: 100 },
  input: { backgroundColor: '#fff', borderRadius: 16 },
  searchInput: { borderRadius: 28, backgroundColor: '#fff', minHeight: 54, paddingHorizontal: 18 },
  error: { fontFamily: fonts.semibold, fontSize: 15, color: '#B42318', backgroundColor: '#FFF1F0', padding: 12, borderRadius: 14 },
  notice: { fontFamily: fonts.semibold, fontSize: 15, color: '#0562D2', backgroundColor: '#EAF3FF', padding: 12, borderRadius: 14 },
  count: { fontFamily: fonts.semibold, fontSize: 16, color: '#00142E', marginTop: 10 },
  list: { paddingHorizontal: 20, paddingBottom: 120 },
  separator: { height: 18 },
});

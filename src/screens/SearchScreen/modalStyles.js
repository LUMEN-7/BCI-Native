import { StyleSheet } from 'react-native';
import { fonts } from '../../theme/typography';

export default StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F6FA' },
  header: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff' },
  title: { flex: 1, fontFamily: fonts.title, fontSize: 25, color: '#00142E' },
  content: { padding: 20, gap: 16, paddingBottom: 48 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  card: { padding: 16, backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: '#DEE5EE', gap: 12 },
  heading: { fontFamily: fonts.semibold, fontSize: 19, color: '#00142E' },
  text: { fontFamily: fonts.body, fontSize: 16, color: '#526176' },
  error: { fontFamily: fonts.semibold, fontSize: 16, color: '#B42318' },
  success: { fontFamily: fonts.semibold, fontSize: 16, color: '#0562D2' },
  choice: { padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#DEE5EE', backgroundColor: '#fff' },
  chosen: { borderColor: '#0562D2', backgroundColor: '#EAF3FF' },
  image: { width: '100%', height: 180, resizeMode: 'contain', borderRadius: 16 },
});

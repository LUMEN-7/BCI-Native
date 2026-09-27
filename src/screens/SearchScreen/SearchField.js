import { StyleSheet, Text, TextInput, View } from 'react-native';
import { fonts } from '../../theme/typography';
export default function SearchField({ label, style, ...props }) {
  return <View style={styles.wrap}>
    {!!label && <Text style={styles.label}>{label}</Text>}
    <TextInput accessibilityLabel={label} placeholderTextColor="#9AA5B2" style={[styles.input, props.multiline && styles.multiline, style]} {...props}/>
  </View>;
}
const styles = StyleSheet.create({
  wrap: { gap: 8 }, label: { fontFamily: fonts.bold, fontSize: 12, color: '#526176' },
  input: { minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,20,46,0.10)', backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10, fontFamily: fonts.body, fontSize: 15, color: '#00142E' },
  multiline: { minHeight: 86, textAlignVertical: 'top' },
});

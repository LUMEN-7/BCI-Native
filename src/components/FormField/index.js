import { Text, TextInput, View } from 'react-native';
import styles from './styles';
export default function FormField({ label, error, style, ...props }) {
  return <View style={styles.wrap}>{label ? <Text style={styles.label}>{label}</Text> : null}<TextInput placeholderTextColor="#8A94A2" style={[styles.input,error&&styles.inputError,style]} {...props}/>{error ? <Text style={styles.error}>{error}</Text> : null}</View>;
}

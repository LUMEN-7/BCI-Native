import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles';
export default function FormField({
  label,
  error,
  style,
  secureTextEntry,
  ...props
}) {
  const [visible, setVisible] = useState(false);
  return <View style={styles.wrap}>{label ? <Text style={styles.label}>{label}</Text> : null}<View><TextInput accessibilityLabel={label} placeholderTextColor="#8A94A2" secureTextEntry={secureTextEntry && !visible} style={[styles.input, error && styles.inputError, secureTextEntry && {
        paddingRight: 50
      }, style]} {...props} />{secureTextEntry && <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'} onPress={() => setVisible(v => !v)} style={{
        position: 'absolute',
        right: 3,
        top: 2,
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center'
      }}><Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={21} color="#687482" /></Pressable>}</View>{error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}</View>;
}

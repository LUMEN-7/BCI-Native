import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles';
export default function FormField({
  label,
  error,
  style,
  secureTextEntry,
  variant = 'auth',
  multiline,
  onFocus,
  onBlur,
  ...props
}) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const auth = variant === 'auth';
  return <View style={styles.wrap}>{label ? <Text style={[styles.label, auth && styles.authLabel]}>{label}</Text> : null}<View style={auth && [styles.authShell, multiline && styles.authMultilineShell, focused && styles.authFocused, error && styles.authError]}><TextInput accessibilityLabel={label} placeholderTextColor={auth ? "#737D89" : "#8A94A2"} secureTextEntry={secureTextEntry && !visible} multiline={multiline} onFocus={event => { setFocused(true); onFocus?.(event); }} onBlur={event => { setFocused(false); onBlur?.(event); }} style={[styles.input, auth && styles.authInput, auth && multiline && styles.authMultilineInput, error && styles.inputError, secureTextEntry && {
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

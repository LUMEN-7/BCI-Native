import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { s } from './index';
export default function AuthFrame({
  children
}) {
  const insets = useSafeAreaInsets();
  return <KeyboardAvoidingView style={{
    flex: 1,
    backgroundColor: '#00142E'
  }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 18,
      paddingTop: insets.top + 28,
      paddingBottom: insets.bottom + 28
    }}><View style={[s.panel, {
        width: '100%',
        maxWidth: 520,
        alignSelf: 'center',
        backgroundColor: '#F7F7F5',
        padding: 24,
        gap: 20
      }]}>{children}</View></ScrollView></KeyboardAvoidingView>;
}

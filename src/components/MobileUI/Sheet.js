import { Modal, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Action, Heading, s } from './index';
export default function Sheet({
  title,
  onClose,
  busy,
  children
}) {
  return <Modal visible transparent animationType="slide" onRequestClose={() => !busy && onClose()}><SafeAreaView style={{
      flex: 1,
      backgroundColor: 'rgba(0,20,46,.38)'
    }}><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{
        flex: 1,
        justifyContent: 'flex-end'
      }}><View accessibilityViewIsModal style={[s.panel, {
          maxHeight: '94%',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0
        }]}><View style={s.row}><View style={s.grow}><Heading title={title} /></View><Action secondary compact title="Fechar" disabled={busy} onPress={onClose} /></View><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{
            gap: 18,
            paddingBottom: 24
          }}>{children}</ScrollView></View></KeyboardAvoidingView></SafeAreaView></Modal>;
}

import { KeyboardAvoidingView, Modal, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../../components/SearchAction';
import styles from './modalStyles';

export default function ModalShell({ title, onClose, busy, children }) {
  return <Modal visible animationType="slide" onRequestClose={() => !busy && onClose()}>
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}><Text accessibilityRole="header" style={styles.title}>{title}</Text><AppButton title="Fechar" compact variant="ghost" disabled={busy} onPress={onClose}/></View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>{children}</ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </Modal>;
}

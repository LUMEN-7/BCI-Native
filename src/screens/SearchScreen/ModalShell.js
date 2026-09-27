import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import styles from './modalStyles';

export default function ModalShell({ title, onClose, busy, children, kind = 'schedule' }) {
  const importing = kind === 'import';
  return <Modal visible transparent animationType="fade" onRequestClose={() => !busy && onClose()}>
    <SafeAreaView style={styles.backdrop}>
      <KeyboardAvoidingView style={styles.modalPosition} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.sheet, importing && styles.importSheet]} accessibilityViewIsModal>
          <View style={styles.header}>
            {!importing && <View style={styles.headerIcon}><Ionicons name="alarm-outline" size={22} color="#fff"/></View>}
            <View style={styles.headerCopy}><Text style={styles.eyebrow}>{importing ? 'CADASTRO DE VEÍCULO' : 'PESQUISA PROGRAMADA'}</Text><Text accessibilityRole="header" style={[styles.title, importing && styles.importTitle]}>{title}</Text></View>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar modal" disabled={busy} onPress={onClose} style={styles.close}><Ionicons name="close-outline" size={24} color="#00142E"/></Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>{children}</ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </Modal>;
}

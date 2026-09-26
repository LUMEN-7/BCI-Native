import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './styles';
export default function Screen({ children, scroll = true, contentContainerStyle, style }) {
  const content = scroll ? (
    <ScrollView style={styles.flex} contentContainerStyle={[styles.content, contentContainerStyle]} keyboardShouldPersistTaps="handled">{children}</ScrollView>
  ) : <View style={[styles.content, styles.flex, contentContainerStyle]}>{children}</View>;
  return <SafeAreaView edges={['bottom']} style={[styles.safe, style]}>{content}</SafeAreaView>;
}

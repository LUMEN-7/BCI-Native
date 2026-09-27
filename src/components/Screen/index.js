import { useContext } from 'react';
import { ScrollView, View, RefreshControl, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ShellContext from '../../navigation/ShellContext';
import styles from './styles';
export default function Screen({
  children,
  scroll = true,
  contentContainerStyle,
  style,
  refreshing = false,
  onRefresh
}) {
  const shell = useContext(ShellContext);
  const insets = useSafeAreaInsets();
  const {
    width
  } = useWindowDimensions();
  const spacing = {
    paddingHorizontal: width < 400 ? 16 : 20,
    paddingTop: shell ? insets.top + 12 : 24,
    paddingBottom: shell ? 110 : 40,
    width: '100%',
    maxWidth: 850,
    alignSelf: 'center'
  };
  const content = scroll ? <ScrollView style={styles.flex} contentContainerStyle={[styles.content, spacing, contentContainerStyle]} refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0562D2" /> : undefined} keyboardShouldPersistTaps="handled">{children}</ScrollView> : <View style={[styles.content, styles.flex, spacing, contentContainerStyle]}>{children}</View>;
  return <SafeAreaView edges={shell ? ['bottom'] : ['top', 'bottom']} style={[styles.safe, style]}>{content}</SafeAreaView>;
}

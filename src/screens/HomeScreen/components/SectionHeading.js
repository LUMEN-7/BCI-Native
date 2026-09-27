import { Text, View } from 'react-native';
import styles from '../styles';
export default function SectionHeading({ children }) {
  return <View style={styles.sectionHeading}><Text accessibilityRole="header" style={styles.sectionLabel}>{children}</Text><View style={styles.sectionLine}/></View>;
}

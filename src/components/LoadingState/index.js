import { ActivityIndicator, Text, View } from 'react-native';
import styles from './styles';
export default function LoadingState({ label='Carregando...' }) { return <View style={styles.wrap}><ActivityIndicator size="large" color="#0562D2"/><Text style={styles.text}>{label}</Text></View>; }

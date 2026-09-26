import { Text, View } from 'react-native';
import { confidenceState } from '../../utils/confidence';
import styles from './styles';
export default function ConfidenceBadge({ confidence, conflict=false, showScore=true }) {
  const state=confidenceState(confidence,conflict);
  return <View style={[styles.badge,state.confirmed?styles.confirmed:styles.speculative]}><View style={[styles.dot,state.confirmed?styles.confirmedDot:styles.speculativeDot]}/><Text style={[styles.text,state.confirmed?styles.confirmedText:styles.speculativeText]}>{state.label}{showScore&&state.score?` · ${state.score}%`:''}</Text></View>;
}

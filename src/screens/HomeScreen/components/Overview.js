import { Text, View } from 'react-native';
import SectionHeading from './SectionHeading';
import styles from '../styles';
export default function Overview({ metrics }) {
  return <View style={styles.section}><SectionHeading>VISÃO GERAL</SectionHeading><View style={styles.metrics}>{metrics.map((metric, index) => <View style={[styles.metric, index % 2 === 0 && styles.metricRightBorder, index < 2 && styles.metricBottomBorder]} key={metric.label}><Text style={styles.metricValue}>{metric.value}</Text><Text style={styles.metricLabel}>{metric.label}</Text></View>)}</View></View>;
}

import { Text, View } from 'react-native';
import styles from './styles';
export default function SectionCard({ eyebrow, title, children, right }) { return <View style={styles.card}><View style={styles.header}><View style={styles.titleWrap}>{eyebrow?<Text style={styles.eyebrow}>{eyebrow}</Text>:null}{title?<Text style={styles.title}>{title}</Text>:null}</View>{right}</View>{children}</View>; }

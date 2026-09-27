import { ActivityIndicator, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Action from '../../../components/SearchAction';
import styles from '../styles';

export default function AiAnalysis({ analysis, loading, error, isImported, onGenerate }) {
  return <View style={styles.analysis}>
    <View style={styles.analysisHeading}><View style={styles.analysisIcon}><Ionicons name="hardware-chip-outline" size={24} color="#fff"/></View><View style={styles.flex}><Text style={styles.eyebrow}>ANÁLISE INTELIGENTE</Text><Text accessibilityRole="header" style={styles.sectionTitle}>ANÁLISE DA IA</Text></View></View>
    <Text style={styles.body}>Resumo gerado com base nas características técnicas, perfil de uso e posicionamento do modelo.</Text>
    <Text style={styles.muted}>Conteúdo gerado por IA; confira as fontes técnicas antes de decidir.</Text>
    {loading ? <View style={styles.feedback}><ActivityIndicator color="#0562D2"/><Text style={styles.body}>Gerando análise personalizada...</Text></View> : <>
      {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
      {(isImported || error || !analysis) && <Action title={error ? 'Tentar análise novamente' : 'Gerar análise da IA'} icon="sparkles-outline" variant="accent" onPress={onGenerate}/>}
      {analysis && <View style={styles.analysisGrid}>
        {[[ 'Pontos fortes', analysis.strengths, 'add-circle-outline' ], [ 'Pontos fracos', analysis.weaknesses, 'remove-circle-outline' ], [ 'Melhor uso', [analysis.bestUse], 'navigate-outline' ], [ 'Concorrentes semelhantes', analysis.competitors, 'git-compare-outline' ]].map(([title, items, icon]) => <View style={[styles.analysisCard, title === 'Melhor uso' && styles.bestUse]} key={title}>
          <View style={styles.confidenceRow}><Ionicons name={icon} size={20} color="#0562D2"/><Text style={styles.subheading}>{title}</Text></View>
          {items.filter(item => typeof item === 'string' && item.trim()).length ? items.filter(item => typeof item === 'string' && item.trim()).map((item, index) => <Text style={styles.body} key={index}>{title === 'Melhor uso' ? '' : '• '}{item}</Text>) : <Text style={styles.muted}>Não informado pela IA.</Text>}
        </View>)}
      </View>}
    </>}
  </View>;
}

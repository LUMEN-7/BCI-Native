import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import styles from '../styles';

export default function AiAnalysis({ analysis, loading, error, isImported, onGenerate }) {
  return <View style={styles.analysis}>
    <View style={styles.analysisHeading}><Text style={styles.analysisEyebrow}>ANÁLISE INTELIGENTE</Text><Text accessibilityRole="header" style={styles.analysisTitle}>ANÁLISE DA IA</Text></View>
    <Text style={styles.analysisDescription}>Resumo gerado com base nas características técnicas, perfil de uso e posicionamento do modelo.</Text>
    {loading ? <View style={styles.analysisFeedback}><ActivityIndicator color="#93BDF4"/><Text style={styles.analysisText}>Gerando análise personalizada...</Text></View> : <>
      {!!error && <View style={styles.analysisFeedback}><Text accessibilityRole="alert" style={styles.analysisError}>{error}</Text></View>}
      {(isImported || error || !analysis) && <Pressable accessibilityRole="button" onPress={onGenerate} style={({ pressed }) => [styles.generateButton, pressed && styles.pressed]}><Text style={styles.generateLabel}>{error ? 'Tentar análise novamente' : 'Gerar análise da IA'}</Text></Pressable>}
      {analysis && <View style={styles.analysisGrid}>
        {[[ 'Pontos fortes', analysis.strengths ], [ 'Pontos fracos', analysis.weaknesses ], [ 'Melhor uso', [analysis.bestUse] ], [ 'Concorrentes semelhantes', analysis.competitors ]].map(([title, items]) => <View style={[styles.analysisCard, title === 'Melhor uso' && styles.bestUse]} key={title}>
          <Text style={styles.analysisCardTitle}>{title}</Text>
          {items.filter(item => typeof item === 'string' && item.trim()).length ? items.filter(item => typeof item === 'string' && item.trim()).map((item, index) => <Text style={title === 'Melhor uso' ? styles.bestUseText : styles.analysisText} key={index}>{title === 'Melhor uso' ? '' : '• '}{item}</Text>) : <Text style={styles.analysisText}>Não informado pela IA.</Text>}
        </View>)}
      </View>}
    </>}
    <Text style={styles.analysisDisclaimer}>Gerado por IA. Consulte as fontes técnicas.</Text>
  </View>;
}

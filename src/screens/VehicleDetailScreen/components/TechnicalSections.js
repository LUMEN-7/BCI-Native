import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FieldEvidence, { SourceLink } from './FieldEvidence';
import Action from '../../../components/SearchAction';
import styles from '../styles';

const GROUPS = [
  ['base', 'Dados base', [['Modelo', 'model'], ['Marca', 'brand'], ['Ano', 'year'], ['Modos de condução', 'driveModes']]],
  ['engine', 'Motorização e desempenho', [['Motor', 'engine'], ['Potência', 'power'], ['Torque', 'torque'], ['Potência RPM', 'powerRpm'], ['Torque RPM', 'torqueRpm'], ['Transmissão', 'transmission'], ['Tração', 'drivetrain']]],
  ['consumption', 'Consumo', [['Cidade', 'cityConsumption'], ['Estrada', 'highwayConsumption']]],
  ['dimensions', 'Dimensões', [['Comprimento', 'length'], ['Largura', 'width'], ['Altura', 'height'], ['Entre-eixos', 'wheelbase']]],
  ['tires', 'Pneus', [['Tipo', 'tireType'], ['Aro', 'rim'], ['Largura', 'tireWidth'], ['Perfil', 'tireProfile']]],
  ['extras', 'Capacidades e extras', [['Tanque', 'tankCapacity'], ['Combustível', 'fuelType'], ['Carga', 'loadCapacity'], ['Reboque', 'towingCapacity']]],
  ['performance', 'Performance'], ['security', 'Segurança'], ['technology', 'Tecnologia'], ['comfort', 'Conforto'],
];
export default function TechnicalSections({ car, openSections, onToggle, showSources, onSources, enriching, enrichmentError, onRetry }) {
  function accordion([key, title, rows], index) {
    const open = openSections.includes(key);
    const items = rows ? rows.map(([label, field]) => ({ label, ...car.specs[field] })) : car.sections[key];
    return <View style={[styles.accordion, index > 0 && styles.accordionDivider]} key={key}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={title} onPress={() => onToggle(key)} style={styles.accordionTrigger}>
        <Text style={styles.accordionTitle}>{title}</Text><Ionicons name={open ? 'chevron-up-outline' : 'chevron-down-outline'} size={17} color="#718094"/>
      </Pressable>
      {open && <View style={styles.accordionContent}>{items.length ? items.map((item, i) => <View style={styles.technicalRow} key={i}>
        <View style={styles.technicalValue}>{item.label && <Text style={styles.rowLabel}>{item.label}</Text>}<Text style={styles.rowValue}>{item.value}</Text></View>
        <FieldEvidence field={item} sources={car.sources} showSources={showSources}/>
      </View>) : <Text style={styles.muted}>Não informado na ficha do veículo.</Text>}</View>}
    </View>;
  }
  return <View style={styles.technical}>
    <View style={styles.sectionHeading}><Text style={styles.technicalEyebrow}>ESPECIFICAÇÕES</Text><Text accessibilityRole="header" style={styles.sectionTitle}>FICHA TÉCNICA</Text></View>
    <View style={styles.legend}>
      <View style={styles.legendHeader}><Ionicons name="information-circle-outline" size={22} color="#00142E"/><View style={styles.flex}><Text style={styles.legendTitle}>CONFIABILIDADE DOS DADOS</Text><Text style={styles.muted}>Entenda a origem de cada informação.</Text></View></View>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: showSources }} onPress={() => onSources(!showSources)} style={styles.sourcesButton}><Ionicons name="document-text-outline" size={16} color="#00142E"/><Text style={styles.sourcesButtonLabel}>{showSources ? 'Ocultar fontes' : 'Ver fontes dos dados'}</Text></Pressable>
      <View style={styles.legendItems}>
        {[['Alta', '≥ 80%', '#E6F4EF', '#176544'], ['Média', '60–79%', '#FFF3DD', '#845A0D'], ['Baixa', '< 60%', '#FCEDE8', '#A4513B'], ['IA', 'Estimativa', '#EDF1F6', '#506174']].map(([label, value, backgroundColor, color]) => <View style={styles.legendItem} key={label}><Text style={[styles.legendPill, { backgroundColor, color }]}>{label}</Text><Text style={styles.legendCaption}>{value}</Text></View>)}
      </View>
      {showSources && <View style={styles.sourcesPanel}><Text style={styles.subheading}>Fontes da ficha</Text>{car.sources.length ? car.sources.map((source, index) => <SourceLink key={index} source={source} sources={car.sources}/>) : <Text style={styles.muted}>Consulte a origem disponível junto de cada campo.</Text>}</View>}
    </View>
    {enriching && <View style={styles.confidenceRow}><ActivityIndicator size="small" color="#0562D2"/><Text style={styles.muted}>Complementando somente campos ausentes com IA...</Text></View>}
    {!!enrichmentError && <View style={styles.feedback}><Text style={styles.error}>Não foi possível complementar os campos. {enrichmentError}</Text><Action title="Tentar complementar novamente" variant="secondary" onPress={onRetry}/></View>}
    <Text style={styles.subsectionTitle}>DADOS TÉCNICOS</Text>
    <View style={styles.accordionGroup}>{GROUPS.slice(0, 6).map(accordion)}</View>
    <Text style={styles.subsectionTitle}>RECURSOS E DESEMPENHO</Text>
    <View style={styles.accordionGroup}>{GROUPS.slice(6).map(accordion)}</View>
  </View>;
}

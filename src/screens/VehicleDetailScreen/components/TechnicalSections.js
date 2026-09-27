import { ActivityIndicator, Pressable, Switch, Text, View } from 'react-native';
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
  return <View style={styles.technical}>
    <View style={styles.sectionHeading}><Text style={styles.eyebrow}>DADOS E CONFIABILIDADE</Text><Text accessibilityRole="header" style={styles.sectionTitle}>INFORMAÇÕES TÉCNICAS</Text></View>
    <View style={styles.legend}>
      <View style={styles.legendHeader}><View style={styles.flex}><Text style={styles.subheading}>Transparência dos dados</Text><Text style={styles.muted}>Consulte confiança, conflitos e origem de cada valor.</Text></View><Switch accessibilityLabel="Mostrar fontes" value={showSources} onValueChange={onSources} trackColor={{ true: '#0562D2', false: '#CED5DF' }}/></View>
      <Text style={styles.linkLabel}>{showSources ? 'Ocultar fontes' : 'Mostrar fontes'}</Text>
      <Text style={styles.legendText}>Alta ≥ 80% · Média 60–79% · Baixa &lt; 60%{ '\n' }Estimativas da IA são identificadas e não possuem fonte confirmada.</Text>
    </View>
    {enriching && <View style={styles.confidenceRow}><ActivityIndicator size="small" color="#0562D2"/><Text style={styles.muted}>Complementando somente campos ausentes com IA...</Text></View>}
    {!!enrichmentError && <View style={styles.feedback}><Text style={styles.error}>Não foi possível complementar os campos. {enrichmentError}</Text><Action title="Tentar complementar novamente" variant="secondary" onPress={onRetry}/></View>}
    {GROUPS.map(([key, title, rows]) => {
      const open = openSections.includes(key);
      const items = rows ? rows.map(([label, field]) => ({ label, ...car.specs[field] })) : car.sections[key];
      return <View style={[styles.accordion, open && styles.accordionOpen]} key={key}>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={title} onPress={() => onToggle(key)} style={styles.accordionTrigger}>
          <Text style={styles.accordionTitle}>{title}</Text><Ionicons name={open ? 'chevron-up-outline' : 'chevron-down-outline'} size={18} color="#00142E"/>
        </Pressable>
        {open && <View style={styles.accordionContent}>{items.length ? items.map((item, index) => <View style={styles.technicalRow} key={index}>
          {item.label && <Text style={styles.rowLabel}>{item.label}</Text>}<Text style={styles.rowValue}>{item.value}</Text><FieldEvidence field={item} sources={car.sources} showSources={showSources}/>
        </View>) : <Text style={styles.muted}>Não informado na ficha do veículo.</Text>}</View>}
      </View>;
    })}
    {showSources && car.sources.length > 0 && <View style={styles.sourcesPanel}><Text style={styles.subheading}>Fontes da ficha</Text>{car.sources.map((source, index) => <SourceLink key={index} source={source} sources={car.sources}/>)}</View>}
  </View>;
}

import { useState } from 'react';
import { Text, View } from 'react-native';
import Screen from '../../components/Screen';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import { Action, Feedback, Heading, Tabs, s } from '../../components/MobileUI';
import { getCatalog } from '../../services/catalogService';
import { adaptCarDetail, isMissing } from '../../utils/vehicleAdapters';
import { SourceLink } from '../VehicleDetailScreen/components/FieldEvidence';
import useRemoteResource from '../../hooks/useRemoteResource';
const loader = async () => {
  const data = await getCatalog();
  return data.map(c => adaptCarDetail(c)).filter(Boolean);
};
export default function InsightsScreen({
  navigation
}) {
  const r = useRemoteResource(loader),
    [segment, setSegment] = useState('Todos');
  const cars = r.data || [],
    categories = [...new Set(cars.map(c => c.type).filter(v => v && v !== 'Não informado'))],
    filtered = cars.filter(c => segment === 'Todos' || c.type === segment);
  const brands = Object.entries(filtered.reduce((a, c) => {
    const key = c.brand || 'Não informado';
    a[key] = (a[key] || 0) + 1;
    return a;
  }, {})).sort((a, b) => b[1] - a[1]);
  const sources = [...new Map(filtered.flatMap(c => c.sources).map(src => [JSON.stringify(src), src])).values()];
  const conflicts = filtered.filter(c => Object.values(c.specs).some(v => v.conflict));
  const complete = filtered.filter(c => ['engine', 'power', 'type', 'cityConsumption'].every(k => !isMissing(c.specs[k]))).length;
  return <Screen onRefresh={r.reload} refreshing={r.loading}><PageHeader eyebrow="Inteligência competitiva" title="INSIGHTS" description="Explore os modelos e a qualidade das informações disponíveis no catálogo." /><Feedback error={r.error} retry={r.reload} /><Heading title="SEGMENTO" /><Tabs value={segment} onChange={setSegment} items={['Todos', ...categories].map(id => ({
      id,
      label: id
    }))} />
    {r.loading ? <LoadingState /> : r.data && <><View style={[s.panel, {
        flexDirection: 'row',
        flexWrap: 'wrap'
      }]}>{[[filtered.length, 'Modelos no catálogo'], [brands.length, 'Marcas'], [complete, 'Fichas com dados principais'], [conflicts.length, 'Fichas com conflitos']].map(([value, label]) => <View key={label} style={{
          width: '45%',
          gap: 6,
          paddingVertical: 10
        }}><Text style={[s.title, {
            fontSize: 37
          }]}>{value}</Text><Text style={s.meta}>{label}</Text></View>)}</View>
      <View style={s.panel}><Heading eyebrow="Composição da base" title="PRESENÇA POR MARCA" description="Distribuição dos modelos catalogados. Não representa participação de mercado." />{brands.map(([brand, count]) => <View key={brand} style={{
          gap: 7
        }}><View style={s.row}><Text style={[s.body, s.grow]}>{brand}</Text><Text style={s.strong}>{count}</Text></View><View style={{
            height: 8,
            borderRadius: 8,
            backgroundColor: '#E8EDF4'
          }}><View style={{
              height: 8,
              borderRadius: 8,
              backgroundColor: '#0562D2',
              width: count / filtered.length * 100 + '%'
            }} /></View></View>)}{!brands.length && <EmptyState title="Nenhum modelo neste segmento" />}</View>
      <Heading eyebrow="Monitoramento" title="TENDÊNCIAS" /><View style={s.panel}><EmptyState icon="trending-up-outline" title="Série histórica indisponível" description="A fonte atual não fornece a evolução de adoção de tecnologias ou de preços." /></View>
      <Heading eyebrow="Origem dos dados" title="FONTES" /><View style={s.panel}>{sources.length ? sources.map((source, i) => <SourceLink key={i} source={source} sources={sources} />) : <Text style={s.body}>Nenhuma fonte geral informada para este segmento. Consulte também a origem de cada campo na ficha do veículo.</Text>}</View>
      <Heading eyebrow="Qualidade dos dados" title="PONTOS PARA REVISÃO" />{conflicts.length ? conflicts.map(c => <View key={c.id} style={s.panel}><Text style={s.title}>{c.name}</Text><Text style={s.body}>Esta ficha contém informações conflitantes entre fontes.</Text><Action secondary title="Revisar ficha" onPress={() => navigation.navigate('VehicleDetail', {
          lineageId: c.id,
          car: c
        })} /></View>) : <Text style={s.body}>Nenhum conflito sinalizado nos modelos deste segmento.</Text>}<Text style={s.meta}>Indicadores calculados a partir do catálogo disponível. Campos ausentes permanecem sem estimativas.</Text>
    </>}
  </Screen>;
}

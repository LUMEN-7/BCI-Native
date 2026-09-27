import { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, Switch, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import PageHeader from '../../components/PageHeader';
import LoadingState from '../../components/LoadingState';
import { Action, Back, Feedback, Heading, Tabs, s } from '../../components/MobileUI';
import useRemoteResource from '../../hooks/useRemoteResource';
import { compareDirect } from '../../services/comparisonService';
import { analyzeComparison, enrichVehicle } from '../../services/aiService';
import { saveComparison } from '../../services/userService';
import { adaptComparisonCar, adaptCarDetail, applyEnrichment, isMissing, pick } from '../../utils/vehicleAdapters';
import { comparisonIds, comparisonRows, numeric } from '../../utils/comparison';
import TechnicalSections from '../VehicleDetailScreen/components/TechnicalSections';
import { getImportedVehicles } from '../../services/importedVehiclesStorage';
import { useAuth } from '../../context/AuthContext';
import ExportModal from '../VehicleDetailScreen/components/ExportModal';
export default function CompareResultScreen({
  route,
  navigation
}) {
  const refs = route.params?.cars;
  const {
    user
  } = useAuth();
  const loader = useCallback(async () => {
    const ids = comparisonIds(refs || []);
    const [response, imports] = await Promise.all([compareDirect(ids), getImportedVehicles(user)]);
    const rows = pick(response, 'carrosComparados') || [];
    const ordered = ids.map(id => rows.find(c => String(pick(c, 'id')) === String(id)));
    if (ordered.some(c => !c)) throw new Error('O servidor não retornou todos os modelos selecionados.');
    return {
      ids,
      cars: ordered.map(adaptComparisonCar),
      details: ordered.map(c => adaptCarDetail(c, imports.find(r => String(r.id) === String(pick(c, 'linhagemId', 'id'))))),
      summary: pick(response, 'parecerIA') || '',
      math: pick(response, 'conclusoesMatematicas') || {}
    };
  }, [refs, user]);
  const resource = useRemoteResource(loader),
    data = resource.data;
  const [saved, setSaved] = useState(false),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(''),
    [different, setDifferent] = useState(false),
    [selected, setSelected] = useState('0'),
    [open, setOpen] = useState([]),
    [sources, setSources] = useState(false),
    [exporting, setExporting] = useState(false);
  const [ai, setAi] = useState(null),
    [aiBusy, setAiBusy] = useState(false),
    [aiError, setAiError] = useState(''),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    setSaved(false);
    setSelected('0');
  }, [refs]);
  useEffect(() => {
    let active = true;
    setAi(null);
    setAiError('');
    if (!data || data.cars.length !== 2) {
      setAiBusy(false);
      return;
    }
    setAiBusy(true);
    analyzeComparison(data.cars[0], data.cars[1], data.math).then(value => {
      if (active) setAi(value);
    }).catch(e => {
      if (active) setAiError(e.message);
    }).finally(() => {
      if (active) setAiBusy(false);
    });
    return () => {
      active = false;
    };
  }, [data, retry]);
  async function save() {
    if (saving || saved) return;
    setSaving(true);
    setError('');
    try {
      await saveComparison({
        titulo: data.cars.map(c => c.name).join(' vs '),
        tipo: 'Direta',
        requestPayload: JSON.stringify({
          carrosIds: data.ids
        })
      });
      setSaved(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  const [details, setDetails] = useState([]),
    [enriching, setEnriching] = useState(false),
    [enrichError, setEnrichError] = useState(''),
    [enrichRevision, setEnrichRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setDetails(data?.details || []);
    setEnrichError('');
    if (!data) return;
    setEnriching(true);
    Promise.allSettled(data.details.map(async car => {
      if (!car || car.isImported) return car;
      const missing = Object.keys(car.specs).filter(key => isMissing(car.specs[key]));
      if (!missing.length && Object.values(car.sections).every(v => v.length)) return car;
      return applyEnrichment(car, await enrichVehicle(car, missing), missing);
    })).then(results => {
      if (!active) return;
      setDetails(results.map((r, i) => r.status === 'fulfilled' ? r.value : data.details[i]));
      if (results.some(r => r.status === 'rejected')) setEnrichError('Alguns campos não puderam ser complementados. Os dados originais foram preservados.');
      setEnriching(false);
    });
    return () => {
      active = false;
    };
  }, [data, enrichRevision]);
  const detail = details[Number(selected)];
  return <Screen><Back navigation={navigation} /><PageHeader eyebrow="Comparação automotiva" title="ALÉM DOS NÚMEROS" description="Analise diferenças, especificações e o parecer da IA." /><Feedback error={resource.error} retry={resource.reload} />
    {resource.loading ? <LoadingState label="Montando comparação..." /> : data && <>
      <View style={s.wrap}><Action title={saved ? 'Comparação salva' : 'Salvar comparação'} icon="bookmark-outline" loading={saving} disabled={saved} onPress={save} /><Action secondary title="Exportar comparação" icon="download-outline" onPress={() => setExporting(true)} /></View><Feedback error={error} />
      <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{
        gap: 14
      }}>{data.cars.map(c => <View key={c.id} style={[s.panel, {
          width: 245
        }]}><Text style={s.eyebrow}>{c.brand}</Text><Text style={s.title}>{c.name}</Text>{c.image && <Image source={{
            uri: c.image
          }} style={{
            height: 145,
            width: '100%'
          }} resizeMode="contain" />}<Text style={s.body}>{c.type}</Text></View>)}</ScrollView>
      <Heading eyebrow="Dados técnicos" title="LADO A LADO" /><View style={s.row}><Switch accessibilityLabel="Somente diferenças" value={different} onValueChange={setDifferent} trackColor={{
          true: '#0562D2'
        }} /><Text style={s.body}>Somente diferenças</Text></View>
      <ScrollView horizontal><View><View style={[s.row, {
            backgroundColor: '#EDF2F7',
            padding: 14
          }]}><Text style={[s.strong, {
              width: 115
            }]}>Atributo</Text>{data.cars.map(c => <Text key={c.id} style={[s.strong, {
              width: 145
            }]}>{c.name}</Text>)}</View>{comparisonRows(data.cars, different).map(row => <View key={row.key} style={[s.row, {
            padding: 14,
            borderBottomWidth: 1,
            borderColor: '#E2E6EB'
          }]}><Text style={[s.meta, {
              width: 115
            }]}>{row.key}</Text>{row.values.map((v, i) => <Text key={i} style={[s.body, {
              width: 145,
              color: '#00142E'
            }]}>{v}</Text>)}</View>)}</View></ScrollView>
      <Heading eyebrow="Comparação visual" title="POTÊNCIA" />{data.cars.map(c => {
        const n = numeric(c.power),
          max = Math.max(...data.cars.map(v => numeric(v.power) || 0), 1);
        return <View key={c.id} style={{
          gap: 7
        }}><View style={s.row}><Text style={[s.body, s.grow]}>{c.name}</Text><Text style={s.strong}>{c.power}</Text></View>{n != null && <View accessibilityRole="progressbar" accessibilityValue={{
            min: 0,
            max,
            now: n
          }} style={{
            height: 8,
            backgroundColor: '#E8EDF2',
            borderRadius: 8
          }}><View style={{
              width: n / max * 100 + '%',
              height: 8,
              backgroundColor: '#0562D2',
              borderRadius: 8
            }} /></View>}</View>;
      })}
      <Tabs value={selected} onChange={setSelected} items={data.cars.map((c, i) => ({
        id: String(i),
        label: c.name
      }))} />
      {detail && <TechnicalSections car={detail} openSections={open} onToggle={key => setOpen(v => v.includes(key) ? v.filter(k => k !== key) : [...v, key])} showSources={sources} onSources={setSources} enriching={enriching} enrichmentError={enrichError} onRetry={() => setEnrichRevision(v => v + 1)} />}
      <View style={s.panel}><Heading eyebrow="Análise inteligente" title="PARECER COMPARATIVO" />{aiBusy ? <LoadingState label="Gerando análise da IA..." /> : <><Text style={s.body}>{ai?.summary || data.summary || (data.cars.length > 2 ? 'O parecer da IA está disponível para comparações de dois modelos.' : 'Parecer não disponível.')}</Text>{!!ai?.recommendation && <Text style={s.body}>{ai.recommendation}</Text>}</>}<Feedback error={aiError} retry={() => setRetry(v => v + 1)} /></View>
      {exporting && detail && <ExportModal title="EXPORTAR COMPARAÇÃO" lineageId={data.details.filter(Boolean).map(c => c.id)} onClose={() => setExporting(false)} />}
    </>}
  </Screen>;
}

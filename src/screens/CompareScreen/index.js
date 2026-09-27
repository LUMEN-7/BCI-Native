import { useEffect, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import VehicleCard from '../../components/VehicleCard';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import { Action, Tabs, Heading, Feedback, s } from '../../components/MobileUI';
import useRemoteResource from '../../hooks/useRemoteResource';
import { getCatalog } from '../../services/catalogService';
import { selectionCar, matchesSimilarity, SIMILARITY_FILTERS } from '../../utils/comparison';
const loadCatalog = async () => (await getCatalog()).map(selectionCar);
export default function CompareScreen({
  navigation,
  route
}) {
  const resource = useRemoteResource(loadCatalog);
  const [mode, setMode] = useState('direct'),
    [selected, setSelected] = useState([null, null]),
    [slot, setSlot] = useState(0),
    [q, setQ] = useState(''),
    [filters, setFilters] = useState([]),
    [confirmed, setConfirmed] = useState(false),
    [visibleCount, setVisibleCount] = useState(20);
  useEffect(() => setVisibleCount(20), [q, filters, mode]);
  useEffect(() => {
    const car = route.params?.firstCar;
    if (car) {
      setMode('direct');
      setSelected([car.raw ? selectionCar(car.raw) : car, null]);
      setSlot(1);
      setFilters([]);
    }
  }, [route.params?.selectionKey, route.params?.firstCar]);
  const reference = selected[0];
  const results = (resource.data || []).filter(c => [c.brand, c.name, c.engine, c.power, c.type].join(' ').toLowerCase().includes(q.trim().toLowerCase())).filter(c => !reference || c.id === reference.id || filters.every(id => matchesSimilarity(c, reference, id))).filter(c => mode !== 'multi' || !reference || c.id !== reference.id);
  function changeMode(next) {
    setMode(next);
    setSelected([null, null]);
    setFilters([]);
    setConfirmed(false);
    setSlot(0);
    setQ('');
  }
  function toggle(car) {
    if (mode === 'multi') {
      if (!reference) {
        setSelected([car]);
        setQ('');
        return;
      }
      setSelected(cur => cur.some(c => c?.id === car.id) ? cur.filter(c => c?.id !== car.id) : cur.length < 6 ? [...cur, car] : cur);
      return;
    }
    const next = [...selected],
      existing = next.findIndex(c => c?.id === car.id);
    if (existing >= 0) {
      next[existing] = null;
      setSlot(existing);
    } else {
      next[slot] = car;
      setSlot(slot === 0 ? 1 : 0);
    }
    setSelected(next);
  }
  const chosen = selected.filter(Boolean),
    canCompare = chosen.length >= (mode === 'multi' ? 3 : 2);
  return <Screen onRefresh={resource.reload} refreshing={resource.loading}><PageHeader eyebrow="Análise competitiva" title="COMPARAR" description="Selecione modelos e descubra as diferenças que importam." /><Tabs value={mode} onChange={changeMode} items={[{
      id: 'direct',
      label: 'Comparação direta'
    }, {
      id: 'multi',
      label: 'Comparação múltipla'
    }]} />
    <View style={s.panel}><Heading eyebrow={mode === 'multi' ? 'Modelo de referência' : 'Seleção de modelos'} title={mode === 'multi' ? 'ENCONTRE SEMELHANTES' : 'LADO A LADO'} description={mode === 'multi' ? 'Escolha uma referência e de 2 a 5 modelos semelhantes.' : chosen.length + ' de 2 modelos selecionados'} />
      {(mode === 'direct' ? [0, 1] : [0]).map(i => <View key={i} style={[s.panel, {
        padding: 14,
        backgroundColor: slot === i ? '#EDF4FC' : '#F7F8FA',
        borderColor: slot === i ? '#0562D2' : '#E3E7EC'
      }]}><Pressable accessibilityRole="button" accessibilityLabel={'Selecionar modelo ' + (i + 1)} onPress={() => setSlot(i)} style={s.row}>{selected[i]?.image && <Image source={{
            uri: selected[i].image
          }} style={{
            width: 68,
            height: 60
          }} resizeMode="contain" />}<View style={s.grow}><Text style={s.eyebrow}>{mode === 'multi' ? 'REFERÊNCIA' : 'MODELO ' + (i === 0 ? 'A' : 'B')}</Text><Text style={s.strong}>{selected[i]?.name || 'Selecione um modelo'}</Text></View></Pressable>{selected[i] && <Action secondary compact title="Remover" onPress={() => {
          setSelected(cur => mode === 'multi' ? [null] : cur.map((c, n) => n === i ? null : c));
          setSlot(i);
          setConfirmed(false);
        }} />}</View>)}
      {mode === 'multi' && chosen.length > 1 && <Text style={s.body}>{chosen.slice(1).map(c => c.name).join(' • ')}</Text>}
      <Action title="Comparar modelos" icon="git-compare-outline" disabled={!canCompare} onPress={() => navigation.navigate('CompareResult', {
        cars: chosen
      })} />
    </View>
    {reference && <View style={{
      gap: 12
    }}><Heading eyebrow="Refine sua análise" title="SIMILARIDADE" /><View style={s.wrap}>{SIMILARITY_FILTERS.map(f => <Pressable accessibilityRole="checkbox" accessibilityState={{
          checked: filters.includes(f.id)
        }} key={f.id} style={[s.tab, filters.includes(f.id) && s.active]} onPress={() => {
          setFilters(v => v.includes(f.id) ? v.filter(x => x !== f.id) : [...v, f.id]);
          setConfirmed(false);
          if (mode === 'multi') setSelected([reference]);
        }}><Text style={[s.tabText, filters.includes(f.id) && s.white]}>{f.label}</Text></Pressable>)}</View><Text style={s.meta}>Campos sem dados não contam como semelhantes.</Text>{mode === 'multi' && <Action title="Buscar semelhantes" disabled={!filters.length} onPress={() => setConfirmed(true)} />}</View>}
    <FormField label={reference ? 'Buscar modelos' : 'Escolher referência'} value={q} onChangeText={setQ} placeholder="Marca, modelo, motor..." />
    <Feedback error={resource.error} retry={resource.reload} />{resource.loading ? <LoadingState /> : mode === 'multi' && reference && !confirmed ? <Text style={s.body}>Escolha os critérios e confirme a busca.</Text> : results.slice(0, visibleCount).map(car => <VehicleCard key={car.id} car={car} selected={chosen.some(c => c.id === car.id)} actionLabel={chosen.some(c => c.id === car.id) ? 'Selecionado' : 'Selecionar'} onPress={() => toggle(car)} />)}
    {!resource.loading && results.length > visibleCount && (mode === 'direct' || !reference || confirmed) && <Action secondary title="Carregar mais modelos" onPress={() => setVisibleCount(v => v + 20)} />}
    {!resource.loading && !resource.error && !results.length && <EmptyState title="Nenhum modelo encontrado" description="Tente outra busca ou altere os filtros." />}
  </Screen>;
}

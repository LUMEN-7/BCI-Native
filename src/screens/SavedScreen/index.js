import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Screen from '../../components/Screen';
import PageHeader from '../../components/PageHeader';
import VehicleCard from '../../components/VehicleCard';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import { Action, Feedback, Tabs, s } from '../../components/MobileUI';
import { getFavorites, getSavedComparisons, removeFavorite, removeSavedComparison } from '../../services/userService';
import { savedModels } from '../HomeScreen/homeData';
import { savedComparisonCars } from '../../utils/comparison';
import { pick } from '../../utils/vehicleAdapters';
import useRemoteResource from '../../hooks/useRemoteResource';
const loader = async () => {
  const [f, c] = await Promise.all([getFavorites(), getSavedComparisons()]);
  return {
    cars: savedModels(f),
    comparisons: Array.isArray(c) ? c : []
  };
};
export default function SavedScreen({
  navigation,
  route
}) {
  const [tab, setTab] = useState('cars'),
    [busy, setBusy] = useState(null),
    [error, setError] = useState('');
  const r = useRemoteResource(loader);
  useEffect(() => {
    if (route?.params?.initialTab === 'comparisons') setTab('comparisons');
  }, [route?.params?.initialTab, route?.params?.selectionKey]);
  async function remove(id, kind) {
    if (busy) return;
    setBusy(String(id));
    setError('');
    try {
      await (kind === 'cars' ? removeFavorite(id) : removeSavedComparison(id));
      r.setData(v => v ? {
        ...v,
        [kind]: v[kind].filter(x => String(pick(x, 'id')) !== String(id))
      } : v);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }
  function open(item) {
    try {
      navigation.navigate('CompareResult', {
        cars: savedComparisonCars(item)
      });
    } catch (e) {
      setError(e.message);
    }
  }
  const cars = r.data?.cars || [],
    comparisons = r.data?.comparisons || [];
  return <Screen onRefresh={r.reload} refreshing={r.loading}><PageHeader eyebrow="Sua biblioteca" title="SALVOS" description="Seus modelos favoritos e análises comparativas em um só lugar." /><Tabs value={tab} onChange={setTab} items={[{
      id: 'cars',
      label: 'Modelos',
      count: cars.length
    }, {
      id: 'comparisons',
      label: 'Comparações',
      count: comparisons.length
    }]} /><Feedback error={r.error || error} retry={r.reload} />
    {r.loading ? <LoadingState /> : tab === 'cars' ? cars.length ? cars.map(car => <VehicleCard key={car.id} car={car} favorite onFavorite={() => remove(car.id, 'cars')} onPress={() => navigation.navigate('VehicleDetail', {
      lineageId: car.id,
      car
    })} />) : <EmptyState title="Nenhum modelo salvo" description="Salve um veículo na Pesquisa para encontrá-lo aqui." /> : comparisons.length ? comparisons.map(item => <View style={s.panel} key={pick(item, 'id')}><Text style={s.eyebrow}>COMPARAÇÃO SALVA</Text><Text style={s.title}>{pick(item, 'titulo') || 'Comparação salva'}</Text><Text style={s.body}>{pick(item, 'tipo') || 'Direta'}</Text><Action title="Ver comparação" icon="git-compare-outline" onPress={() => open(item)} /><Action secondary danger title="Remover" loading={busy === String(pick(item, 'id'))} disabled={!!busy} onPress={() => remove(pick(item, 'id'), 'comparisons')} /></View>) : <EmptyState title="Nenhuma comparação salva" />}
  </Screen>;
}

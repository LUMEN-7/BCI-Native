import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import AppButton from '../../components/SearchAction';
import VehicleCard from '../../components/VehicleCard';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import { getCars, getJobStatus, startSearch } from '../../services/carsService';
import { listSchedules } from '../../services/scheduleService';
import { addFavorite, getFavoriteIds, getFavorites, removeFavorite } from '../../services/userService';
import { getUserScopedJson, setUserScopedJson } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { adaptCarCard } from '../../utils/vehicleAdapters';
import { watchSearchJob } from '../../utils/searchPolling';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import ScheduleModal from './ScheduleModal';
import ImportVehicleModal from './ImportVehicleModal';
import { getImportedVehicles, rememberImportedVehicle } from '../../services/importedVehiclesStorage';
import styles from './styles';

export default function SearchScreen({ navigation }) {
  const { user } = useAuth();
  const [cars, setCars] = useState([]);
  const [favs, setFavs] = useState([]);
  const [q, setQ] = useState('');
  const debouncedQ = useDebouncedValue(q, 200);
  const [brand, setBrand] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [error, setError] = useState('');
  const [schedule, setSchedule] = useState(null);
  const [importing, setImporting] = useState(null);
  const [notice, setNotice] = useState('');
  const [scheduledCount, setScheduledCount] = useState(0);
  const [reload, setReload] = useState(0);
  const searchLock = useRef(false);
  const favoriteLocks = useRef(new Set());
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    async function load() {
      setLoading(true); setError('');
      const results = await Promise.allSettled([getCars(), getFavorites(), listSchedules(), getUserScopedJson('search.job', user), getImportedVehicles(user)]);
      if (!mounted.current) return;
      const [catalog, favorites, schedules, savedJob, imported] = results;
      const local = imported.status === 'fulfilled' ? imported.value : [];
      const remote = catalog.status === 'fulfilled' && Array.isArray(catalog.value) ? catalog.value.map(adaptCarCard) : [];
      setCars([...local, ...remote.filter(car => !local.some(saved => saved.id === car.id))]);
      if (favorites.status === 'fulfilled') setFavs(getFavoriteIds(favorites.value));
      if (schedules.status === 'fulfilled') setScheduledCount(schedules.value.length);
      const failed = results.find(r => r.status === 'rejected');
      if (failed) setError(failed.reason.message);
      if (savedJob.status === 'fulfilled' && savedJob.value) {
        searchLock.current = true; setSearching(true); setJobId(savedJob.value);
      }
      setLoading(false);
    }
    load();
    return () => { mounted.current = false; };
  }, [reload]);

  function upsert(dto) {
    const next = adaptCarCard(dto);
    setCars(current => {
      const previous = current.find(car => car.id === next.id);
      return [{ ...previous, ...next, isImported: previous?.isImported || next.isImported }, ...current.filter(car => car.id !== next.id)];
    });
  }

  async function trackJob(result) {
    const id = result?.job_id ?? result?.jobId;
    if (!id) throw new Error('O servidor não retornou o identificador da pesquisa.');
    searchLock.current = true; setSearching(true);
    await setUserScopedJson('search.job', user, id).catch(() => {});
    if (mounted.current) setJobId(id);
  }

  useEffect(() => {
    if (!jobId) return;
    async function finish() {
      searchLock.current = false; setSearching(false); setJobId(null);
      await setUserScopedJson('search.job', user, null).catch(() => {});
    }
    return watchSearchJob({
      jobId, getStatus: getJobStatus,
      onComplete: car => { upsert(car); setError(''); finish(); },
      onFailure: () => { setError('A pesquisa não pôde ser concluída. Tente novamente.'); finish(); },
      onConnected: () => setError(''),
      onConnectionError: e => setError(`${e.message} Tentando acompanhar a pesquisa novamente...`),
    });
  }, [jobId]);

  const results = useMemo(() => {
    const term = debouncedQ.trim().toLowerCase();
    return cars.filter(c => (!term || `${c.brand} ${c.name} ${c.type}`.toLowerCase().includes(term)) && (!brand.trim() || c.brand.toLowerCase() === brand.trim().toLowerCase()) && (!year || String(c.year) === year));
  }, [cars, debouncedQ, brand, year]);

  async function toggle(id) {
    const key = String(id);
    if (favoriteLocks.current.has(key)) return;
    favoriteLocks.current.add(key);
    try {
      if (favs.includes(key)) { await removeFavorite(id); setFavs(v => v.filter(x => x !== key)); }
      else { await addFavorite(id); setFavs(v => [...new Set([...v, key])]); }
    } catch (e) { setError(e.message); }
    finally { favoriteLocks.current.delete(key); }
  }

  async function remoteSearch() {
    if (searchLock.current || loading) return;
    if (!brand.trim()) return setError('Informe ao menos a marca para iniciar uma pesquisa externa.');
    if (year && (!/^\d{4}$/.test(year) || Number(year) < 1950 || Number(year) > 2050)) return setError('Informe um ano entre 1950 e 2050.');
    searchLock.current = true; setSearching(true); setError('');
    try { await trackJob(await startSearch({ model: q.trim(), brand: brand.trim(), year: year.trim() })); }
    catch (e) { searchLock.current = false; setSearching(false); setError(e.message); }
  }

  async function runScheduled(item, result) {
    setQ(item.modelo || ''); setBrand(item.marca || ''); setYear(item.ano ? String(item.ano) : '');
    await trackJob(result);
  }

  async function importedVehicle(result, form, previousId) {
    const car = { ...adaptCarCard(result.carro), isImported: true, importForm: form };
    setCars(current => [car, ...current.filter(item => item.id !== car.id && item.id !== previousId)]);
    setQ(''); setBrand(''); setYear(''); setError('');
    const ignored = result.colunasNaoReconhecidas || [];
    setNotice(ignored.length ? `Veículo salvo. Campos não reconhecidos pela API: ${ignored.join(', ')}.` : 'Veículo importado com sucesso.');
    try { await rememberImportedVehicle(user, car, previousId); }
    catch { setNotice('Veículo salvo no servidor. Não foi possível guardar a ficha adicional neste dispositivo.'); }
  }

  const header = <View style={styles.top}>
    <PageHeader eyebrow="Pesquisa inteligente" title="PESQUISAR" description="Filtre a base existente ou inicie uma nova busca no motor do BCI."/>
    <View style={styles.controls}>
      <FormField label="Modelo ou termo" accessibilityLabel="Pesquisar modelo, marca ou segmento" style={styles.searchInput} value={q} onChangeText={setQ} placeholder="Modelo, marca ou segmento..." returnKeyType="search" onSubmitEditing={remoteSearch}/>
      <View style={styles.row}><View style={styles.field}><FormField label="Marca" style={styles.input} value={brand} onChangeText={setBrand} placeholder="Digite uma marca"/></View><View style={styles.small}><FormField label="Ano" style={styles.input} value={year} onChangeText={v => setYear(v.replace(/\D/g, '').slice(0, 4))} keyboardType="number-pad" placeholder="2026"/></View></View>
      <AppButton title={searching ? 'Pesquisando fontes...' : 'Pesquisar'} icon="search-outline" onPress={remoteSearch} disabled={loading} loading={searching}/>
      <AppButton title={`Agendar Pesquisa${scheduledCount ? ` (${scheduledCount})` : ''}`} icon="alarm-outline" variant="secondary" onPress={() => setSchedule({ car: null })}/>
      <AppButton title="Importar" icon="cloud-upload-outline" variant="secondary" onPress={() => setImporting({ car: null })}/>
    </View>
    <View style={styles.wrap}>{[[q, setQ, 'Busca'], [brand, setBrand, 'Marca'], [year, setYear, 'Ano']].filter(([value]) => value).map(([value, setter, label]) => <AppButton key={label} title={`${label}: ${value}`} icon="close-outline" compact variant="secondary" onPress={() => setter('')}/>)}</View>
    {!!(q || brand || year) && <AppButton title="Limpar filtros" icon="refresh-outline" variant="ghost" onPress={() => { setQ(''); setBrand(''); setYear(''); setError(''); }}/>}
    {!!notice && <Text style={styles.notice} accessibilityLiveRegion="polite">{notice}</Text>}
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    {!!error && !searching && <AppButton title="Atualizar dados" variant="ghost" disabled={loading} onPress={() => setReload(v => v + 1)}/>}
    {!loading && <Text style={styles.count}>{results.length} {results.length === 1 ? 'modelo encontrado' : 'modelos encontrados'}</Text>}
  </View>;

  return <Screen scroll={false} contentContainerStyle={styles.screenContent}>
    <FlatList data={loading ? [] : results} keyExtractor={item => item.id} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.list}
      ListHeaderComponent={header} ItemSeparatorComponent={() => <View style={styles.separator}/>}
      ListEmptyComponent={loading ? <LoadingState/> : <EmptyState title="Nenhum modelo encontrado" description="Ajuste os filtros ou inicie uma nova pesquisa."/>}
      renderItem={({ item }) => <VehicleCard car={item} favorite={favs.includes(item.id)} onFavorite={() => toggle(item.id)} onSchedule={() => setSchedule({ car: item })} onEdit={() => setImporting({ car: item })} onPress={() => navigation.navigate('VehicleDetail', { lineageId: item.id, car: item })}/>}/>
    {schedule && <ScheduleModal cars={cars} initialCar={schedule.car} onClose={() => setSchedule(null)} onRun={runScheduled} searchBusy={searching || loading} onCount={setScheduledCount}/>}
    {importing && <ImportVehicleModal initialVehicle={importing.car} onClose={() => setImporting(null)} onSaved={importedVehicle}/>}
  </Screen>;
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import AppButton from '../../components/AppButton';
import VehicleCard from '../../components/VehicleCard';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';
import { getCars, getJobStatus, startSearch } from '../../services/carsService';
import { listSchedules } from '../../services/scheduleService';
import { addFavorite, getFavoriteIds, getFavorites, removeFavorite } from '../../services/userService';
import { getUserScopedJson, setUserScopedJson } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { adaptCarCard } from '../../utils/vehicleAdapters';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import ScheduleModal from './ScheduleModal';
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
  const [scheduledCount, setScheduledCount] = useState(0);
  const searchLock = useRef(false);
  const favoriteLocks = useRef(new Set());
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    async function load() {
      const results = await Promise.allSettled([getCars(), getFavorites(), listSchedules(), getUserScopedJson('search.job', user)]);
      if (!mounted.current) return;
      const [catalog, favorites, schedules, savedJob] = results;
      if (catalog.status === 'fulfilled') setCars((Array.isArray(catalog.value) ? catalog.value : []).map(adaptCarCard));
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
  }, []);

  function upsert(dto) {
    const next = adaptCarCard(dto);
    setCars(current => [next, ...current.filter(car => car.id !== next.id)]);
  }

  async function trackJob(result) {
    const id = result?.job_id ?? result?.jobId;
    if (!id) throw new Error('O servidor não retornou o identificador da pesquisa.');
    searchLock.current = true; setSearching(true); setJobId(id);
    await setUserScopedJson('search.job', user, id).catch(() => {});
  }

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    let timer;
    async function finish() {
      searchLock.current = false; setSearching(false); setJobId(null);
      await setUserScopedJson('search.job', user, null).catch(() => {});
    }
    async function poll() {
      try {
        const status = await getJobStatus(jobId);
        if (cancelled) return;
        if (status.status === 'done' && status.carro) {
          upsert(status.carro); setError(''); await finish(); return;
        }
        if (status.status === 'error') {
          setError('A pesquisa não pôde ser concluída. Tente novamente.'); await finish(); return;
        }
        setError('');
      } catch (e) {
        if (cancelled) return;
        setError(`${e.message} Tentando acompanhar a pesquisa novamente...`);
      }
      if (!cancelled) timer = setTimeout(poll, 3000);
    }
    poll();
    return () => { cancelled = true; clearTimeout(timer); };
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

  const header = <View style={styles.top}>
    <PageHeader eyebrow="Pesquisa inteligente" title="PESQUISAR" description="Filtre a base existente ou inicie uma nova busca no motor do BCI."/>
    <FormField label="Modelo ou termo" value={q} onChangeText={setQ} placeholder="Ex.: Corolla Cross"/>
    <View style={styles.row}><View style={styles.field}><FormField label="Marca" value={brand} onChangeText={setBrand} placeholder="Toyota"/></View><View style={styles.small}><FormField label="Ano" value={year} onChangeText={v => setYear(v.replace(/\D/g, '').slice(0, 4))} keyboardType="number-pad" placeholder="2026"/></View></View>
    <AppButton title={searching ? 'Pesquisando fontes...' : 'Buscar novo modelo'} onPress={remoteSearch} disabled={loading} loading={searching}/>
    <AppButton title={`Agendar Pesquisa${scheduledCount ? ` (${scheduledCount})` : ''}`} variant="secondary" onPress={() => setSchedule({ car: null })}/>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
  </View>;

  return <Screen scroll={false}>
    <FlatList data={loading ? [] : results} keyExtractor={item => item.id} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.list}
      ListHeaderComponent={header} ItemSeparatorComponent={() => <View style={styles.separator}/>}
      ListEmptyComponent={loading ? <LoadingState/> : <EmptyState title="Nenhum modelo encontrado" description="Ajuste os filtros ou inicie uma nova pesquisa."/>}
      renderItem={({ item }) => <VehicleCard car={item} favorite={favs.includes(item.id)} onFavorite={() => toggle(item.id)} onSchedule={() => setSchedule({ car: item })} onPress={() => navigation.navigate('VehicleDetail', { lineageId: item.id, car: item })}/>}/>
    {schedule && <ScheduleModal cars={cars} initialCar={schedule.car} onClose={() => setSchedule(null)} onRun={runScheduled} searchBusy={searching || loading} onCount={setScheduledCount}/>}
  </Screen>;
}

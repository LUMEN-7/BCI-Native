import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import AppButton from '../../components/AppButton';
import FormField from '../../components/FormField';
import { deleteSchedule, listSchedules, runScheduleNow, saveSchedule, toggleSchedule } from '../../services/scheduleService';
import { RECURRENCES } from '../../utils/schedule';
import ModalShell from './ModalShell';
import styles from './modalStyles';

export default function ScheduleModal({ cars, initialCar, onClose, onRun, searchBusy, onCount }) {
  const [tab, setTab] = useState('new');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [unreleased, setUnreleased] = useState(false);
  const [selected, setSelected] = useState(initialCar?.id || '');
  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [recurrence, setRecurrence] = useState('once');
  const [notes, setNotes] = useState('');
  async function refresh() {
    const next = await listSchedules();
    setList(next); onCount(next.length);
  }
  useEffect(() => { refresh().catch(e => setError(e.message)).finally(() => setLoading(false)); }, []);
  async function act(operation) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(''); setMessage('');
    try { await operation(); } catch (e) { setError(e.message); }
    finally { lock.current = false; setBusy(false); }
  }
  function save() {
    act(async () => {
      if (unreleased && !year) throw new Error('Informe o ano do veículo não lançado.');
      const car = unreleased ? { brand, model, year } : cars.find(c => c.id === selected);
      await saveSchedule({ car, date, time, recurrence, notes: notes.trim() });
      setMessage('Pesquisa agendada.'); setTab('list'); await refresh();
    });
  }
  function remove(item) {
    Alert.alert('Excluir agendamento?', `${item.marca} ${item.modelo}`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Excluir', style: 'destructive', onPress: () => act(async () => { await deleteSchedule(item.id); await refresh(); }) }]);
  }
  return <ModalShell title="Agendar Pesquisa" onClose={onClose} busy={busy}>
    <View style={styles.row}><AppButton title="Novo" variant={tab === 'new' ? 'primary' : 'secondary'} disabled={busy} onPress={() => setTab('new')}/><AppButton title={`Agendados (${list.length})`} variant={tab === 'list' ? 'primary' : 'secondary'} disabled={busy} onPress={() => setTab('list')}/></View>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    {!!message && <Text accessibilityLiveRegion="polite" style={styles.success}>{message}</Text>}
    {tab === 'new' ? <>
      <View style={styles.row}>{[[false, 'Veículo existente'], [true, 'Não lançado']].map(([value, label]) => <AppButton key={label} title={label} compact disabled={busy} variant={unreleased === value ? 'primary' : 'secondary'} onPress={() => setUnreleased(value)}/>)}</View>
      {unreleased ? <View style={styles.card}><FormField label="Marca" value={brand} onChangeText={setBrand}/><FormField label="Modelo" value={model} onChangeText={setModel}/><FormField label="Ano" value={year} onChangeText={setYear} keyboardType="number-pad" maxLength={4}/></View> : <View style={styles.card}>
        <FormField label="Buscar veículo no catálogo" value={query} onChangeText={setQuery}/>
        {cars.filter(c => !c.isImported && `${c.brand} ${c.name}`.toLowerCase().includes(query.trim().toLowerCase())).map(car => <Pressable key={car.id} disabled={busy} accessibilityRole="radio" accessibilityState={{ checked: selected === car.id }} onPress={() => setSelected(car.id)} style={[styles.choice, selected === car.id && styles.chosen]}><Text style={styles.text}>{car.brand} {car.name}{selected === car.id ? ' • Selecionado' : ''}</Text></Pressable>)}
        {!cars.some(c => !c.isImported) && <Text style={styles.text}>Nenhum veículo disponível. Use a opção Não lançado.</Text>}
      </View>}
      <FormField label="Data (AAAA-MM-DD)" placeholder="2026-12-31" value={date} onChangeText={setDate} maxLength={10}/>
      <FormField label="Hora local (HH:MM)" placeholder="09:00" value={time} onChangeText={setTime} maxLength={5}/>
      <Text style={styles.heading}>Recorrência</Text><View style={styles.row}>{Object.entries(RECURRENCES).map(([value, label]) => <AppButton key={value} title={label} compact disabled={busy} variant={recurrence === value ? 'primary' : 'secondary'} onPress={() => setRecurrence(value)}/>)}</View>
      <FormField label="Notas (opcional)" value={notes} onChangeText={setNotes} multiline maxLength={140}/>
      <AppButton title="Agendar Pesquisa" loading={busy} onPress={save}/>
    </> : <>
      <AppButton title={loading ? 'Carregando...' : 'Atualizar agendamentos'} variant="ghost" disabled={busy || loading} onPress={() => act(refresh)}/>
      {!loading && !list.length && <Text style={styles.text}>Nenhuma pesquisa agendada.</Text>}
      {list.map(item => <View key={item.id} style={styles.card}>
        <Text style={styles.heading}>{item.marca} {item.modelo} {item.ano}</Text>
        <Text style={styles.text}>{item.date} · {item.time} · {RECURRENCES[item.recurrence]}</Text>
        <Text style={styles.text}>Status: {String(item.status ?? 'Não informado')}</Text>
        {!!item.notas && <Text style={styles.text}>{item.notas}</Text>}
        <View style={styles.row}>
          <AppButton title="Executar agora" compact disabled={busy || searchBusy} onPress={() => act(async () => { const result = await runScheduleNow(item.id); await onRun(item, result); onClose(); })}/>
          <AppButton title="Ativar / desativar" variant="secondary" compact disabled={busy} onPress={() => act(async () => { await toggleSchedule(item.id); await refresh(); })}/>
          <AppButton title="Excluir" variant="ghost" compact disabled={busy} onPress={() => remove(item)}/>
        </View>
      </View>)}
    </>}
  </ModalShell>;
}

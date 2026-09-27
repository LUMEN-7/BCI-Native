import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import { Action, Feedback, Tabs, s } from '../../components/MobileUI';
import { deleteNotification, listNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/notificationService';
import { pick } from '../../utils/vehicleAdapters';
import { activityDate } from '../HomeScreen/homeData';
import useRemoteResource from '../../hooks/useRemoteResource';
export const adaptAlert = a => ({
  id: pick(a, 'id'),
  read: pick(a, 'lido', 'lida', 'read'),
  title: pick(a, 'titulo') || 'Atualização',
  body: pick(a, 'mensagem') || '',
  type: pick(a, 'tipo') || 'Atualização',
  date: pick(a, 'dataCriacao'),
  lineage: pick(a, 'linhagemIdReferenciado')
});
const loader = async () => {
  const rows = await listNotifications();
  return (Array.isArray(rows) ? rows : []).filter(a => pick(a, 'excluido') !== true).map(adaptAlert);
};
export default function AlertsScreen({
  navigation
}) {
  const r = useRemoteResource(loader),
    [filter, setFilter] = useState('all'),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const alerts = r.data || [],
    unread = alerts.filter(a => a.read === false),
    filtered = filter === 'unread' ? unread : alerts;
  async function mutate(operation, update) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await operation();
      r.setData(update);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function open(a) {
    if (a.read === false) mutate(() => markNotificationRead(a.id), rows => rows.map(x => x.id === a.id ? {
      ...x,
      read: true
    } : x));
    if (a.lineage) navigation.navigate('VehicleDetail', {
      lineageId: a.lineage
    });
  }
  return <Screen onRefresh={r.reload} refreshing={r.loading}><PageHeader eyebrow="Monitoramento contínuo" title="ALERTAS" description="Acompanhe atualizações e mudanças relevantes para suas análises." /><View style={[s.panel, s.row]}><Ionicons name="notifications-outline" size={27} color="#0562D2" /><View style={s.grow}><Text style={s.eyebrow}>RESUMO</Text><Text style={s.strong}>{r.loading ? 'Carregando alertas' : r.error && !r.data ? 'Alertas indisponíveis' : unread.length + ' alertas não lidos'}</Text></View></View><Tabs value={filter} onChange={setFilter} items={[{
      id: 'all',
      label: 'Todos',
      count: alerts.length
    }, {
      id: 'unread',
      label: 'Não lidos',
      count: unread.length
    }]} /><Action secondary title="Marcar todos como lidos" icon="checkmark-done-outline" disabled={!unread.length || busy} onPress={() => mutate(markAllNotificationsRead, rows => rows.map(a => ({
      ...a,
      read: true
    })))} /><Feedback error={r.error || error} retry={r.reload} />
    {r.loading ? <LoadingState /> : filtered.length ? filtered.map(a => <View key={a.id} style={[s.panel, a.read === false && {
      backgroundColor: '#F0F6FF',
      borderColor: '#C9DDF7'
    }]}><Pressable accessibilityRole="button" onPress={() => open(a)} style={{
        gap: 10
      }}><View style={s.row}><Text style={[s.eyebrow, s.grow]}>{a.type}</Text>{a.read === false && <View style={{
            width: 8,
            height: 8,
            borderRadius: 8,
            backgroundColor: '#0562D2'
          }} />}</View><Text style={s.strong}>{a.title}</Text><Text style={s.body}>{a.body}</Text></Pressable><View style={s.row}><Text style={[s.meta, s.grow]}>{activityDate(a.date)}</Text><Action secondary compact danger title="Excluir" disabled={busy} onPress={() => mutate(() => deleteNotification(a.id), rows => rows.filter(x => x.id !== a.id))} /></View></View>) : !r.error && <EmptyState title="Tudo em dia" description="Nenhum alerta neste filtro." icon="notifications-outline" />}
  </Screen>;
}

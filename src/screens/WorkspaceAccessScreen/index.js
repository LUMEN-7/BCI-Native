import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import { Action, Feedback, Heading, Tabs, s } from '../../components/MobileUI';
import Sheet from '../../components/MobileUI/Sheet';
import { createTeam, joinTeam, listTeams } from '../../services/teamService';
import useRemoteResource from '../../hooks/useRemoteResource';
export default function WorkspaceAccessScreen({
  navigation
}) {
  const r = useRemoteResource(listTeams),
    [mode, setMode] = useState(null),
    [view, setView] = useState('mine'),
    [name, setName] = useState(''),
    [description, setDescription] = useState(''),
    [code, setCode] = useState(''),
    [q, setQ] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  function open(team) {
    setMode(null);
    navigation.navigate('Workspace', {
      team
    });
  }
  async function submit() {
    if (mode === 'create' && name.trim().length < 3) return setError('Digite um nome com pelo menos 3 caracteres.');
    if (mode === 'join' && !code.trim()) return setError('Digite o código de convite.');
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const team = mode === 'create' ? await createTeam(name.trim(), description.trim() || null) : await joinTeam(code.trim().toUpperCase());
      r.setData(v => [team, ...(v || []).filter(t => t.id !== team.id)]);
      open(team);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const teams = (r.data || []).filter(t => [t.name, t.description].join(' ').toLowerCase().includes(q.trim().toLowerCase()));
  return <Screen onRefresh={r.reload} refreshing={r.loading}><PageHeader eyebrow="Colaboração e inteligência" title="WORKSPACE" description="Conecte sua equipe. Transforme análises em decisões compartilhadas." /><Feedback error={r.error} retry={r.reload} />
    {[['create', 'add-outline', 'CRIAR WORKSPACE', 'Um novo espaço para sua equipe compartilhar análises e decisões.'], ['join', 'people-outline', 'ENTRAR NO WORKSPACE', 'Acesse seus espaços ou participe com um código de convite.']].map(([id, icon, title, body]) => <Pressable accessibilityRole="button" key={id} style={[s.panel, {
      padding: 26,
      minHeight: 230
    }, id === 'create' && {
      backgroundColor: '#00142E'
    }]} onPress={() => {
      setError('');
      setMode(id);
      setView(r.data?.length ? 'mine' : 'code');
    }}><Ionicons name={icon} size={32} color={id === 'create' ? '#fff' : '#0562D2'} /><Text style={[s.title, id === 'create' && s.white]}>{title}</Text><Text style={[s.body, id === 'create' && {
        color: '#C7D3E2'
      }]}>{body}</Text><Ionicons name="arrow-forward-outline" size={23} color={id === 'create' ? '#fff' : '#00142E'} /></Pressable>)}
    <Heading title="SEUS WORKSPACES" />{r.loading ? <LoadingState /> : r.data?.length ? r.data.map(t => <Action key={t.id} secondary title={t.name} icon="people-outline" onPress={() => open(t)} />) : !r.error && <EmptyState title="Nenhum workspace" description="Crie um espaço ou entre com um convite." />}
    {mode && <Sheet title={mode === 'create' ? 'Criar workspace' : 'Entrar no workspace'} busy={busy} onClose={() => setMode(null)}>{mode === 'create' ? <><FormField label="Nome do workspace" value={name} onChangeText={setName} maxLength={100} /><FormField label="Descrição" value={description} onChangeText={setDescription} multiline /><Feedback error={error} /><Action title="Criar workspace" loading={busy} onPress={submit} /></> : <><Tabs value={view} onChange={setView} items={[{
          id: 'mine',
          label: 'Meus workspaces'
        }, {
          id: 'code',
          label: 'Código de convite'
        }]} />{view === 'mine' ? <><FormField label="Buscar workspace" value={q} onChangeText={setQ} />{teams.map(t => <View style={s.panel} key={t.id}><Text style={s.strong}>{t.name}</Text><Text style={s.body}>{t.description}</Text><Text style={s.meta}>{t.members ?? '—'} membros</Text><Action title="Abrir workspace" onPress={() => open(t)} /></View>)}{!teams.length && <EmptyState title="Nenhum workspace encontrado" />}</> : <><FormField label="Código de convite" value={code} onChangeText={v => setCode(v.toUpperCase())} autoCapitalize="characters" /><Feedback error={error} /><Action title="Entrar com código" loading={busy} onPress={submit} /></>}</>}</Sheet>}
  </Screen>;
}

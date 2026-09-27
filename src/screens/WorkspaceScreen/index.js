import { useCallback, useState } from 'react';
import { Alert, Share, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import { Action, Back, Feedback, Heading, Tabs, s } from '../../components/MobileUI';
import Sheet from '../../components/MobileUI/Sheet';
import { createPost, deletePost, listPosts, toggleLike, togglePin, commentPost, updatePostStatus, listActivities, POST_TYPES, STATUSES } from '../../services/workspaceService';
import { listMembers, getTeam } from '../../services/teamService';
import { getSavedComparisons } from '../../services/userService';
import { pick } from '../../utils/vehicleAdapters';
import { savedComparisonCars } from '../../utils/comparison';
import { activityDate } from '../HomeScreen/homeData';
import { useAuth } from '../../context/AuthContext';
import useRemoteResource from '../../hooks/useRemoteResource';
import PostCard from './components/PostCard';
import PostComposer from './components/PostComposer';
export default function WorkspaceScreen({
  route,
  navigation
}) {
  const team = route.params?.team,
    {
      user
    } = useAuth(),
    userId = pick(user, 'id', 'userId');
  const loader = useCallback(async () => {
    if (!team?.id) throw new Error('Selecione um workspace para continuar.');
    const [posts, members, activities, info] = await Promise.allSettled([listPosts(team.id), listMembers(team.id), listActivities(team.id), getTeam(team.id)]);
    if (posts.status === 'rejected') throw posts.reason;
    return {
      posts: posts.value,
      members: members.status === 'fulfilled' ? members.value : [],
      activities: activities.status === 'fulfilled' ? activities.value : [],
      team: info.status === 'fulfilled' ? info.value : team,
      partial: [members, activities, info].some(r => r.status === 'rejected')
    };
  }, [team?.id]);
  const r = useRemoteResource(loader),
    [tab, setTab] = useState('feed'),
    [type, setType] = useState('all'),
    [q, setQ] = useState(''),
    [mine, setMine] = useState('assigned'),
    [composer, setComposer] = useState(false),
    [thread, setThread] = useState(null),
    [comment, setComment] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [invite, setInvite] = useState(false);
  const posts = r.data?.posts || [],
    selected = posts.find(p => p.id === thread);
  const canManage = p => r.data?.team.role === 'owner' || userId != null && String(p.authorId) === String(userId);
  const filtered = posts.filter(p => (tab !== 'mine' || (mine === 'assigned' ? String(p.responsibleId) === String(userId) : String(p.authorId) === String(userId))) && (type === 'all' || p.type === type) && [p.author, p.content, p.responsible, p.linkedTitle, ...p.tags].join(' ').toLowerCase().includes(q.trim().toLowerCase())).sort((a, b) => Number(b.pinned) - Number(a.pinned));
  async function mutate(operation, update) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const value = await operation();
      if (update) r.setData(d => d ? {
        ...d,
        posts: update(d.posts, value)
      } : d);else r.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function remove(p) {
    Alert.alert('Excluir publicação?', 'A publicação será removida do workspace.', [{
      text: 'Cancelar',
      style: 'cancel'
    }, {
      text: 'Excluir',
      style: 'destructive',
      onPress: () => mutate(() => deletePost(p.id), rows => rows.filter(x => x.id !== p.id))
    }]);
  }
  async function linked(p) {
    try {
      if (p.linkedType === 'vehicle') navigation.navigate('VehicleDetail', {
        lineageId: p.linkedId
      });else if (p.linkedType === 'research') navigation.navigate('Main', {
        screen: 'Search'
      });else {
        const list = await getSavedComparisons(),
          item = list.find(c => String(pick(c, 'id')) === String(p.linkedId));
        if (!item) throw new Error('A comparação vinculada não está disponível para sua conta.');
        navigation.navigate('CompareResult', {
          cars: savedComparisonCars(item)
        });
      }
    } catch (e) {
      setError(e.message);
    }
  }
  return <Screen onRefresh={r.reload} refreshing={r.loading}><PageHeader eyebrow="Inteligência em equipe" title={team?.name || 'WORKSPACE'} description={team?.description || 'Compartilhe análises, discuta dados e acompanhe decisões.'} /><Back navigation={navigation} /><View style={s.wrap}><Action title="Nova publicação" icon="add-outline" disabled={!r.data} onPress={() => setComposer(true)} /><Action secondary title="Membros e convite" icon="people-outline" disabled={!r.data} onPress={() => setInvite(true)} /></View><Tabs value={tab} onChange={setTab} items={[{
      id: 'feed',
      label: 'Feed'
    }, {
      id: 'mine',
      label: 'Minhas atividades'
    }, {
      id: 'activity',
      label: 'Atividade recente'
    }]} /><Feedback error={r.error || error} retry={r.reload} />{r.data?.partial && <Text style={s.meta}>Parte dos membros ou atividades não pôde ser atualizada. Puxe para tentar novamente.</Text>}
    {r.loading ? <LoadingState /> : tab === 'activity' ? <><Heading title="ATIVIDADE RECENTE" />{r.data?.activities.map(a => <View key={pick(a, 'id')} style={s.panel}><Text style={s.strong}>{pick(a, 'atorNome')}</Text><Text style={s.body}>{{
            PostCriado: 'Criou uma publicação',
            Atribuicao: 'Atribuiu uma atividade',
            StatusAlterado: 'Alterou o status',
            Comentario: 'Adicionou um comentário',
            PostFixado: 'Fixou uma publicação',
            PostDesafixado: 'Desafixou uma publicação'
          }[pick(a, 'tipo')] || 'Atualização no workspace'}</Text><Text style={s.body}>{pick(a, 'postConteudoResumo')}</Text><Text style={s.meta}>{activityDate(pick(a, 'dataCriacao'))}</Text>{posts.some(p => p.id === pick(a, 'postId')) && <Action secondary title="Ver discussão" onPress={() => setThread(pick(a, 'postId'))} />}</View>)}{!r.data?.activities.length && <EmptyState title="Nenhuma atividade disponível" />}</> : <>{tab === 'mine' && <Tabs value={mine} onChange={setMine} items={[{
        id: 'assigned',
        label: 'Atribuídas a mim'
      }, {
        id: 'created',
        label: 'Minhas publicações'
      }]} />}<FormField label="Pesquisar no workspace" value={q} onChangeText={setQ} placeholder="Publicações, pessoas ou tags" /><Tabs value={type} onChange={setType} items={[{
        id: 'all',
        label: 'Todos'
      }, ...Object.entries(POST_TYPES).map(([id, label]) => ({
        id,
        label
      }))]} />{filtered.map(p => <PostCard key={p.id} post={p} busy={busy} canManage={canManage(p)} onLike={() => mutate(() => toggleLike(p.id), (rows, res) => rows.map(x => x.id === p.id ? {
        ...x,
        liked: !x.liked,
        likes: pick(res, 'totalCurtidas') ?? Math.max(0, x.likes + (x.liked ? -1 : 1))
      } : x))} onPin={() => mutate(() => togglePin(p.id), rows => rows.map(x => x.id === p.id ? {
        ...x,
        pinned: !x.pinned
      } : x))} onDelete={() => remove(p)} onThread={() => {
        setComment('');
        setThread(p.id);
      }} onLinked={() => linked(p)} />)}{!filtered.length && !r.error && <EmptyState title="Nenhuma publicação encontrada" description="Publique uma análise ou altere os filtros." />}</>}
    {composer && <PostComposer members={r.data?.members || []} onClose={() => setComposer(false)} onSave={async form => {
      const post = await createPost(team.id, form);
      r.setData(d => d ? {
        ...d,
        posts: [post, ...d.posts]
      } : d);
    }} />}
    {selected && <Sheet title="Discussão" busy={busy} onClose={() => setThread(null)}><Text style={s.strong}>{selected.author}</Text><Text style={s.body}>{selected.content}</Text>{selected.status && (canManage(selected) || String(selected.responsibleId) === String(userId)) && <Tabs value={selected.status} items={Object.entries(STATUSES).map(([id, label]) => ({
        id,
        label
      }))} onChange={status => mutate(() => updatePostStatus(selected.id, status), rows => rows.map(p => p.id === selected.id ? {
        ...p,
        status
      } : p))} />}<Heading title="COMENTÁRIOS" />{selected.comments.map(c => <View key={c.id} style={{
        gap: 5,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#E4E9EF'
      }}><Text style={s.strong}>{c.author}</Text><Text style={s.body}>{c.content}</Text><Text style={s.meta}>{activityDate(c.date)}</Text></View>)}<FormField label="Seu comentário" value={comment} onChangeText={setComment} multiline /><Feedback error={error} /><Action title="Comentar" loading={busy} disabled={!comment.trim()} onPress={() => mutate(() => commentPost(selected.id, comment.trim()), (rows, c) => {
        setComment('');
        return rows.map(p => p.id === selected.id ? {
          ...p,
          comments: [...p.comments, c]
        } : p);
      })} /></Sheet>}
    {invite && <Sheet title="Sua equipe" onClose={() => setInvite(false)}>{r.data?.members.map(m => <View key={m.id} style={s.row}><Text style={[s.strong, s.grow]}>{m.name}</Text><Text style={s.meta}>{m.role === 'owner' ? 'Administrador' : 'Membro'}</Text></View>)}{r.data?.team.inviteCode && <><Heading title="CONVIDAR PESSOAS" /><Text selectable style={s.title}>{r.data.team.inviteCode}</Text><Action title="Compartilhar código" icon="share-outline" onPress={() => Share.share({
          message: 'Entre no workspace ' + r.data.team.name + ' no BCI. Código: ' + r.data.team.inviteCode
        }).catch(e => setError(e.message))} /></>}</Sheet>}
  </Screen>;
}

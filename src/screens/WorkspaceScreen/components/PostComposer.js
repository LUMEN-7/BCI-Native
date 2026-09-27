import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import Sheet from '../../../components/MobileUI/Sheet';
import { Action, Feedback, Tabs, s } from '../../../components/MobileUI';
import FormField from '../../../components/FormField';
import { POST_TYPES, STATUSES, LINK_TYPES } from '../../../services/workspaceService';
import { getFavorites, getSavedComparisons } from '../../../services/userService';
import { savedModels } from '../../HomeScreen/homeData';
import { pick } from '../../../utils/vehicleAdapters';
const options = map => Object.entries(map).map(([id, label]) => ({
  id,
  label
}));
export default function PostComposer({
  members,
  onClose,
  onSave
}) {
  const [form, setForm] = useState({
      type: 'update',
      content: '',
      tags: '',
      responsibleId: '',
      status: 'pending',
      linkedType: '',
      linkedId: '',
      linkedTitle: ''
    }),
    [linked, setLinked] = useState([]),
    [loading, setLoading] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const set = (key, value) => setForm(v => ({
    ...v,
    [key]: value
  }));
  useEffect(() => {
    let active = true;
    setLinked([]);
    if (!form.linkedType || form.linkedType === 'research') return;
    setLoading(true);
    setError('');
    (form.linkedType === 'vehicle' ? getFavorites().then(r => savedModels(r).map(c => ({
      id: String(c.id),
      label: c.name
    }))) : getSavedComparisons().then(r => r.map(c => ({
      id: String(pick(c, 'id')),
      label: pick(c, 'titulo') || 'Comparação'
    })))).then(r => {
      if (active) setLinked(r);
    }).catch(e => {
      if (active) setError(e.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [form.linkedType]);
  async function submit() {
    if (!form.content.trim()) return setError('Escreva o conteúdo da publicação.');
    if (form.linkedType && form.linkedType !== 'research' && !form.linkedId) return setError('Selecione o conteúdo vinculado.');
    if (form.linkedType === 'research' && !form.linkedTitle.trim()) return setError('Informe o título da pesquisa.');
    setBusy(true);
    setError('');
    try {
      await onSave({
        ...form,
        content: form.content.trim(),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return <Sheet title="Nova publicação" busy={busy} onClose={onClose}><Tabs items={options(POST_TYPES)} value={form.type} onChange={v => set('type', v)} /><FormField label="Conteúdo" value={form.content} onChangeText={v => set('content', v)} multiline style={{
      minHeight: 130
    }} /><FormField label="Tags separadas por vírgula" value={form.tags} onChangeText={v => set('tags', v)} />
    {['review', 'decision'].includes(form.type) && <><Text style={s.eyebrow}>RESPONSÁVEL</Text><Tabs items={[{
        id: '',
        label: 'Sem responsável'
      }, ...members.map(m => ({
        id: String(m.id),
        label: m.name
      }))]} value={form.responsibleId} onChange={v => set('responsibleId', v)} /><Text style={s.eyebrow}>STATUS</Text><Tabs items={options(STATUSES)} value={form.status} onChange={v => set('status', v)} /></>}
    <Text style={s.eyebrow}>VINCULAR CONTEÚDO</Text><Tabs items={[{
      id: '',
      label: 'Nenhum'
    }, ...options(LINK_TYPES)]} value={form.linkedType} onChange={v => setForm(f => ({
      ...f,
      linkedType: v,
      linkedId: '',
      linkedTitle: ''
    }))} />
    {form.linkedType === 'research' ? <FormField label="Título da pesquisa" value={form.linkedTitle} onChangeText={v => set('linkedTitle', v)} /> : form.linkedType ? <><Text style={s.meta}>{loading ? 'Carregando conteúdos...' : !linked.length ? 'Nenhum conteúdo salvo disponível.' : 'Escolha um conteúdo salvo'}</Text><Tabs items={linked} value={form.linkedId} onChange={v => setForm(f => ({
        ...f,
        linkedId: v,
        linkedTitle: linked.find(x => x.id === v)?.label || ''
      }))} /></> : null}
    <Feedback error={error} /><Action title="Publicar" loading={busy} disabled={loading} onPress={submit} />
  </Sheet>;
}

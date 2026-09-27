import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import { Action, Feedback, s } from '../../components/MobileUI';
import NoteContent from './NoteContent';
import Sheet from '../../components/MobileUI/Sheet';
import { deleteNote, listNotes, subscribeNotes, saveNote } from '../../services/noteService';
import useRemoteResource from '../../hooks/useRemoteResource';
import { activityDate } from '../HomeScreen/homeData';
import { getSavedComparisons } from '../../services/userService';
import { savedComparisonCars } from '../../utils/comparison';
import { pick } from '../../utils/vehicleAdapters';
export default function NotesScreen({
  navigation
}) {
  const r = useRemoteResource(listNotes),
    [q, setQ] = useState(''),
    [selected, setSelected] = useState(null),
    [previewImage, setPreviewImage] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  useEffect(() => subscribeNotes(r.reload), []);
  const notes = (r.data || []).filter(n => [n.title, n.content, n.tag].join(' ').toLowerCase().includes(q.trim().toLowerCase()));
  async function remove(note) {
    setBusy(true);
    try {
      await deleteNote(note.id);
      setSelected(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function openComparison(id) {
    try {
      const items = await getSavedComparisons(),
        item = items.find(v => String(pick(v, 'id')) === String(id));
      if (!item) throw new Error('Comparação indisponível para sua conta.');
      setSelected(null);
      navigation.navigate('CompareResult', {
        cars: savedComparisonCars(item)
      });
    } catch (e) {
      setError(e.message);
    }
  }
  function prompt(note) {
    Alert.alert('Excluir anotação?', 'Esta ação remove a nota da sua conta.', [{
      text: 'Cancelar',
      style: 'cancel'
    }, {
      text: 'Excluir',
      style: 'destructive',
      onPress: () => remove(note)
    }]);
  }
  return <Screen onRefresh={r.reload} refreshing={r.loading}><PageHeader eyebrow="Suas ideias, conectadas" title="ANOTAÇÕES" description="Registre insights, organize suas análises e mantenha os modelos por perto." /><Action icon="add-outline" title="Nova anotação" onPress={() => navigation.navigate('NoteEditor')} /><FormField label="Buscar anotações" value={q} onChangeText={setQ} placeholder="Título, conteúdo ou tag" /><Text style={s.meta}>{notes.length} anotações</Text><Feedback error={r.error || error} retry={r.reload} />
    {r.loading ? <LoadingState /> : notes.length ? notes.map(note => <View key={note.id} style={s.panel}><View style={s.row}><Ionicons name="document-text-outline" size={25} color="#0562D2" /><View style={s.grow} /><Action secondary compact danger title="Excluir" disabled={busy} onPress={() => prompt(note)} /></View><Pressable accessibilityRole="button" onPress={() => setSelected(note)} style={{
        gap: 12
      }}><View style={s.row}><Text style={[s.eyebrow, s.grow]}>{note.tag || 'Anotação BCI'}</Text><Text style={s.meta}>{activityDate(note.updatedAt || note.createdAt)}</Text></View><Text style={s.title}>{note.title || 'Sem título'}</Text><Text numberOfLines={3} style={s.body}>{note.content || 'Abra para ver os conteúdos vinculados.'}</Text><Text style={s.meta}>{note.attachedCars.length} veículos vinculados</Text></Pressable></View>) : !r.error && <EmptyState title="Nenhuma anotação encontrada" description={q ? 'Tente buscar por outro termo.' : 'Crie sua primeira BCI Nota.'} />}
    {selected && <Sheet title={selected.title || 'Anotação'} onClose={() => setSelected(null)}><Feedback error={error} /><NoteContent content={selected.content} busy={busy} onError={setError} onImage={setPreviewImage} onCar={id => {
        setSelected(null);
        navigation.navigate('VehicleDetail', {
          lineageId: id
        });
      }} onToggle={async content => {
        setBusy(true);
        try {
          const updated = await saveNote({
            ...selected,
            content
          });
          setSelected(updated);
        } catch (e) {
          setError(e.message);
        } finally {
          setBusy(false);
        }
      }} />{selected.blocks.filter(b => !['Paragrafo', 'CardCarro'].includes(pick(b, 'tipo'))).map((b, i) => {
        const type = pick(b, 'tipo'),
          text = pick(b, 'texto');
        return type === 'CardComparacao' ? <Action key={i} secondary title={pick(pick(b, 'cardComparacao'), 'titulo') || 'Ver comparação'} onPress={() => openComparison(pick(pick(b, 'cardComparacao'), 'comparacaoId', 'id'))} /> : type === 'Imagem' && /^https?:\/\//.test(text || '') ? <Image key={i} source={{
          uri: text
        }} style={{
          width: '100%',
          height: 200
        }} resizeMode="contain" /> : text ? <Text key={i} style={type === 'Titulo' ? s.title : s.body}>{text}</Text> : null;
      })}{selected.attachedCars.map(car => <Action secondary key={car.id} icon="car-outline" title={car.name || 'Ver veículo'} onPress={() => {
        setSelected(null);
        navigation.navigate('VehicleDetail', {
          lineageId: car.id,
          car
        });
      }} />)}<Action title="Editar anotação" icon="pencil-outline" onPress={() => {
        setSelected(null);
        navigation.navigate('NoteEditor', {
          noteId: selected.id
        });
      }} /></Sheet>}{previewImage && <Sheet title="Imagem da anotação" onClose={() => setPreviewImage(null)}><Image source={{
        uri: previewImage
      }} style={{
        width: "100%",
        height: 400
      }} resizeMode="contain" /></Sheet>}
  </Screen>;
}

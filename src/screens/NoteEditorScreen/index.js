import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import PageHeader from '../../components/PageHeader';
import FormField from '../../components/FormField';
import LoadingState from '../../components/LoadingState';
import { Action, Back, Feedback, Heading, s } from '../../components/MobileUI';
import { getNote, saveNote } from '../../services/noteService';
import { getFavorites } from '../../services/userService';
import { savedModels } from '../HomeScreen/homeData';
export default function NoteEditorScreen({
  route,
  navigation
}) {
  const loadedRoute = useRef(route.params?.noteId);
  const [id, setId] = useState(route.params?.noteId),
    [title, setTitle] = useState(''),
    [content, setContent] = useState(''),
    [cars, setCars] = useState([]),
    [attached, setAttached] = useState([]),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [ready, setReady] = useState(false),
    [error, setError] = useState(''),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setReady(false);
    setLoading(true);
    setError('');
    const routeChanged = loadedRoute.current !== route.params?.noteId;
    const noteId = routeChanged ? route.params?.noteId : id;
    loadedRoute.current = route.params?.noteId;
    setId(noteId);
    Promise.allSettled([getFavorites(), noteId ? getNote(noteId) : Promise.resolve(null)]).then(([f, n]) => {
      if (!active) return;
      if (f.status === 'fulfilled') setCars(savedModels(f.value));
      setReady(n.status === 'fulfilled');
      if (n.status === 'fulfilled' && n.value) {
        setTitle(n.value.title);
        setContent(n.value.content);
        setAttached(n.value.attachedCars);
      }
      if (n.status === 'rejected') setError(n.reason.message);else if (f.status === 'rejected') setError('Não foi possível carregar os veículos salvos. Você ainda pode editar a nota.');
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [route.params?.noteId, revision]);
  function toggle(car) {
    setAttached(cur => cur.some(c => String(c.id) === String(car.id)) ? cur.filter(c => String(c.id) !== String(car.id)) : [...cur, car]);
  }
  async function submit() {
    if (!ready) return;
    if (!title.trim()) return setError('Dê um título para a nota.');
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      await saveNote({
        id,
        title: title.trim(),
        content,
        attachedCars: attached
      });
      navigation.goBack();
    } catch (e) {
      if (e.noteId) setId(e.noteId);
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  return <Screen><PageHeader eyebrow="BCI Notas" title={id ? 'EDITAR NOTA' : 'NOVA NOTA'} /><Back navigation={navigation} /><Feedback error={error} retry={() => setRevision(v => v + 1)} />{loading ? <LoadingState /> : <><View style={s.panel}><FormField label="Título" value={title} onChangeText={setTitle} maxLength={200} /><FormField label="Conteúdo" value={content} onChangeText={setContent} multiline textAlignVertical="top" maxLength={5000} style={{
          minHeight: 220,
          paddingTop: 14
        }} /></View><Heading title="VEÍCULOS VINCULADOS" description="Adicione modelos salvos à sua anotação." /><View style={s.wrap}>{[...cars, ...attached.filter(c => !cars.some(v => String(c.id) === String(v.id)))].map(car => {
          const active = attached.some(c => String(c.id) === String(car.id));
          return <Pressable accessibilityRole="checkbox" accessibilityState={{
            checked: active
          }} key={car.id} style={[s.tab, active && s.active]} onPress={() => toggle(car)}><Text style={[s.tabText, active && s.white]}>{car.name || 'Veículo ' + car.id}</Text></Pressable>;
        })}</View><Action title="Salvar anotação" loading={saving} disabled={!ready} onPress={submit} /></>}</Screen>;
}

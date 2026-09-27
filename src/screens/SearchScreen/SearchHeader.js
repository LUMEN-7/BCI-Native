import { Pressable, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SearchAction from '../../components/SearchAction';
import styles from './styles';

export default function SearchHeader({ q, setQ, brand, setBrand, year, setYear, searching, loading, onSearch, onSchedule, onImport, scheduledCount, resultCount, error, notice, onReload }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const filters = [[q, setQ, 'Busca'], [brand, setBrand, 'Marca'], [year, setYear, 'Ano']].filter(([value]) => value);
  return <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
    <View style={styles.intro}>
      <Text style={styles.eyebrow}>PESQUISA DE VEÍCULOS</Text>
      <Text accessibilityRole="header" style={[styles.title, width < 400 && styles.smallTitle]}>BUSCAR</Text>
      <Text style={styles.description}>Pesquise, filtre e explore os veículos disponíveis para construir sua análise competitiva.</Text>
    </View>
    <View style={styles.controls}>
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={22} color="#00142E"/>
        <TextInput accessibilityLabel="Pesquisar modelo, marca ou segmento" style={styles.searchInput} placeholderTextColor="#8993A0" value={q} onChangeText={setQ} placeholder="Pesquisar modelo, marca ou segmento..." returnKeyType="search" onSubmitEditing={onSearch}/>
        {!!q && <Pressable accessibilityRole="button" accessibilityLabel="Limpar pesquisa" onPress={() => setQ('')} style={styles.clearIcon}><Ionicons name="close-circle" size={20} color="#8993A0"/></Pressable>}
      </View>
      <View style={styles.filterRow}>
        {[['Marca', brand, setBrand, 'Digite uma marca', 'car-outline'], ['Ano', year, value => setYear(value.replace(/\D/g, '').slice(0, 4)), 'Digite um ano', 'calendar-outline']].map(([label, value, onChangeText, placeholder, icon]) => <View key={label} style={styles.filterField}>
          <Ionicons name={icon} size={19} color="#0562D2"/>
          <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput accessibilityLabel={label} style={styles.fieldInput} placeholderTextColor="#8993A0" value={value} onChangeText={onChangeText} placeholder={placeholder} keyboardType={label === 'Ano' ? 'number-pad' : 'default'}/></View>
        </View>)}
      </View>
      <SearchAction title={searching ? 'Buscando...' : 'Pesquisar'} icon="search-outline" onPress={onSearch} disabled={loading} loading={searching}/>
      <SearchAction title="Agendar Pesquisa" badge={scheduledCount || undefined} icon="alarm-outline" variant="accent" onPress={onSchedule}/>
      <SearchAction title="Importar" icon="cloud-upload-outline" variant="muted" onPress={onImport}/>
    </View>
    {filters.length > 0 && <View style={styles.chips}>
      <Text style={styles.chipLabel}>FILTROS ATIVOS</Text>
      <View style={styles.wrap}>{filters.map(([value, setter, label]) => <Pressable key={label} accessibilityRole="button" accessibilityLabel={`Remover filtro ${label}: ${value}`} style={styles.chip} onPress={() => setter('')}><Text style={styles.chipText}>{label}: {value}</Text><Ionicons name="close" size={16} color="#74808E"/></Pressable>)}</View>
      <SearchAction title="Limpar filtros" icon="refresh-outline" variant="ghost" compact onPress={() => { setQ(''); setBrand(''); setYear(''); }}/>
    </View>}
    {!!notice && <Text style={styles.notice} accessibilityLiveRegion="polite">{notice}</Text>}
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    {!!error && !searching && <SearchAction title="Atualizar dados" variant="ghost" disabled={loading} onPress={onReload}/>}
    {!loading && <View style={styles.resultsHeader}>
      <View style={styles.field}><Text style={styles.sectionLabel}>{filters.length ? 'RESULTADOS DA PESQUISA' : 'MODELOS DISPONÍVEIS'}</Text><Text style={styles.resultsTitle}>{filters.length ? 'MODELOS ENCONTRADOS' : 'EXPLORE OS MODELOS'}</Text></View>
      <Text style={styles.count}>{resultCount} {resultCount === 1 ? 'MODELO' : 'MODELOS'}</Text>
    </View>}
  </View>;
}

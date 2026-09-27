import { useState } from 'react';
import { Alert, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LoadingState from '../../components/LoadingState';
import Action from '../../components/SearchAction';
import ImportVehicleModal from '../SearchScreen/ImportVehicleModal';
import useVehicleDetail from './useVehicleDetail';
import DetailTopbar from './components/DetailTopbar';
import VehicleHero from './components/VehicleHero';
import MainSpecs from './components/MainSpecs';
import TechnicalSections from './components/TechnicalSections';
import AiAnalysis from './components/AiAnalysis';
import ExportModal from './components/ExportModal';
import styles from './styles';

export default function VehicleDetailScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const detail = useVehicleDetail(route, navigation);
  const insets = useSafeAreaInsets();
  const [editing, setEditing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [openSections, setOpenSections] = useState(['base']);
  const { car } = detail;
  const home = () => navigation.navigate('Main', { screen: 'Home' });
  function confirmDelete() {
    Alert.alert('Excluir ficha importada?', 'A ficha complementar será removida deste usuário neste dispositivo. O veículo continuará no catálogo do servidor e nos favoritos. Esta é a mesma exclusão local da Information web.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir ficha', style: 'destructive', onPress: detail.deleteImported },
    ]);
  }
  return <View style={styles.screen}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingHorizontal: width <= 400 ? 12 : 16, paddingTop: insets.top + 82, paddingBottom: insets.bottom + 110 }]}>
      <View style={styles.container}>
        <DetailTopbar onBack={() => navigation.canGoBack() ? navigation.goBack() : home()} onHome={home}
          onFavorite={detail.toggleFavorite} favorite={detail.favorite} saving={detail.saving} favoritesReady={detail.favoritesReady}
          onExport={() => setExporting(true)} onEdit={() => setEditing(true)} onDelete={confirmDelete}
          isImported={car?.isImported} ready={!!car} deleting={detail.deleting}/>
        {detail.loading ? <LoadingState label="Carregando ficha técnica..."/> : detail.notFound || detail.error ? <View style={styles.empty}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>{detail.notFound ? 'VEÍCULO NÃO ENCONTRADO' : 'FICHA INDISPONÍVEL'}</Text>
          <Text style={styles.body}>{detail.error || 'Não encontramos uma ficha ativa para este veículo.'}</Text>
          <Action title="Tentar novamente" onPress={detail.reload}/>
        </View> : car && <>
          {!!detail.actionError && <View style={styles.feedback}><Text accessibilityRole="alert" style={styles.error}>{detail.actionError}</Text>{!detail.favoritesReady && <Action title="Recarregar favoritos" variant="secondary" onPress={detail.reload}/>}</View>}
          <VehicleHero car={car} onCompare={() => navigation.navigate('Main', { screen: 'Compare', params: { firstCar: { id: car.id, name: car.name, brand: car.brand, image: car.image, engine: car.specs.engine.value, power: car.specs.power.value, type: car.specs.type.value, raw: car.raw }, selectionKey: Date.now() } })}/>
          <MainSpecs car={car} showSources={showSources}/>
          <TechnicalSections car={car} openSections={openSections} onToggle={key => setOpenSections(current => current.includes(key) ? current.filter(item => item !== key) : [...current, key])}
            showSources={showSources} onSources={setShowSources} enriching={detail.enriching} enrichmentError={detail.enrichmentError} onRetry={detail.enrichMissing}/>
          <AiAnalysis analysis={detail.analysis} loading={detail.analysisLoading} error={detail.analysisError} isImported={car.isImported} onGenerate={detail.generateAnalysis}/>
        </>}
      </View>
    </ScrollView>
    {!!detail.notice && <View accessibilityLiveRegion="polite" style={[styles.toast, { top: insets.top + 76 }]}><Text style={styles.toastText}>{detail.notice}</Text></View>}
    {editing && detail.imported && <ImportVehicleModal initialVehicle={detail.imported} onClose={() => setEditing(false)} onSaved={detail.saveImported}/>}
    {exporting && car && <ExportModal lineageId={car.id} onClose={() => setExporting(false)}/>}
  </View>;
}

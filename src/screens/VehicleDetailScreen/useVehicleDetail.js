import { useEffect, useRef, useState } from 'react';
import { getCar } from '../../services/carsService';
import { addFavorite, getFavoriteIds, getFavorites, removeFavorite } from '../../services/userService';
import { getImportedVehicles, rememberImportedVehicle, removeImportedVehicle } from '../../services/importedVehiclesStorage';
import { analyzeVehicle, enrichVehicle } from '../../services/aiService';
import { adaptCarCard, adaptCarDetail, applyEnrichment, importedEditRecord, isMissing } from '../../utils/vehicleAdapters';
import { useAuth } from '../../context/AuthContext';

export default function useVehicleDetail(route, navigation) {
  const { user } = useAuth();
  const id = String(route.params?.lineageId ?? route.params?.car?.id ?? '');
  const [car, setCar] = useState(null);
  const [imported, setImported] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [revision, setRevision] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [favoritesReady, setFavoritesReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [enriching, setEnriching] = useState(false);
  const [enrichmentError, setEnrichmentError] = useState('');
  const epoch = useRef(0);
  const favoriteLock = useRef(false);
  const analysisLock = useRef(false);
  const enrichmentLock = useRef(false);
  const deleteLock = useRef(false);

  async function generateAnalysis(vehicle = car, request = epoch.current) {
    if (!vehicle || analysisLock.current) return;
    analysisLock.current = true; setAnalysisLoading(true); setAnalysisError('');
    try {
      const result = await analyzeVehicle({ nome: vehicle.name, marca: vehicle.brand, ano: vehicle.year, dados: vehicle });
      if (request !== epoch.current) return;
      setAnalysis(result);
      if (result.description) setCar(current => current && isMissing(current.description) ? { ...current, description: result.description, descriptionOrigin: 'ai', descriptionEvidence: { value: result.description, confidence: 0, source: null, conflict: false, alternatives: [], origin: 'ai' } } : current);
    } catch (e) { if (request === epoch.current) setAnalysisError(e.message); }
    finally { if (request === epoch.current) { analysisLock.current = false; setAnalysisLoading(false); } }
  }

  async function enrichMissing(vehicle = car, request = epoch.current) {
    if (!vehicle || vehicle.isImported || enrichmentLock.current) return;
    const missingFields = Object.keys(vehicle.specs).filter(key => !['model', 'brand', 'year'].includes(key) && isMissing(vehicle.specs[key]));
    if (!missingFields.length && Object.values(vehicle.sections).every(items => items.length)) return;
    enrichmentLock.current = true; setEnriching(true); setEnrichmentError('');
    try {
      const result = await enrichVehicle(vehicle, missingFields);
      if (request === epoch.current) setCar(current => current ? applyEnrichment(current, result, missingFields) : current);
    } catch (e) { if (request === epoch.current) setEnrichmentError(e.message); }
    finally { if (request === epoch.current) { enrichmentLock.current = false; setEnriching(false); } }
  }

  useEffect(() => {
    const request = ++epoch.current;
    favoriteLock.current = false; analysisLock.current = false; enrichmentLock.current = false; deleteLock.current = false;
    const initialDto = route.params?.car?.raw ?? route.params?.car;
    const initialCar = initialDto ? adaptCarDetail(initialDto) : null;
    setCar(initialCar); setImported(null); setLoading(true); setError(''); setNotFound(false);
    setAnalysis(null); setAnalysisLoading(false); setAnalysisError(''); setEnriching(false); setEnrichmentError('');
    setFavoritesReady(false); setActionError(''); setNotice(''); setSaving(false); setDeleting(false);
    async function load() {
      try {
        if (!id) { setNotFound(true); return; }
        const dto = await getCar(id);
        if (request !== epoch.current) return;
        const apiDetail = adaptCarDetail(dto);
        if (!apiDetail) { setNotFound(true); setCar(null); return; }
        setCar(apiDetail);
        setLoading(false);
        const records = await getImportedVehicles(user).catch(() => []);
        if (request !== epoch.current) return;
        const record = records.find(item => String(item.id) === id) || null;
        const detail = adaptCarDetail(dto, record);
        if (!detail) { setNotFound(true); return; }
        setCar(detail); setImported(record ? importedEditRecord(detail, record) : null); setLoading(false);
        if (!record) { enrichMissing(detail, request); generateAnalysis(detail, request); }
        try {
          const favorites = await getFavorites();
          if (request === epoch.current) { setFavorite(getFavoriteIds(favorites).includes(id)); setFavoritesReady(true); }
        } catch (e) { if (request === epoch.current) setActionError(`Não foi possível carregar os favoritos. ${e.message}`); }
      } catch (e) {
        if (request !== epoch.current) return;
        if (e.status === 404 && !initialCar) setNotFound(true);
        else setError(e.message || 'Não foi possível carregar a ficha.');
      } finally { if (request === epoch.current) setLoading(false); }
    }
    load();
    return () => { ++epoch.current; };
  }, [id, user, revision]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  async function toggleFavorite() {
    if (!car || !favoritesReady || favoriteLock.current) return;
    const request = epoch.current;
    favoriteLock.current = true; setSaving(true); setActionError('');
    try {
      if (favorite) await removeFavorite(id); else await addFavorite(id);
      if (request !== epoch.current) return;
      setFavorite(!favorite);
      if (!favorite) setNotice('Pesquisa salva com sucesso.');
    } catch (e) { if (request === epoch.current) setActionError(e.message); }
    finally { if (request === epoch.current) { favoriteLock.current = false; setSaving(false); } }
  }
  async function saveImported(result, form, previousId) {
    const updated = { ...adaptCarCard(result.carro), isImported: true, importForm: form };
    await rememberImportedVehicle(user, updated, previousId);
    navigation.setParams({ lineageId: updated.id, car: updated });
    if (updated.id === id) setRevision(value => value + 1);
  }
  async function deleteImported() {
    if (!imported || deleteLock.current) return;
    deleteLock.current = true; setDeleting(true); setActionError('');
    try {
      await removeImportedVehicle(user, id);
      navigation.navigate('Main', { screen: 'Search' });
    } catch (e) { setActionError(e.message || 'Não foi possível excluir a ficha importada.'); }
    finally { deleteLock.current = false; setDeleting(false); }
  }
  return {
    car, imported, loading, error, notFound, favorite, favoritesReady, saving, deleting,
    notice, actionError, analysis, analysisLoading, analysisError, enriching, enrichmentError,
    reload: () => setRevision(value => value + 1), toggleFavorite, saveImported, deleteImported,
    generateAnalysis: () => generateAnalysis(), enrichMissing: () => enrichMissing(),
  };
}

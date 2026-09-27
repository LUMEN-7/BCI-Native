import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { monitoredCount, savedComparisonsCount, comparisonsWeekCount, getFavorites, getSavedComparisons } from '../../services/userService';
import { activeNotificationsCount, listNotifications } from '../../services/notificationService';
import { formatMetric, METRIC_LABELS, savedModels, unreadNotifications, recentComparisons } from './homeData';

export default function useHomeDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(METRIC_LABELS.map(label => ({ label, value: '--' })));
  const [cars, setCars] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [activity, setActivity] = useState(null);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true); setErrors([]); setCars(null); setAlerts(null); setActivity(null);
    setMetrics(METRIC_LABELS.map(label => ({ label, value: '--' })));
    const operations = [monitoredCount, savedComparisonsCount, comparisonsWeekCount, activeNotificationsCount, getFavorites, listNotifications, getSavedComparisons];
    Promise.allSettled(operations.map(operation => Promise.resolve().then(operation))).then(results => {
      if (!active) return;
      setMetrics(METRIC_LABELS.map((label, index) => ({ label, value: results[index].status === 'fulfilled' ? formatMetric(results[index].value) : '--' })));
      if (results[4].status === 'fulfilled') setCars(savedModels(results[4].value));
      if (results[5].status === 'fulfilled') setAlerts(unreadNotifications(results[5].value));
      if (results[6].status === 'fulfilled') setActivity(recentComparisons(results[6].value));
      setErrors(results.filter(result => result.status === 'rejected').map(result => result.reason?.message || 'Dados indisponíveis.'));
      setLoading(false);
    });
    return () => { active = false; };
  }, [user, revision]));
  return { user, metrics, cars, alerts, activity, errors, loading, reload: () => setRevision(value => value + 1) };
}

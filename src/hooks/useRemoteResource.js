import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

// The caller memoizes its loader. Ignore responses after blur or a newer request.
export default function useRemoteResource(loader) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const generation = useRef(0);
  useFocusEffect(useCallback(() => {
    const request = ++generation.current;
    setLoading(true);
    setError('');
    setData(null);
    Promise.resolve().then(loader).then(value => {
      if (request === generation.current) setData(value);
    }).catch(e => {
      if (request === generation.current) setError(e.message || 'Não foi possível carregar.');
    }).finally(() => {
      if (request === generation.current) setLoading(false);
    });
    return () => {
      generation.current++;
    };
  }, [loader, revision]));
  return {
    data,
    setData,
    loading,
    error,
    setError,
    reload: () => setRevision(v => v + 1)
  };
}

// One request at a time. Cleanup ignores late responses and cancels the next poll.
export function watchSearchJob({ jobId, getStatus, onComplete, onFailure, onConnectionError, onConnected, delay = 3000, schedule = setTimeout, unschedule = clearTimeout }) {
  let cancelled = false;
  let timer;
  async function poll() {
    try {
      const result = await getStatus(jobId);
      if (cancelled) return;
      if (result.status === 'done' && result.carro) { onComplete(result.carro); return; }
      if (result.status === 'error') { onFailure(result); return; }
      onConnected?.();
    } catch (error) {
      if (cancelled) return;
      onConnectionError(error);
    }
    if (!cancelled) timer = schedule(poll, delay);
  }
  poll();
  return () => { cancelled = true; unschedule(timer); };
}

import { useState, useEffect, useCallback } from 'react';
import { getQueueSize, onSyncEvent, processQueue } from '../offline';

export function useOfflineSync() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  const refreshCount = useCallback(async () => {
    const count = await getQueueSize();
    setPendingCount(count);
  }, []);

  useEffect(() => {
    getQueueSize().then(setPendingCount);

    const unsubscribe = onSyncEvent(event => {
      switch (event.type) {
        case 'sync:start':
          setIsSyncing(true);
          break;
        case 'sync:end':
          setIsSyncing(false);
          refreshCount();
          break;
        case 'sync:action-completed':
          setLastSyncResult({ success: true, action: event.action });
          refreshCount();
          break;
        case 'sync:action-failed':
          setLastSyncResult({
            success: false,
            action: event.action,
            error: event.error,
          });
          refreshCount();
          break;
      }
    });

    return unsubscribe;
  }, [refreshCount]);

  const triggerSync = useCallback(async () => {
    await processQueue();
  }, []);

  return {
    pendingCount,
    isSyncing,
    lastSyncResult,
    triggerSync,
  };
}

export default useOfflineSync;

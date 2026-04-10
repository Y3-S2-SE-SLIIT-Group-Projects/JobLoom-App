import { useEffect } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useLowDataMode } from '../hooks/useLowDataMode';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { setupAutoSync } from './syncManager';
import OfflineContext from './offlineContext';

export function OfflineProvider({ children }) {
  const network = useNetworkStatus();
  const lowData = useLowDataMode();
  const sync = useOfflineSync();

  useEffect(() => {
    const cleanup = setupAutoSync();
    return cleanup;
  }, []);

  const value = {
    isOnline: network.isOnline,
    wasOffline: network.wasOffline,
    checkConnection: network.checkConnection,
    lowDataMode: lowData.enabled,
    lowDataConfig: lowData,
    toggleLowData: lowData.toggle,
    pendingSyncCount: sync.pendingCount,
    isSyncing: sync.isSyncing,
    lastSyncResult: sync.lastSyncResult,
    triggerSync: sync.triggerSync,
  };

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

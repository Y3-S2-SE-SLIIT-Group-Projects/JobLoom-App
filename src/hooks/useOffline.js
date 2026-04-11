import { useContext } from 'react';
import OfflineContext from '../offline/offlineContext';

export function useOffline() {
  const ctx = useContext(OfflineContext);
  if (!ctx) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return ctx;
}

export default useOffline;

import { useOffline } from '../hooks/useOffline';
import { FaWifi, FaSync } from 'react-icons/fa';

const OfflineBanner = () => {
  const { isOnline, wasOffline, pendingSyncCount, isSyncing } = useOffline();

  if (isOnline && !wasOffline && pendingSyncCount === 0) return null;

  if (!isOnline) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-amber-600 text-white px-4 py-2.5 flex items-center justify-center gap-3 text-sm font-medium shadow-lg">
        <FaWifi className="w-4 h-4 opacity-80" />
        <span>You are offline — viewing cached data</span>
        {pendingSyncCount > 0 && (
          <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
            {pendingSyncCount} pending {pendingSyncCount === 1 ? 'action' : 'actions'}
          </span>
        )}
      </div>
    );
  }

  if (wasOffline) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-emerald-600 text-white px-4 py-2.5 flex items-center justify-center gap-3 text-sm font-medium shadow-lg transition-all duration-500">
        <FaWifi className="w-4 h-4" />
        <span>Back online</span>
        {isSyncing && (
          <span className="flex items-center gap-1.5">
            <FaSync className="w-3 h-3 animate-spin" />
            Syncing...
          </span>
        )}
      </div>
    );
  }

  if (pendingSyncCount > 0 && isSyncing) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-blue-600 text-white px-4 py-2.5 flex items-center justify-center gap-3 text-sm font-medium shadow-lg">
        <FaSync className="w-3.5 h-3.5 animate-spin" />
        <span>
          Syncing {pendingSyncCount} pending {pendingSyncCount === 1 ? 'action' : 'actions'}...
        </span>
      </div>
    );
  }

  return null;
};

export default OfflineBanner;

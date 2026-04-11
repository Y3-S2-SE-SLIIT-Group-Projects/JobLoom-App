import { useOffline } from '../hooks/useOffline';
import { FaSync, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const SyncStatus = () => {
  const { pendingSyncCount, isSyncing, lastSyncResult, triggerSync, isOnline } = useOffline();

  if (pendingSyncCount === 0 && !lastSyncResult) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      {isSyncing ? (
        <span className="flex items-center gap-1.5 text-blue-600">
          <FaSync className="w-3.5 h-3.5 animate-spin" />
          Syncing...
        </span>
      ) : pendingSyncCount > 0 ? (
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-amber-600">
            <FaExclamationCircle className="w-3.5 h-3.5" />
            {pendingSyncCount} pending
          </span>
          {isOnline && (
            <button
              onClick={triggerSync}
              className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-deep-blue transition-colors"
            >
              Sync Now
            </button>
          )}
        </div>
      ) : lastSyncResult?.success ? (
        <span className="flex items-center gap-1.5 text-emerald-600">
          <FaCheckCircle className="w-3.5 h-3.5" />
          Synced
        </span>
      ) : null}
    </div>
  );
};

export default SyncStatus;

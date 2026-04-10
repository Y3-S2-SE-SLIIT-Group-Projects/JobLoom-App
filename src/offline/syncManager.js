import { applicationApi } from '../services/applicationApi';
import { getPendingActions, markInProgress, markCompleted, markFailed } from './syncQueue';

const ACTION_HANDLERS = {
  'application/submit': async payload => {
    const { data } = await applicationApi.apply(payload);
    return data;
  },
};

let isSyncing = false;
let listeners = [];

function notifyListeners(event) {
  listeners.forEach(fn => {
    try {
      fn(event);
    } catch {
      // Listener errors are non-critical
    }
  });
}

export function onSyncEvent(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(fn => fn !== listener);
  };
}

export async function processQueue() {
  if (isSyncing) return;
  if (!navigator.onLine) return;

  isSyncing = true;
  notifyListeners({ type: 'sync:start' });

  try {
    const actions = await getPendingActions();

    for (const action of actions) {
      const handler = ACTION_HANDLERS[action.type];
      if (!handler) {
        await markCompleted(action.id);
        continue;
      }

      await markInProgress(action.id);

      try {
        const result = await handler(action.payload);
        await markCompleted(action.id);
        notifyListeners({
          type: 'sync:action-completed',
          action,
          result,
        });
      } catch (err) {
        await markFailed(action.id, err);
        notifyListeners({
          type: 'sync:action-failed',
          action,
          error: err.message,
        });
      }
    }
  } finally {
    isSyncing = false;
    notifyListeners({ type: 'sync:end' });
  }
}

export function setupAutoSync() {
  const handleOnline = () => {
    setTimeout(() => processQueue(), 1000);
  };

  window.addEventListener('online', handleOnline);
  if (navigator.onLine) {
    processQueue();
  }

  return () => window.removeEventListener('online', handleOnline);
}

import { getDB, STORES } from './db';

const SYNC_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  FAILED: 'failed',
  COMPLETED: 'completed',
};

export async function enqueue(action) {
  const db = await getDB();
  const entry = {
    type: action.type,
    payload: action.payload,
    meta: action.meta || {},
    status: SYNC_STATUS.PENDING,
    retryCount: 0,
    maxRetries: action.maxRetries || 3,
    createdAt: Date.now(),
    lastAttemptAt: null,
    error: null,
  };
  const id = await db.add(STORES.SYNC_QUEUE, entry);
  return { ...entry, id };
}

export async function getPendingActions() {
  const db = await getDB();
  const tx = db.transaction(STORES.SYNC_QUEUE, 'readonly');
  const index = tx.store.index('status');
  const pending = await index.getAll(SYNC_STATUS.PENDING);
  const failed = await index.getAll(SYNC_STATUS.FAILED);

  const retriable = failed.filter(a => a.retryCount < a.maxRetries);
  return [...pending, ...retriable].sort((a, b) => a.createdAt - b.createdAt);
}

export async function markInProgress(id) {
  const db = await getDB();
  const entry = await db.get(STORES.SYNC_QUEUE, id);
  if (!entry) return;

  entry.status = SYNC_STATUS.IN_PROGRESS;
  entry.lastAttemptAt = Date.now();
  await db.put(STORES.SYNC_QUEUE, entry);
}

export async function markCompleted(id) {
  const db = await getDB();
  await db.delete(STORES.SYNC_QUEUE, id);
}

export async function markFailed(id, error) {
  const db = await getDB();
  const entry = await db.get(STORES.SYNC_QUEUE, id);
  if (!entry) return;

  entry.status = SYNC_STATUS.FAILED;
  entry.retryCount += 1;
  entry.error = error?.message || String(error);
  entry.lastAttemptAt = Date.now();
  await db.put(STORES.SYNC_QUEUE, entry);
}

export async function getQueueSize() {
  const actions = await getPendingActions();
  return actions.length;
}

export async function clearQueue() {
  const db = await getDB();
  await db.clear(STORES.SYNC_QUEUE);
}

export { SYNC_STATUS };

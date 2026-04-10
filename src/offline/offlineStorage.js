import { getDB, STORES } from './db';

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function isExpired(cachedAt) {
  return Date.now() - cachedAt > CACHE_TTL_MS;
}

// Job Listings

export async function cacheJobListings(jobs) {
  const db = await getDB();
  const tx = db.transaction(STORES.JOBS, 'readwrite');
  const store = tx.objectStore(STORES.JOBS);

  const now = Date.now();
  await Promise.all(jobs.map(job => store.put({ ...job, cachedAt: now })));

  await tx.done;
}

export async function getCachedJobListings() {
  const db = await getDB();
  const jobs = await db.getAll(STORES.JOBS);

  const valid = jobs.filter(j => !isExpired(j.cachedAt));

  if (valid.length < jobs.length) {
    pruneExpiredRecords(
      STORES.JOBS,
      jobs.filter(j => isExpired(j.cachedAt))
    );
  }

  return valid.map(entry => {
    const { cachedAt: _cachedAt, ...job } = entry;
    return job;
  });
}

// Job Details

export async function cacheJobDetail(job) {
  const db = await getDB();
  await db.put(STORES.JOB_DETAILS, { ...job, cachedAt: Date.now() });
}

export async function getCachedJobDetail(jobId) {
  const db = await getDB();
  const record = await db.get(STORES.JOB_DETAILS, jobId);

  if (!record) return null;
  if (isExpired(record.cachedAt)) {
    await db.delete(STORES.JOB_DETAILS, jobId);
    return null;
  }

  const { cachedAt: _cachedAt, ...job } = record;
  return job;
}

// Metadata (pagination state, last sync time, etc.)

export async function setMeta(key, value) {
  const db = await getDB();
  await db.put(STORES.META, { key, value, updatedAt: Date.now() });
}

export async function getMeta(key) {
  const db = await getDB();
  const record = await db.get(STORES.META, key);
  return record?.value ?? null;
}

// Clear all caches

export async function clearAllCaches() {
  const db = await getDB();
  const tx = db.transaction([STORES.JOBS, STORES.JOB_DETAILS, STORES.META], 'readwrite');
  await Promise.all([
    tx.objectStore(STORES.JOBS).clear(),
    tx.objectStore(STORES.JOB_DETAILS).clear(),
    tx.objectStore(STORES.META).clear(),
    tx.done,
  ]);
}

// Internal helpers

async function pruneExpiredRecords(storeName, expired) {
  try {
    const db = await getDB();
    const tx = db.transaction(storeName, 'readwrite');
    await Promise.all(expired.map(r => tx.store.delete(r._id)));
    await tx.done;
  } catch {
    // Non-critical — silent fail
  }
}

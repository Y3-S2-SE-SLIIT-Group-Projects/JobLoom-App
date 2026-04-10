import { openDB } from 'idb';

const DB_NAME = 'jobloom-offline';
const DB_VERSION = 1;

const STORES = {
  JOBS: 'jobs',
  JOB_DETAILS: 'jobDetails',
  SYNC_QUEUE: 'syncQueue',
  META: 'meta',
};

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORES.JOBS)) {
          const jobStore = db.createObjectStore(STORES.JOBS, { keyPath: '_id' });
          jobStore.createIndex('category', 'category', { unique: false });
          jobStore.createIndex('cachedAt', 'cachedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.JOB_DETAILS)) {
          const detailStore = db.createObjectStore(STORES.JOB_DETAILS, { keyPath: '_id' });
          detailStore.createIndex('cachedAt', 'cachedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, {
            keyPath: 'id',
            autoIncrement: true,
          });
          syncStore.createIndex('status', 'status', { unique: false });
          syncStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORES.META)) {
          db.createObjectStore(STORES.META, { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

export { getDB, STORES };

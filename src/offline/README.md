# Offline Module — Architecture

This module provides offline-first capabilities for JobLoom, designed for users in rural communities with unreliable internet connections.

## Module Map

```
src/offline/
├── db.js               # IndexedDB schema and connection (idb wrapper)
├── offlineStorage.js    # Domain-specific read/write: jobs, job details, metadata
├── syncQueue.js         # Persistent action queue with retry semantics
├── syncManager.js       # Queue processor, event bus, auto-sync on reconnect
├── OfflineProvider.jsx  # React context — single access point for all offline state
├── index.js             # Barrel exports
└── README.md
```

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        React Tree                            │
│                                                              │
│  OfflineProvider (context)                                   │
│  ├── useNetworkStatus  — online/offline events               │
│  ├── useLowDataMode   — toggle + localStorage persistence   │
│  └── useOfflineSync   — pending count, sync state, trigger  │
│                                                              │
│  Components consume via:  useOffline()                       │
│  ├── OfflineBanner    — fixed bottom bar                    │
│  ├── LowDataToggle   — navbar button                       │
│  └── SyncStatus      — pending count + manual sync          │
└──────────────┬───────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│                     Storage Layer                            │
│                                                              │
│  db.js (IndexedDB via idb)                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Database: jobloom-offline  (v1)                       │  │
│  │                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐                   │  │
│  │  │  jobs         │  │  jobDetails  │  ← Cache stores   │  │
│  │  │  key: _id     │  │  key: _id    │                   │  │
│  │  │  idx: category│  │  idx: cached │                   │  │
│  │  │  idx: cachedAt│  │              │                   │  │
│  │  └──────────────┘  └──────────────┘                   │  │
│  │                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐                   │  │
│  │  │  syncQueue    │  │  meta        │  ← System stores  │  │
│  │  │  key: id (AI) │  │  key: key    │                   │  │
│  │  │  idx: status  │  │              │                   │  │
│  │  │  idx: created │  │              │                   │  │
│  │  └──────────────┘  └──────────────┘                   │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Caching (Read Path)

```
User opens job list
        │
        ▼
  fetchJobsThunk
        │
        ├── online ──► fetch(/api/jobs) ──► response
        │                                       │
        │                          cacheJobListings(jobs)
        │                          setMeta('jobs_pagination')
        │                                       │
        │                                       ▼
        │                              IndexedDB updated
        │
        └── offline ──► getCachedJobListings()
                                │
                                ▼
                       Return cached jobs
                       (30-min TTL, expired pruned)
```

The same pattern applies to `fetchJobByIdThunk` using `cacheJobDetail` / `getCachedJobDetail`.

### 2. Background Sync (Write Path)

```
User applies for job while offline
        │
        ▼
  submitApplication thunk
        │
        ├── online ──► POST /api/applications ──► success
        │
        └── offline ──► enqueue({
                           type: 'application/submit',
                           payload: { jobId, coverLetter, ... }
                         })
                              │
                              ▼
                     IndexedDB syncQueue
                     status: 'pending'
                              │
        ┌─────────────────────┘
        │ (later, browser fires 'online' event)
        ▼
  setupAutoSync listener
        │
        ▼
  processQueue()
        │
        ├── for each pending action:
        │     markInProgress(id)
        │     ACTION_HANDLERS[type](payload)
        │     ├── success → markCompleted(id)  (deleted from DB)
        │     └── failure → markFailed(id, err) (retryCount++)
        │
        └── notifyListeners → UI updates
```

### 3. Retry Semantics

| Field           | Description                                         |
| --------------- | --------------------------------------------------- |
| `maxRetries`    | Default 3; configurable per action                  |
| `retryCount`    | Incremented on each failure                         |
| `status`        | `pending` → `in_progress` → `completed` or `failed` |
| `lastAttemptAt` | Timestamp of last execution attempt                 |
| `error`         | Last error message stored for debugging             |

Failed actions with `retryCount < maxRetries` are retried on the next `processQueue()` call. Once retries are exhausted, the action stays in `failed` state for manual inspection.

## Event Bus

`syncManager` exposes a pub/sub system for UI reactivity:

| Event                   | When                                      |
| ----------------------- | ----------------------------------------- |
| `sync:start`            | Queue processing begins                   |
| `sync:end`              | Queue processing finishes                 |
| `sync:action-completed` | Single action succeeded (includes result) |
| `sync:action-failed`    | Single action failed (includes error)     |

Subscribe via `onSyncEvent(listener)` — returns an unsubscribe function.

## OfflineProvider Context Shape

```js
{
  isOnline,           // boolean — current network state
  wasOffline,         // boolean — true for 5s after reconnecting
  checkConnection,    // () => Promise<boolean> — active probe
  lowDataMode,        // boolean — is low data mode enabled
  lowDataConfig,      // { enabled, pageSize, loadImages, toggle }
  toggleLowData,      // () => void
  pendingSyncCount,   // number — queued actions waiting to sync
  isSyncing,          // boolean — sync in progress
  lastSyncResult,     // { success, action, error? } | null
  triggerSync,        // () => Promise<void> — manual sync trigger
}
```

## Service Worker Integration

The offline module works alongside the Workbox service worker (configured in `vite.config.js`):

| Layer          | Strategy     | What it caches                       | TTL          |
| -------------- | ------------ | ------------------------------------ | ------------ |
| Service Worker | NetworkFirst | `GET /api/jobs`, `GET /api/jobs/:id` | 30–60 min    |
| Service Worker | Precache     | JS, CSS, HTML, SVG, fonts            | Build hash   |
| IndexedDB      | Application  | Job listings, job details, metadata  | 30 min       |
| IndexedDB      | Sync Queue   | Offline mutations (applications)     | Until synced |

The two caching layers are complementary: the SW cache provides transparent HTTP-level fallback, while IndexedDB gives the application structured access to cached data for rendering.

## Extending the Sync Queue

To support a new offline action (e.g., saving a review while offline):

1. Add a handler to `ACTION_HANDLERS` in `syncManager.js`:

```js
ACTION_HANDLERS['review/submit'] = async payload => {
  const { data } = await reviewApi.create(payload);
  return data;
};
```

2. In the relevant thunk/slice, call `enqueue()` on network failure:

```js
const queued = await enqueue({
  type: 'review/submit',
  payload: reviewData,
});
```

No other changes are needed — the queue processor, retry logic, and UI reactivity work automatically.

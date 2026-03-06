# Job Seeker Applications – Frontend Implementation Plan

This document outlines the complete implementation plan for the **job seeker** side of the application flow in JobLoom — from browsing jobs, to applying, to tracking and managing submitted applications.

---

## 1. Current State Summary

### What Already Exists (Built)

| Feature                                 | Status | File(s)                                                                                                                                      |
| --------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Public job listing (`/jobs`)            | Done   | `pages/dashboard/Dashboard.jsx`, `JobCard.jsx`                                                                                               |
| Public job details (`/jobs/:id`)        | Done   | `pages/PublicJobDetails.jsx`                                                                                                                 |
| Apply button on job details             | Done   | `PublicJobDetails.jsx` — "Apply Now" for seekers, "Login to Apply" for guests                                                                |
| Apply modal (cover letter + resume URL) | Done   | `components/applications/ApplyModal.jsx`                                                                                                     |
| Apply form hook                         | Done   | `hooks/useApplyForm.js`                                                                                                                      |
| Application API service                 | Done   | `services/applicationApi.js`                                                                                                                 |
| Redux application slice                 | Done   | `store/slices/applicationSlice.js` — includes `loadMyApplications`, `loadApplicationById`, `withdrawApplication`, `submitApplication` thunks |
| Store registration                      | Done   | `store/index.js` — `applications` reducer registered                                                                                         |
| `hasApplied` flag after submission      | Done   | `PublicJobDetails.jsx` — local state flips on `onSuccess`                                                                                    |
| "Already applied" indicator             | Done   | `PublicJobDetails.jsx` — green badge shown when `hasApplied`                                                                                 |
| JobCard links to `/jobs/:id`            | Done   | `JobCard.jsx` — fixed from old `/employer/jobs/:id?public=true`                                                                              |

### What Is Missing (Job Seeker Side)

| Feature                                           | Status                                                                                     |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| My Applications page (`/my-applications`)         | **Not implemented**                                                                        |
| My Applications route in router                   | **Not implemented**                                                                        |
| My Applications link in navbar                    | **Not implemented**                                                                        |
| Application detail view (seeker perspective)      | **Not implemented**                                                                        |
| Withdraw application UI                           | **Not implemented**                                                                        |
| Personal notes UI (seeker's private notes)        | **Not implemented**                                                                        |
| Interview date display (seeker view)              | **Not implemented**                                                                        |
| Status history timeline                           | **Not implemented**                                                                        |
| ApplicationReviewsPanel integration (seeker side) | **Not implemented** — panel exists but only embedded in employer's `ApplicationDetailPage` |
| "Already applied" check on page load              | **Partial** — only set after apply in same session, lost on refresh                        |

### Backend APIs Available (Job Seeker)

| Endpoint                                | Method | Purpose                    | Response Shape                           |
| --------------------------------------- | ------ | -------------------------- | ---------------------------------------- |
| `POST /api/applications`                | POST   | Apply for a job            | `{ application }`                        |
| `GET /api/applications/my-applications` | GET    | List seeker's applications | `{ applications[], pagination }`         |
| `GET /api/applications/:id`             | GET    | Get single application     | `{ application }` (sans `employerNotes`) |
| `PATCH /api/applications/:id/withdraw`  | PATCH  | Withdraw application       | `{ message }`                            |
| `PATCH /api/applications/:id/notes`     | PATCH  | Update personal notes      | `{ application }` (sans `employerNotes`) |

Query params for `my-applications`: `status`, `page`, `limit`, `sort` (default `-createdAt`).

Withdrawable statuses: `pending`, `reviewed`, `shortlisted` only.

---

## 2. End-to-End Flow (Target)

```
[Job Listing /jobs]
       │
       ▼
[Job Details /jobs/:id]
       │
       ├── "Apply Now" → ApplyModal → POST /api/applications
       ├── "Already Applied" badge (persisted check)
       └── Link: "View My Applications"
       │
       ▼
[My Applications /my-applications]
       │
       ├── Filter by status (all, pending, reviewed, shortlisted, accepted, rejected, withdrawn)
       ├── Search by job title
       ├── Pagination
       └── Click application → Application detail
       │
       ▼
[Application Detail /my-applications/:id]
       │
       ├── Job info (title, employer, status)
       ├── Application status badge + status history timeline
       ├── Cover letter & resume link
       ├── Interview date (read-only, set by employer)
       ├── Personal notes (editable by seeker)
       ├── Withdraw button (if status allows)
       └── ApplicationReviewsPanel (when status = accepted)
```

---

## 3. Implementation Plan (Step by Step)

### Phase 1: My Applications Page

#### Step 1.1: Create Route File

**File:** `src/router/routes/seekerRoutes.jsx` (new)

Create a new route slice for job-seeker-specific routes, following the existing pattern (`employerRoutes.jsx`, `userRoutes.jsx`):

```jsx
import { lazy } from 'react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

const MyApplications = lazy(() => import('../../pages/seeker/MyApplications'));
const SeekerApplicationDetail = lazy(() => import('../../pages/seeker/SeekerApplicationDetail'));

const seekerRoutes = [
  {
    path: 'my-applications',
    element: (
      <ProtectedRoute allowedRoles={['job_seeker']}>
        <MyApplications />
      </ProtectedRoute>
    ),
  },
  {
    path: 'my-applications/:id',
    element: (
      <ProtectedRoute allowedRoles={['job_seeker']}>
        <SeekerApplicationDetail />
      </ProtectedRoute>
    ),
  },
];

export default seekerRoutes;
```

#### Step 1.2: Register in `routeConfig.jsx`

Add `seekerRoutes` alongside the existing route spreads:

```jsx
import seekerRoutes from './routes/seekerRoutes';

// Inside children array:
...seekerRoutes,
```

#### Step 1.3: Create `MyApplications` Page

**File:** `src/pages/seeker/MyApplications.jsx` (new)

**Data source:** Dispatch `loadMyApplications({ status, page, limit })` from `applicationSlice`.

**Selectors:** `selectMyApplications`, `selectApplicationPagination`, `selectApplicationLoading('myApplications')`, `selectApplicationError('myApplications')`.

**UI layout:**

```
┌─────────────────────────────────────────────────┐
│  Header: "My Applications"                       │
│  Subtitle: "Track and manage your job applications" │
├─────────────────────────────────────────────────┤
│  [Search by job title]     [Status filter ▼]     │
├─────────────────────────────────────────────────┤
│  Status filter tabs:                             │
│  All (12) | Pending (5) | Reviewed (2) | ...     │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐ │
│  │ [Company Logo]  Job Title           Pending │ │
│  │ Employer Name · Applied Jan 15, 2026        │ │
│  │ Interview: Feb 20, 2026 (if scheduled)      │ │
│  │                              [View Details] │ │
│  └─────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────┐ │
│  │ ...more application cards...                │ │
│  └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│  Pagination: < 1 2 3 ... 5 >                    │
└─────────────────────────────────────────────────┘
```

**Each application card should display:**

- Job title (from `application.jobId.title`)
- Employer name (from `application.employerId.firstName + lastName`)
- Status badge (color-coded: pending=yellow, reviewed=blue, shortlisted=purple, accepted=green, rejected=red, withdrawn=gray)
- Applied date (`application.appliedAt || application.createdAt`)
- Interview date (if `application.interviewDate` is set — show with calendar icon)
- "View Details" link → `/my-applications/:id`

**Empty state:** "You haven't applied to any jobs yet. Browse jobs to get started." with link to `/jobs`.

**Filters:**

- Status tab bar (same pattern as employer's `JobApplicationsList` tabs): `all`, `pending`, `reviewed`, `shortlisted`, `accepted`, `rejected`, `withdrawn`
- Search input for job title (client-side filter on `application.jobId.title`)
- Re-dispatch `loadMyApplications` when filter or page changes

---

### Phase 2: Application Detail Page (Seeker Perspective)

#### Step 2.1: Create `SeekerApplicationDetail` Page

**File:** `src/pages/seeker/SeekerApplicationDetail.jsx` (new)

**Data:** Dispatch `loadApplicationById(id)` from `applicationSlice`. Use `selectCurrentApplication`.

**Note:** The backend strips `employerNotes` for job-seeker requests, so no private employer data leaks.

**UI sections:**

**a) Header**

```
← Back to My Applications
[Job Title]                    [Status Badge: Shortlisted]
Application for [Employer Name]
```

**b) Job Info Card**

- Job title, category, employment type, location
- Link to view the full job posting: "View Job" → `/jobs/:jobId`
- Employer name

**c) Your Application**

- Cover letter (read-only display, if provided)
- Resume link (if `resumeUrl`)
- Applied date

**d) Status Timeline**

Use `application.statusHistory` array to render a visual timeline:

```
● Pending        — Jan 15, 2026
● Reviewed       — Jan 18, 2026
● Shortlisted    — Jan 22, 2026
○ (current status)
```

Each entry: colored dot, status label, date. The current/latest status is highlighted. This gives the seeker visibility into their application progress.

**e) Interview Details (if scheduled)**

If `application.interviewDate` exists:

```
┌──────────────────────────────────┐
│ 📅 Interview Scheduled           │
│ February 20, 2026 at 10:00 AM   │
│ Scheduled by [Employer Name]     │
└──────────────────────────────────┘
```

Read-only — only the employer can schedule/update.

**f) Personal Notes (Editable)**

The seeker can keep private notes about this application.

- Textarea, max 500 chars
- Save button dispatches `applicationApi.updateNotes(id, { notes })`
- Add a thunk `updateApplicationNotes` to `applicationSlice` (currently missing from the slice but the API method exists in `applicationApi.js`)

```
┌──────────────────────────────────┐
│ 📝 My Notes (private)            │
│ [textarea: notes]                │
│ [Save Notes]                     │
└──────────────────────────────────┘
```

**g) Withdraw Section**

Show only when `status` is one of: `pending`, `reviewed`, `shortlisted`.

```
┌──────────────────────────────────┐
│ ⚠️ Withdraw Application          │
│ This action cannot be undone.    │
│ [textarea: withdrawal reason]    │
│ [Withdraw Application] (red)     │
└──────────────────────────────────┘
```

On submit: dispatch `withdrawApplication({ id, data: { withdrawalReason } })`.
After success: redirect to `/my-applications` or show confirmation.

**h) Reviews Panel (when accepted)**

Embed `ApplicationReviewsPanel` identically to how it's done in the employer's `ApplicationDetailPage`:

```jsx
{application.status === 'accepted' && currentUser && (
  <ApplicationReviewsPanel
    jobId={getJobId()}
    employerId={getEmployerId()}
    jobSeekerId={getJobSeekerId()}
    currentUserId={currentUser._id}
    applicationStatus={application.status}
    employerName={...}
    seekerName={...}
    jobTitle={...}
  />
)}
```

---

### Phase 3: Navbar Integration

#### Step 3.1: Add "My Applications" to Job Seeker Navigation

**File:** `src/components/Navbar.jsx`

Currently the navbar has these modes:

1. **Auth pages** — minimal nav
2. **Employer section** (`/employer/*`) — Dashboard, Jobs, Applications, Analytics
3. **Public pages** (`/jobs*`) — Post a Job, Sign in, profile
4. **Other pages** (profile, etc.) — Browse Jobs, profile, sign out

Job seekers see the **public** or **other** nav. There is **no dedicated job-seeker nav section**.

**Two options:**

**Option A (minimal, recommended):** Add a "My Applications" link in the public nav when user is a logged-in job seeker. The existing public nav shows "Post a Job" + profile. Add "My Applications" next to profile for job seekers:

```jsx
{
  currentUser?.role === 'job_seeker' && (
    <Link
      to="/my-applications"
      className="px-3 py-2 text-sm font-medium text-[#516876] hover:text-[#6794D1] transition-colors"
    >
      My Applications
    </Link>
  );
}
```

Also add it in the "other pages" nav (profile section) since seekers may navigate from their profile.

**Option B (full seeker nav):** Detect `currentUser?.role === 'job_seeker'` and render a dedicated nav bar (like the employer nav) with: Browse Jobs, My Applications, Reviews, Profile. This is more work but provides a cohesive experience.

**Recommendation:** Start with Option A for MVP, migrate to Option B later.

#### Step 3.2: Add Localization Keys

**Files:** `src/locales/en/translation.json`, `si/translation.json`, `ta/translation.json`

Add under `"navbar"`:

```json
"my_applications": "My Applications"
```

And add a new section for application-related text:

```json
"applications": {
  "my_applications_title": "My Applications",
  "my_applications_subtitle": "Track and manage your job applications",
  "no_applications": "You haven't applied to any jobs yet.",
  "browse_jobs_cta": "Browse Jobs",
  "applied_on": "Applied {{date}}",
  "interview_scheduled": "Interview scheduled",
  "withdraw": "Withdraw Application",
  "withdraw_confirm": "Are you sure you want to withdraw? This cannot be undone.",
  "withdrawal_reason": "Reason for withdrawal",
  "notes_label": "My Notes (private)",
  "notes_placeholder": "Keep personal notes about this application…",
  "save_notes": "Save Notes",
  "status_timeline": "Application Timeline",
  "view_job": "View Job Posting",
  "view_details": "View Details",
  "already_applied": "You have already applied"
}
```

---

### Phase 4: "Already Applied" Persistence on Page Load

#### Problem

Currently `PublicJobDetails.jsx` has `hasApplied` as local state initialized to `false`. It only becomes `true` after the user submits in the current session. If the user refreshes the page or returns later, they see "Apply Now" again (the backend will return 409 "already applied" if they try, but the UX is poor).

#### Solution

On mount of `PublicJobDetails`, if the user is a `job_seeker`, check if they've already applied. Three approaches:

**Option A (recommended — use existing API):** Call `applicationApi.getMyApplications({ limit: 100 })` and check if any `application.jobId._id === currentJobId`. Cache the result in Redux so it doesn't fire on every job detail view.

**Option B (lightweight — new backend route):** Add `GET /api/applications/check-applied/:jobId` to backend. Returns `{ hasApplied: boolean }`. Cleanest approach but requires backend change.

**Option C (try-and-catch):** Let user click Apply. If 409, set `hasApplied = true` and show "Already applied". Simplest but poor UX.

**Recommended implementation (Option A with Redux caching):**

1. Add a thunk `checkIfApplied` to `applicationSlice` that fetches `my-applications` once and caches the set of job IDs.
2. Add `appliedJobIds: []` to the slice state.
3. In `PublicJobDetails`, on mount: if user is a seeker, check `appliedJobIds.includes(jobId)` from Redux. If the list hasn't been loaded, dispatch `loadMyApplications` and extract job IDs.
4. The `submitApplication` fulfilled case should also add the new `jobId` to `appliedJobIds`.

Alternatively, a simpler approach:

- In `PublicJobDetails.jsx`, on mount, call `applicationApi.getMyApplications({ limit: 200 })` once and store the job IDs in a `Set`. Check the current job ID against it. Use a `useEffect` with the current user as dependency.

---

### Phase 5: Redux Slice Enhancement

#### Step 5.1: Add Missing Thunk for Notes Update

The API method `applicationApi.updateNotes(id, data)` exists, but `applicationSlice.js` has no corresponding thunk. Add:

```javascript
export const updateApplicationNotes = createAsyncThunk(
  'applications/updateNotes',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const { data: res } = await applicationApi.updateNotes(id, data);
      return res.data?.application ?? res.data ?? res;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);
```

Add to `initialState.loading` and `initialState.error`:

```javascript
updateNotes: false,  // in loading
updateNotes: null,   // in error
```

Add `extraReducers` case:

```javascript
builder
  .addCase(updateApplicationNotes.pending, state => {
    state.loading.updateNotes = true;
    state.error.updateNotes = null;
  })
  .addCase(updateApplicationNotes.fulfilled, (state, { payload }) => {
    state.loading.updateNotes = false;
    state.myApplications = state.myApplications.map(a => (a._id === payload._id ? payload : a));
    if (state.currentApplication?._id === payload._id) {
      state.currentApplication = payload;
    }
  })
  .addCase(updateApplicationNotes.rejected, (state, { payload }) => {
    state.loading.updateNotes = false;
    state.error.updateNotes = payload;
  });
```

#### Step 5.2: Add `appliedJobIds` for "Already Applied" Tracking

Add to `initialState`:

```javascript
appliedJobIds: [],
appliedJobIdsLoaded: false,
```

In the `loadMyApplications.fulfilled` handler, additionally extract:

```javascript
state.appliedJobIds = (payload.applications ?? [])
  .map(a => (typeof a.jobId === 'object' ? a.jobId._id : a.jobId))
  .filter(Boolean);
state.appliedJobIdsLoaded = true;
```

In the `submitApplication.fulfilled` handler, also push the new job ID:

```javascript
const newJobId = payload.jobId?._id ?? payload.jobId;
if (newJobId && !state.appliedJobIds.includes(newJobId)) {
  state.appliedJobIds.push(newJobId);
}
```

Add selector:

```javascript
export const selectAppliedJobIds = state => state.applications.appliedJobIds;
export const selectAppliedJobIdsLoaded = state => state.applications.appliedJobIdsLoaded;
export const selectHasAppliedToJob = jobId => state =>
  state.applications.appliedJobIds.includes(jobId);
```

#### Step 5.3: Fix `withdrawApplication` Fulfilled Handler

Currently the withdraw fulfilled handler tries to replace the application in `myApplications` by matching `payload._id`. But the backend withdraw endpoint returns `{ message }`, not the updated application object. The handler needs adjustment:

**Option A:** After successful withdraw, set the matching application's status to `'withdrawn'` by ID (pass `id` in the thunk payload).

**Option B:** Re-fetch `loadMyApplications` after withdraw.

Recommended: Option A — update the thunk to return both the ID and the response, then update in-place:

```javascript
export const withdrawApplication = createAsyncThunk(
  'applications/withdraw',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      await applicationApi.withdraw(id, data);
      return { id, withdrawalReason: data?.withdrawalReason };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// In extraReducers fulfilled:
.addCase(withdrawApplication.fulfilled, (state, { payload }) => {
  state.loading.withdraw = false;
  state.myApplications = state.myApplications.map(a =>
    a._id === payload.id ? { ...a, status: 'withdrawn', withdrawalReason: payload.withdrawalReason } : a
  );
  if (state.currentApplication?._id === payload.id) {
    state.currentApplication = { ...state.currentApplication, status: 'withdrawn' };
  }
});
```

---

### Phase 6: Update PublicJobDetails for Persistent "Already Applied"

**File:** `src/pages/PublicJobDetails.jsx`

Replace the local `hasApplied` state with Redux-driven state:

```jsx
import { useDispatch, useSelector } from 'react-redux';
import {
  loadMyApplications,
  selectHasAppliedToJob,
  selectAppliedJobIdsLoaded,
} from '../store/slices/applicationSlice';

// Inside the component:
const dispatch = useDispatch();
const hasApplied = useSelector(selectHasAppliedToJob(id));
const appliedLoaded = useSelector(selectAppliedJobIdsLoaded);

useEffect(() => {
  if (isSeeker && !appliedLoaded) {
    dispatch(loadMyApplications({ limit: 200 }));
  }
}, [isSeeker, appliedLoaded, dispatch]);
```

Remove the local `const [hasApplied, setHasApplied] = useState(false);` and the `onSuccess={() => setHasApplied(true)}` — submission already adds to `appliedJobIds` via Redux.

---

### Phase 7: Polish & Edge Cases

#### 7.1: Job Status Handling

If the job is `closed` or `filled`, the Apply button is already hidden (condition `job.status === 'open'`). But the seeker might have already applied before closing. Ensure:

- "Already applied" badge still shows for closed/filled jobs
- My Applications page still shows these applications with accurate job status

#### 7.2: Withdrawn Application Display

In My Applications list, withdrawn applications should:

- Show with gray/muted styling
- Not show "View Details" with withdraw option (it's already withdrawn)
- Optionally show the withdrawal reason inline

#### 7.3: Mobile Responsive

Ensure all new pages follow the existing responsive patterns:

- Cards stack vertically on mobile
- Tabs scroll horizontally on small screens
- Modals are full-width on mobile (ApplyModal already does this with `rounded-t-3xl sm:rounded-2xl`)

#### 7.4: Loading & Error States

Every new page should handle:

- Loading spinner (use existing `Spinner` component)
- Error banner (use existing `AlertBanner` component)
- Empty state (use existing `EmptyState` component or inline empty state like other pages)

---

## 4. File Checklist

| Action     | File                                           | Purpose                                                                                         |
| ---------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Create** | `src/router/routes/seekerRoutes.jsx`           | Route definitions for job seeker pages                                                          |
| **Create** | `src/pages/seeker/MyApplications.jsx`          | My Applications list page                                                                       |
| **Create** | `src/pages/seeker/SeekerApplicationDetail.jsx` | Single application detail (seeker view)                                                         |
| **Update** | `src/router/routeConfig.jsx`                   | Register `seekerRoutes`                                                                         |
| **Update** | `src/store/slices/applicationSlice.js`         | Add `updateApplicationNotes` thunk, `appliedJobIds` tracking, fix `withdrawApplication` handler |
| **Update** | `src/components/Navbar.jsx`                    | Add "My Applications" link for job seekers                                                      |
| **Update** | `src/pages/PublicJobDetails.jsx`               | Replace local `hasApplied` with Redux-driven check                                              |
| **Update** | `src/locales/en/translation.json`              | Add application i18n keys                                                                       |
| **Update** | `src/locales/si/translation.json`              | Add Sinhala translations                                                                        |
| **Update** | `src/locales/ta/translation.json`              | Add Tamil translations                                                                          |

---

## 5. Backend Notes (Confirmed)

1. `GET /api/applications/my-applications` — requires `job_seeker` role via `protect` + `authorize('job_seeker')` middleware. Returns applications with populated `jobId` (title, category, status) and `employerId` (firstName, lastName, email). Strips `employerNotes` from responses.
2. `GET /api/applications/:id` — for job seekers, strips `employerNotes`. Verifies the requesting user is the applicant, the employer, or admin.
3. `PATCH /api/applications/:id/withdraw` — only allows withdrawal from `pending`, `reviewed`, `shortlisted`. Returns `{ message }`.
4. `PATCH /api/applications/:id/notes` — updates seeker's private `notes` field. Returns the application without `employerNotes`.
5. Application model has `statusHistory` array with `{ status, changedAt, changedBy }` — useful for the timeline UI.
6. No backend change required for this plan.

---

## 6. Suggested Order of Implementation

| Order | Task                                                                          | Estimated Effort |
| ----- | ----------------------------------------------------------------------------- | ---------------- |
| 1     | `applicationSlice.js` enhancements (notes thunk, appliedJobIds, withdraw fix) | Small            |
| 2     | `seekerRoutes.jsx` + register in `routeConfig.jsx`                            | Small            |
| 3     | `MyApplications.jsx` page                                                     | Medium           |
| 4     | `SeekerApplicationDetail.jsx` page                                            | Medium-Large     |
| 5     | Navbar "My Applications" link                                                 | Small            |
| 6     | `PublicJobDetails.jsx` — persistent "already applied" check                   | Small            |
| 7     | Localization keys (en, si, ta)                                                | Small            |
| 8     | Polish: mobile responsiveness, edge cases, empty states                       | Small            |

---

## 7. Component Reuse Opportunities

| Existing Component             | Reuse In                                                         |
| ------------------------------ | ---------------------------------------------------------------- |
| `DottedBackground`             | Both new pages (layout wrapper)                                  |
| `AlertBanner`                  | Error/success messages                                           |
| `Spinner`                      | Loading states                                                   |
| `Badge` / status badge pattern | Application status badges (copy pattern from employer pages)     |
| `ApplicationReviewsPanel`      | Embed in `SeekerApplicationDetail` when `status === 'accepted'`  |
| Pagination pattern             | Copy from `JobApplicationsList.jsx`                              |
| Status color constants         | Extract to shared `src/constants/applicationStatus.js` for reuse |

---

## 8. Shared Constants (Optional Refactor)

Both employer and seeker pages use identical status badge colors and status lists. Consider extracting to a shared file:

**File:** `src/constants/applicationStatus.js`

```javascript
export const APPLICATION_STATUSES = [
  'pending',
  'reviewed',
  'shortlisted',
  'accepted',
  'rejected',
  'withdrawn',
];

export const STATUS_BADGE_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  reviewed: 'bg-blue-100 text-blue-700 border-blue-200',
  shortlisted: 'bg-purple-100 text-purple-700 border-purple-200',
  accepted: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  withdrawn: 'bg-gray-100 text-gray-500 border-gray-200',
};

export const WITHDRAWABLE_STATUSES = ['pending', 'reviewed', 'shortlisted'];
```

---

## 9. Summary

| Phase | Deliverable                                                                                      |
| ----- | ------------------------------------------------------------------------------------------------ |
| 1     | `seekerRoutes.jsx`, `MyApplications.jsx` — list page with filters, pagination                    |
| 2     | `SeekerApplicationDetail.jsx` — detail with status timeline, interview, notes, withdraw, reviews |
| 3     | Navbar "My Applications" link for job seekers                                                    |
| 4     | `PublicJobDetails.jsx` — persistent "already applied" via Redux                                  |
| 5     | `applicationSlice.js` — notes thunk, appliedJobIds tracking, withdraw fix                        |
| 6     | Localization + polish                                                                            |

The backend is fully ready. The Redux slice has most thunks in place (just needs `updateApplicationNotes` and minor fixes). The main frontend work is: **two new pages** (My Applications + Application Detail), **navbar link**, **Redux enhancements**, and **"already applied" persistence**.

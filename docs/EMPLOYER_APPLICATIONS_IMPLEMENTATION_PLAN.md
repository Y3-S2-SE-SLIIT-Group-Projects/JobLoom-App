# Employer Applications – Frontend Implementation Plan

This document outlines the complete implementation plan for the application flow in JobLoom, from job listing → Apply → employer management. It focuses on the **employer side** while including the minimal job-seeker pieces required for the flow to work.

---

## 1. Current State Summary

### Backend (JobLoom-BE) – Ready

| Endpoint                                     | Method | Role                  | Purpose                                                   |
| -------------------------------------------- | ------ | --------------------- | --------------------------------------------------------- |
| `POST /api/applications`                     | POST   | job_seeker            | Apply for a job                                           |
| `GET /api/applications/my-applications`      | GET    | job_seeker            | List seeker's applications                                |
| `GET /api/applications/job/:jobId`           | GET    | employer              | List applications for a job                               |
| `GET /api/applications/job/:jobId/stats`     | GET    | employer              | Application stats (pending, shortlisted, etc.)            |
| `GET /api/applications/:id`                  | GET    | seeker/employer/admin | Get single application                                    |
| `PATCH /api/applications/:id/status`         | PATCH  | employer              | Update status (reviewed, shortlisted, accepted, rejected) |
| `PATCH /api/applications/:id/interview-date` | PATCH  | employer              | Schedule interview                                        |
| `PATCH /api/applications/:id/withdraw`       | PATCH  | job_seeker            | Withdraw application                                      |

**Application status flow:** `pending` → `reviewed` → `shortlisted` → `accepted` or `rejected` (final). `withdrawn` is job-seeker-initiated.

### Frontend (JobLoom-App) – Gaps

| Feature                           | Status                                |
| --------------------------------- | ------------------------------------- |
| Public job detail view            | ❌ Job details route is employer-only |
| Apply button on job details       | ❌ Not implemented                    |
| Job seeker apply form/modal       | ❌ Not implemented                    |
| Application API service           | ❌ Not implemented                    |
| Employer Applications page        | ❌ ComingSoon placeholder             |
| Employer application list per job | ❌ Not implemented                    |
| Employer status update UI         | ❌ Not implemented                    |
| Employer interview scheduling UI  | ❌ Not implemented                    |
| ApplicationReviewsPanel           | ✅ Exists, ready to embed             |

**Routing issue:** `JobCard` links to `/employer/jobs/:id?public=true`, but that route is protected by `allowedRoles={['employer']}`. Job seekers and guests are redirected to login or home.

---

## 2. End-to-End Flow (Target)

```
[Job Listing /jobs]
       │
       ▼
[Job Details – public /jobs/:id]
       │
       ├── Guest: View only, "Login to Apply"
       ├── Job Seeker: "Apply" button → Apply modal → POST /api/applications
       └── Employer (own job): Link to "Manage Applications"
       │
       ▼
[Employer Applications Hub /employer/applications]
       │
       ├── List of jobs with application counts
       └── Click job → Applications for that job
       │
       ▼
[Application List /employer/applications/job/:jobId]
       │
       ├── Filter by status (pending, shortlisted, etc.)
       ├── Stats bar (pending: 5, shortlisted: 2, accepted: 1)
       └── Click application → Application detail
       │
       ▼
[Application Detail – modal or page]
       │
       ├── Applicant info (name, email, skills, cover letter, resume)
       ├── Status dropdown: reviewed | shortlisted | accepted | rejected
       ├── Employer notes (internal)
       ├── Schedule interview (date picker)
       └── ApplicationReviewsPanel (when status = accepted)
```

---

## 3. Implementation Plan (Step by Step)

### Phase 1: Foundation – API & Routing

#### Step 1.1: Create Application API Service

**File:** `src/services/applicationApi.js`

```javascript
import api from './api';

export const applicationApi = {
  // Job seeker
  apply: data => api.post('/applications', data),
  getMyApplications: params => api.get('/applications/my-applications', { params }),
  getApplicationById: id => api.get(`/applications/${id}`),
  withdraw: (id, data) => api.patch(`/applications/${id}/withdraw`, data),
  updateNotes: (id, data) => api.patch(`/applications/${id}/notes`, data),

  // Employer
  getJobApplications: (jobId, params) => api.get(`/applications/job/${jobId}`, { params }),
  getJobStats: jobId => api.get(`/applications/job/${jobId}/stats`),
  updateStatus: (id, data) => api.patch(`/applications/${id}/status`, data),
  scheduleInterview: (id, data) => api.patch(`/applications/${id}/interview-date`, data),
};
```

#### Step 1.2: Add Public Job Detail Route

**Problem:** Job details are under `/employer/jobs/:id`, which is employer-only.

**Solution:** Add a public route `/jobs/:id` for viewing job details.

- **Option A (recommended):** New route `path: 'jobs/:id'` with a new `PublicJobDetails` component (or reuse `JobDetails` with different logic).
- **Option B:** Add a shared `JobDetails` route that allows both public and employer, with role-based UI.

**Action:** In `publicRoutes.jsx`, add:

```jsx
{ path: 'jobs/:id', element: <PublicJobDetails /> }
```

Create `PublicJobDetails.jsx` that:

- Fetches job by ID (use existing `fetchJobById` from JobContext – jobs are publicly readable).
- Shows job info (same layout as current JobDetails).
- **If guest:** Show "Login to Apply" CTA.
- **If job_seeker:** Show "Apply" button.
- **If employer (own job):** Show "Manage Applications" link to `/employer/applications/job/:jobId`.

**Update JobCard:** Change `navigate(\`/employer/jobs/${job._id}?public=true\`)` to `navigate(\`/jobs/${job.\_id}\`)`.

---

### Phase 2: Job Seeker – Apply Flow (Minimal for Employer Flow)

#### Step 2.1: Apply Button & Modal

**Location:** `PublicJobDetails.jsx` (or `JobDetails` if you unify)

**Logic:**

- Show "Apply" only when: `currentUser?.role === 'job_seeker'` AND `job.status === 'open'`.
- On click → open `ApplyModal`.

**Component:** `src/components/applications/ApplyModal.jsx`

**Props:** `isOpen`, `onClose`, `jobId`, `jobTitle`, `onSuccess`

**Form fields:**

- `coverLetter` (textarea, optional, max 1000 chars)
- `resumeUrl` (text input, optional, URL validation)

**Submit:** `applicationApi.apply({ jobId, coverLetter, resumeUrl })`

**Success:** Close modal, show toast/success message, optionally disable Apply button and show "Applied".

#### Step 2.2: Check if Already Applied (Optional but Recommended)

Before showing Apply, you may want to know if the user already applied. Options:

- **A:** Add `GET /api/applications/check-applied/:jobId` (backend would need this).
- **B:** Fetch `my-applications` and check if any `jobId` matches (heavier).
- **C:** Try apply; if 409 "already applied", show "You have already applied" and hide Apply.

**Recommendation:** Option C for now (simplest). Backend returns 409 on duplicate.

---

### Phase 3: Employer – Applications Hub

#### Step 3.1: Replace ComingSoon with Applications Page

**File:** `src/pages/employer/applications/EmployerApplications.jsx` (new)

**Route:** `/employer/applications` (already exists, replace `ComingSoon`)

**Layout:**

- Page title: "Applications"
- List of employer's jobs that have applications (or all jobs with application count).
- Each row: Job title, status, application count, "View applications" link.

**Data:** You need jobs with application counts. Options:

- **A:** Use `fetchMyJobs` (JobContext) – if backend returns `applicantsCount` per job.
- **B:** For each job, call `GET /applications/job/:jobId/stats` – N+1 calls.
- **C:** Add backend endpoint `GET /api/jobs/employer/my-jobs-with-stats` that returns jobs + application counts in one call.

**Recommendation:** Check if `fetchMyJobs` already returns `applicantsCount`. If not, use Option B for MVP (call stats per job), or add Option C later.

**UI:** Card/list of jobs. Each card shows:

- Job title, status badge
- Stats: "5 pending, 2 shortlisted, 1 accepted" (from stats API)
- Button: "View applications" → `/employer/applications/job/:jobId`

#### Step 3.2: Add "View Applications" to JobList

**File:** `src/pages/employer/jobs/JobList.jsx`

Add a button/link next to Edit/Close/etc:

```jsx
<Link to={`/employer/applications/job/${job._id}`} className="...">
  <FaUsers /> View applications
</Link>
```

---

### Phase 4: Employer – Application List per Job

#### Step 4.1: New Route

**File:** `src/router/routes/employerRoutes.jsx`

Add:

```jsx
{
  path: 'employer/applications/job/:jobId',
  element: (
    <ProtectedRoute allowedRoles={['employer']}>
      <JobApplicationsList />
    </ProtectedRoute>
  ),
},
```

#### Step 4.2: JobApplicationsList Page

**File:** `src/pages/employer/applications/JobApplicationsList.jsx`

**Data:**

- `applicationApi.getJobStats(jobId)` → stats bar
- `applicationApi.getJobApplications(jobId, { status, page, limit })` → list

**UI:**

- Back link to `/employer/applications` or `/employer/my-jobs`
- Job title header
- Stats bar: Pending (5) | Reviewed (2) | Shortlisted (1) | Accepted (0) | Rejected (3) – filter tabs
- Table or cards of applications:
  - Applicant name, email, applied date, status badge
  - "View" or click row → open ApplicationDetailModal or navigate to detail page

**Pagination:** Use `pagination` from API response.

---

### Phase 5: Employer – Application Detail & Actions

#### Step 5.1: Application Detail Modal (or Page)

**File:** `src/components/applications/ApplicationDetailModal.jsx` or `ApplicationDetailPage.jsx`

**Data:** `applicationApi.getApplicationById(id)`

**Display:**

- Applicant: name, email, skills (from `jobSeekerId` populate)
- Cover letter
- Resume link (if `resumeUrl`)
- Status badge
- Employer notes (editable)
- Status dropdown: reviewed | shortlisted | accepted | rejected (respect backend `STATUS_TRANSITIONS`)
- Interview date: date picker + "Schedule" button
- `ApplicationReviewsPanel` when status is `accepted`

**Status update:** `applicationApi.updateStatus(id, { status, employerNotes })`

**Interview:** `applicationApi.scheduleInterview(id, { interviewDate })`

#### Step 5.2: Status Transition Rules (Frontend)

Match backend:

- `pending` → reviewed, shortlisted, accepted, rejected
- `reviewed` → shortlisted, accepted, rejected
- `shortlisted` → accepted, rejected
- `accepted`, `rejected`, `withdrawn` → no further changes

Disable invalid options in the dropdown.

---

### Phase 6: Polish & Integration

#### Step 6.1: ApplicationReviewsPanel Integration

In `ApplicationDetailModal` (or page), when `application.status === 'accepted'`:

```jsx
<ApplicationReviewsPanel
  jobId={application.jobId?._id ?? application.jobId}
  employerId={application.employerId?._id ?? application.employerId}
  jobSeekerId={application.jobSeekerId?._id ?? application.jobSeekerId}
  currentUserId={currentUser._id}
  applicationStatus={application.status}
  employerName={...}
  seekerName={...}
  jobTitle={application.jobId?.title}
/>
```

#### Step 6.2: Employer Dashboard Stats

If `EmployerDashboard` should show application counts, call `getJobStats` for each job or add an aggregate endpoint. For MVP, the Applications card already links to the new page.

#### Step 6.3: JobList – Application Count Badge

If backend returns `applicantsCount` on job, show it in JobList: e.g. "12 applicants".

---

## 4. File Checklist

| Action | File                                                                                       |
| ------ | ------------------------------------------------------------------------------------------ |
| Create | `src/services/applicationApi.js`                                                           |
| Create | `src/components/applications/ApplyModal.jsx`                                               |
| Create | `src/components/applications/ApplicationDetailModal.jsx`                                   |
| Create | `src/pages/employer/applications/EmployerApplications.jsx`                                 |
| Create | `src/pages/employer/applications/JobApplicationsList.jsx`                                  |
| Create | `src/pages/PublicJobDetails.jsx` (or similar)                                              |
| Update | `src/router/routes/publicRoutes.jsx` – add `jobs/:id`                                      |
| Update | `src/router/routes/employerRoutes.jsx` – replace ComingSoon, add `applications/job/:jobId` |
| Update | `src/pages/dashboard/JobCard.jsx` – link to `/jobs/:id`                                    |
| Update | `src/pages/employer/jobs/JobList.jsx` – add "View applications" button                     |

---

## 5. Backend Verification (Confirmed)

1. **Job fetch:** `GET /api/jobs/:id` – **Public** (no auth required). Safe to use in PublicJobDetails.
2. **Job model:** Has `applicantsCount` field, but the application service does **not** call `incrementApplicants()` when creating applications. Use `GET /api/applications/job/:jobId/stats` for accurate counts on the Employer Applications page.
3. **Application populate:** `jobSeekerId` includes `firstName`, `lastName`, `email`, `skills` – sufficient for employer view.

---

## 6. Suggested Order of Implementation

1. **applicationApi.js** – API layer
2. **Public job route + PublicJobDetails** – fix routing so job seekers can view jobs
3. **ApplyModal + Apply button** – job seeker can apply
4. **EmployerApplications page** – replace ComingSoon
5. **JobApplicationsList page + route** – list applications per job
6. **ApplicationDetailModal** – view applicant, update status, schedule interview
7. **ApplicationReviewsPanel** – embed in detail when accepted
8. **JobList "View applications"** – quick access from My Jobs

---

## 7. Job Seeker "My Applications"

For a complete experience, job seekers need a "My Applications" page. This is **not** required for the employer flow but is recommended:

- Route: `/my-applications` (job_seeker only)
- Data: `applicationApi.getMyApplications({ status, page })`
- UI: List of applications with job title, status, applied date, withdraw button

---

## 8. Summary

| Phase | Deliverable                                                             |
| ----- | ----------------------------------------------------------------------- |
| 1     | applicationApi.js, public job route, PublicJobDetails, JobCard link fix |
| 2     | ApplyModal, Apply button on job details                                 |
| 3     | EmployerApplications page (replace ComingSoon)                          |
| 4     | JobApplicationsList page + route                                        |
| 5     | ApplicationDetailModal with status, notes, interview, reviews           |
| 6     | JobList "View applications", ApplicationReviewsPanel integration        |

The backend is ready. The main frontend work is: **routing fix**, **Apply flow**, **Employer Applications hub**, **Application list per job**, and **Application detail with actions**.

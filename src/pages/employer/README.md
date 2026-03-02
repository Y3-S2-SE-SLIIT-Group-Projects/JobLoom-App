# 💼 Employer Dashboard - Component Guide

## Overview

The Employer Dashboard is the central hub for employers to manage their job postings on the JobLoom Rural Employment Platform. It provides quick access to create jobs, view existing jobs, manage applications, and view statistics.

---

## 🎨 Design Features

### Visual Elements

- **Dotted Background Pattern** - Modern, subtle pattern matching design requirements
- **Gradient Cards** - Eye-catching cards with smooth color transitions
- **Hover Effects** - Interactive cards with smooth animations
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Smooth Transitions** - CSS animations for professional feel

### Color Scheme

```css
Primary Gradient:   #667eea → #764ba2 (Blue to Purple)
Success Gradient:   #76c7c0 → #26d0ce (Teal to Cyan)
Warning Gradient:   #c084fc → #a78bfa (Purple to Pink)
Info Gradient:      #f5f7fa → #c3cfe2 (Light Gray)
```

---

## 📦 Components Breakdown

### 1. Employer Dashboard (`EmployerDashboard.jsx`)

**Purpose:** Main landing page for employers

**Structure:**

```jsx
<div className="employer-dashboard">
  <Header />
  <div className="dashboard-container">
    <LeftColumn>- Create Job Card - My Jobs Card - Applications Card</LeftColumn>
    <RightColumn>
      - Teams Card - Analytics Card - Notifications Card - Profile Card - Quick Stats Card
    </RightColumn>
  </div>
</div>
```

**State:**

- `stats` - Dashboard statistics from API
- `loading` - Loading state for stats

**Props:** None (uses JobContext)

---

### 2. Create Job (`CreateJob.jsx`)

**Purpose:** Form to create new job postings

**Structure:**

- 5 section multi-step form
- Real-time validation
- Skills management
- Dynamic form fields

**Props:**

- `onSuccess(job)` - Callback when job created successfully
- `onCancel()` - Callback when user cancels

**State:**

- `formData` - All form field values
- `skillInput` - Temporary skill input
- `errors` - Validation error messages

**Validation Rules:**

```javascript
Title:        3-100 characters (required)
Description:  20-2000 characters (required)
Village:      Not empty (required)
District:     Not empty (required)
Province:     Selected from dropdown (required)
Salary:       Positive number (required)
Positions:    1-100 (required)
Start Date:   Valid date (required)
End Date:     > Start Date (optional)
Skills:       Array (optional)
```

---

### 3. My Jobs (`MyJobs.jsx`)

**Purpose:** View and manage employer's posted jobs

**Structure:**

```jsx
<div className="my-jobs-container">
  <Header>
    <FilterDropdown />
  </Header>

  <JobsGrid>
    {jobs.map(job => (
      <JobCard>
        <Header />
        <Body />
        <Footer>
          <ActionButtons />
        </Footer>
      </JobCard>
    ))}
  </JobsGrid>

  <ConfirmDialog />
</div>
```

**Props:**

- `onEditJob(job)` - Callback when edit clicked

**State:**

- `jobs` - List of employer's jobs
- `filterStatus` - Current filter ('all', 'open', 'closed', 'filled')
- `showConfirmDialog` - Modal visibility
- `selectedJob` - Job being acted upon
- `actionType` - Action to confirm ('close', 'filled', 'delete')

**Actions:**

- Edit - Navigate to edit form (future)
- Close - Change status to closed
- Mark Filled - Change status to filled
- Delete - Soft delete (only if no applications)

---

## 🎯 User Flows

### Creating a Job

```
1. User clicks "Create Job" card on dashboard
   ↓
2. Navigate to Create Job form
   ↓
3. User fills in 5 sections:
   - Basic Information
   - Location
   - Salary
   - Requirements
   - Duration
   ↓
4. User adds optional skills
   ↓
5. User clicks "Create Job"
   ↓
6. Form validates
   ↓
7. API call to backend
   ↓
8. Success: Redirect to My Jobs
   OR
   Error: Show error message
```

### Managing Jobs

```
1. User clicks "My Jobs" card on dashboard
   ↓
2. View all posted jobs
   ↓
3. Optional: Filter by status
   ↓
4. User selects action on a job:

   Option A: Edit
   → Navigate to edit form (future)

   Option B: Close
   → Confirm dialog
   → Update job status
   → Refresh list

   Option C: Mark Filled
   → Confirm dialog
   → Update job status
   → Refresh list

   Option D: Delete
   → Check if has applications
   → If no applications:
     → Confirm dialog
     → Soft delete job
     → Refresh list
   → If has applications:
     → Show error (cannot delete)
```

---

## 🔗 Context Integration

### Using JobContext

```javascript
import { useJobs } from '../../contexts/JobContext';

const MyComponent = () => {
  const {
    jobs, // Current jobs list
    loading, // Loading state
    error, // Error message
    fetchMyJobs, // Fetch employer's jobs
    fetchEmployerStats, // Fetch dashboard stats
    createJob, // Create new job
    updateJob, // Update existing job
    closeJob, // Close job
    markJobAsFilled, // Mark as filled
    deleteJob, // Delete job
  } = useJobs();

  // Use methods...
};
```

---

## 🎨 Styling Guide

### Dashboard Cards

**Interactive Cards (Left Column):**

```css
.card {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-10px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}
```

**Info Cards (Right Column):**

```css
.info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  /* ... other styles */
}
```

### Form Styling

**Input Fields:**

```css
.form-group input {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.form-group input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
```

**Error States:**

```css
.form-group input.error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 0.3rem;
}
```

### Job Cards

**Status Badges:**

```css
.status-open {
  background: #d1fae5;
  color: #065f46;
}

.status-closed {
  background: #fee2e2;
  color: #991b1b;
}

.status-filled {
  background: #dbeafe;
  color: #1e40af;
}
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile */
@media (max-width: 768px) {
  - Two-column layout → Single column
  - Side-by-side inputs → Stacked
  - Horizontal buttons → Vertical
  - Reduced padding/margins
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  - Adjusted grid columns
  - Smaller font sizes
}

/* Desktop */
@media (min-width: 1025px) {
  - Full two-column layout
  - Larger cards
  - Optimal spacing
}
```

---

## 🔔 Loading & Error States

### Loading State

```jsx
{loading ? (
  <div className="loading-state">
    <div className="spinner"></div>
    <p>Loading jobs...</p>
  </div>
) : (
  // Content
)}
```

### Empty State

```jsx
{jobs.length === 0 ? (
  <div className="empty-state">
    <svg className="empty-icon">...</svg>
    <h3>No jobs found</h3>
    <p>You haven't posted any jobs yet.</p>
  </div>
) : (
  // Jobs list
)}
```

### Error State

```jsx
{
  error && <div className="error-banner">{error}</div>;
}
```

---

## 🎬 Animations

### Card Animations

```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  animation: slideIn 0.5s ease-out;
}
```

### Staggered Animations

```css
.form-section:nth-child(1) {
  animation-delay: 0.1s;
}
.form-section:nth-child(2) {
  animation-delay: 0.2s;
}
.form-section:nth-child(3) {
  animation-delay: 0.3s;
}
.form-section:nth-child(4) {
  animation-delay: 0.4s;
}
.form-section:nth-child(5) {
  animation-delay: 0.5s;
}
```

---

## 🧪 Testing Checklist

### Dashboard

- [ ] Stats display correctly
- [ ] Cards are clickable
- [ ] Hover effects work
- [ ] Responsive on mobile
- [ ] Loading state shows
- [ ] Error handling works

### Create Job

- [ ] All fields render
- [ ] Validation works
- [ ] Error messages show
- [ ] Skills can be added/removed
- [ ] Character counter updates
- [ ] Submit creates job
- [ ] Cancel navigates away
- [ ] Mobile layout works

### My Jobs

- [ ] Jobs display in grid
- [ ] Filter works
- [ ] Status badges show correctly
- [ ] Edit button works
- [ ] Close works
- [ ] Mark filled works
- [ ] Delete works (no apps)
- [ ] Delete blocked (with apps)
- [ ] Confirmation dialogs show
- [ ] Empty state displays
- [ ] Loading state displays
- [ ] Mobile layout works

---

## 🔧 Customization

### Changing Colors

```css
/* In EmployerDashboard.css */
:root {
  --primary-gradient-start: #667eea;
  --primary-gradient-end: #764ba2;
  --success-gradient-start: #76c7c0;
  --success-gradient-end: #26d0ce;
}

.create-job-card {
  background: linear-gradient(
    135deg,
    var(--primary-gradient-start) 0%,
    var(--primary-gradient-end) 100%
  );
}
```

### Changing Spacing

```css
/* Adjust card padding */
.card {
  padding: 2rem; /* Change to 1.5rem or 3rem */
}

/* Adjust grid gap */
.jobs-grid {
  gap: 1.5rem; /* Change to 1rem or 2rem */
}
```

---

## 📚 Component API Reference

### EmployerDashboard

```typescript
interface EmployerDashboardProps {
  // No props - uses JobContext
}
```

### CreateJob

```typescript
interface CreateJobProps {
  onSuccess?: (job: Job) => void;
  onCancel?: () => void;
}
```

### MyJobs

```typescript
interface MyJobsProps {
  onEditJob?: (job: Job) => void;
}
```

---

## 🚀 Future Enhancements

### Dashboard

- [ ] Real-time stats updates
- [ ] Charts for analytics
- [ ] Recent activity feed
- [ ] Quick actions menu

### Create Job

- [ ] Auto-save drafts
- [ ] Template selection
- [ ] Mapbox location picker
- [ ] Image upload

### My Jobs

- [ ] Bulk actions
- [ ] Export to CSV
- [ ] Advanced filters
- [ ] Sort options
- [ ] Pagination

---

## 💡 Best Practices

### Performance

- Use React.memo for job cards
- Debounce search inputs
- Lazy load images
- Virtual scrolling for long lists

### Accessibility

- Proper ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support

### UX

- Clear error messages
- Loading indicators
- Confirmation for destructive actions
- Success feedback

---

**Last Updated:** February 11, 2026  
**Component Owner:** Member 2  
**Status:** ✅ Production Ready

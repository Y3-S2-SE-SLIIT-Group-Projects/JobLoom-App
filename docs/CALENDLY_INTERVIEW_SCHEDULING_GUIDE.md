# Calendly Interview Scheduling Integration Guide

This guide explains how to replace the current manual date-picker interview scheduling with [Calendly's scheduling page embed](https://developer.calendly.com/how-to-display-the-scheduling-page-for-users-of-your-app), allowing employers to let job seekers book interview slots directly via Calendly.

---

## Table of Contents

1. [Current vs Target Setup](#1-current-vs-target-setup)
2. [Prerequisites](#2-prerequisites)
3. [Step 1: Calendly Authentication](#3-step-1-calendly-authentication)
4. [Step 2: Obtain the Scheduling URL](#4-step-2-obtain-the-scheduling-url)
5. [Step 3: Choose an Embed Type](#5-step-3-choose-an-embed-type)
6. [Step 4: Add Calendly Script to JobLoom](#6-step-4-add-calendly-script-to-jobloom)
7. [Step 5: Integrate Embed in Application Detail](#7-step-5-integrate-embed-in-application-detail)
8. [Step 6: Store Employer Calendly URL (Optional)](#8-step-6-store-employer-calendly-url-optional)
9. [Step 7: Sync Bookings Back to JobLoom (Optional)](#9-step-7-sync-bookings-back-to-jobloom-optional)
10. [Environment Variables](#10-environment-variables)
11. [References](#11-references)

---

## 1. Current vs Target Setup

| Aspect   | Current Setup                              | Target (Calendly)                                     |
| -------- | ------------------------------------------ | ----------------------------------------------------- |
| **UI**   | `datetime-local` input + "Schedule" button | Calendly embed (inline, popup, or badge)              |
| **Flow** | Employer picks date → saved to DB          | Job seeker picks slot on Calendly → booking confirmed |
| **Data** | `interviewDate` stored in Application      | Can sync via Calendly webhooks or manual confirmation |
| **UX**   | Back-and-forth coordination                | Self-service scheduling for job seeker                |

---

## 2. Prerequisites

- A [Calendly](https://calendly.com) account (free or paid)
- Calendly event type(s) configured (e.g. "30-Minute Interview")
- For API access: **OAuth app** (multi-user) or **Personal Access Token (PAT)** (single user / admin)

---

## 3. Step 1: Calendly Authentication

You need a token to call the Calendly API and fetch scheduling URLs.

### Option B: OAuth App (Multi-User, Production)

1. Go to [Calendly Developer](https://developer.calendly.com) → **OAuth applications**
2. Create an OAuth app with:
   - **Redirect URI:** `https://your-jobloom-app.com/auth/calendly/callback` (or localhost for dev)
   - **Scopes:** `default` or specific scopes like `read:event_types`, `read:users`
3. Implement OAuth flow: redirect employer → Calendly consent → callback → store `access_token` and optional `refresh_token`
4. **Use case:** Each employer connects their own Calendly account

---

## 4. Step 2: Obtain the Scheduling URL

The scheduling URL is in the `scheduling_url` property. Choose one method based on your setup:

### Method A: Current User's Landing Page

If the logged-in employer has connected their Calendly account (OAuth):

```
GET https://api.calendly.com/users/me
Authorization: Bearer <access_token>
```

Response includes `scheduling_url` (e.g. `https://calendly.com/employer-name`).

### Recommendation for JobLoom

- **Simple setup:** Store the employer's Calendly `scheduling_url` in their user profile (see [Step 6](#8-step-6-store-employer-calendly-url-optional)).
- **Advanced:** Use OAuth and `/users/me` to fetch the URL at runtime when the employer opens the Application Detail page.

---

## 5. Step 3: Choose an Embed Type

Calendly supports three embed types. Replace `myLink` with the `scheduling_url` from Step 2.

### Inline Embed (Full scheduling page inside your app)

```javascript
Calendly.initInlineWidget({
  url: myLink,
  parentElement: document.getElementById('calendly-container'),
  prefill: {},
  utm: {},
  autoLoad: false,
  hideEventTypeDetails: false,
});
```

**Best for:** Application Detail page where you want the full Calendly experience inline.

### Popup Embed (Opens in a modal)

```javascript
Calendly.initPopupWidget({
  url: myLink,
});
```

**Best for:** "Schedule Interview" button that opens Calendly in a popup.

### Badge Embed (Floating button)

```javascript
Calendly.initBadgeWidget({
  url: myLink,
  text: 'Schedule time with me',
  color: '#006bff',
  textColor: '#ffffff',
  branding: true,
});
```

**Best for:** Persistent scheduling access across the app.

For JobLoom’s Application Detail page, **Inline** or **Popup** is usually best.

---

## 6. Step 4: Add Calendly Script to JobLoom

1. Add the Calendly embed script to your app. In `index.html` (or equivalent):

```html
<script src="https://assets.calendly.com/assets/external/widget.js" async></script>
```

2. Or load it dynamically in the component that uses the embed:

```javascript
useEffect(() => {
  if (!document.querySelector('script[src*="calendly"]')) {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);
  }
}, []);
```

3. (Optional) Add Calendly CSS for inline embeds:

```html
<link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet" />
```

---

## 7. Step 5: Integrate Embed in Application Detail

### 7.1 Replace the Schedule Interview Section

In `ApplicationDetailPage.jsx`, replace the current form (lines ~378–416) with a Calendly embed container.

**Before (current):**

- `datetime-local` input + "Schedule" button
- `handleScheduleInterview` → `PATCH /api/applications/:id/interview-date`

**After (Calendly):**

- A div for the Calendly inline or popup widget
- Use the employer’s `scheduling_url` (from profile or API)

### 7.2 Example: Inline Embed

```jsx
{
  canScheduleInterview && employerCalendlyUrl && (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Schedule Interview</h2>
      <p className="text-sm text-gray-600 mb-4">
        The applicant can pick a time below. Your availability is powered by Calendly.
      </p>
      <div
        id="calendly-inline-embed"
        className="calendly-inline-widget min-w-[320px] h-[630px]"
        data-url={employerCalendlyUrl}
      />
    </section>
  );
}
```

If using the JS API instead of data attributes:

```jsx
useEffect(() => {
  if (employerCalendlyUrl && window.Calendly) {
    window.Calendly.initInlineWidget({
      url: employerCalendlyUrl,
      parentElement: document.getElementById('calendly-inline-embed'),
      prefill: {
        name: getApplicantName(),
        email: application?.jobSeekerId?.email,
        customAnswers: {
          a1: application?._id, // optional: pass application ID
        },
      },
      utm: {
        utmSource: 'jobloom',
        utmMedium: 'application',
        utmContent: application?._id,
      },
    });
  }
}, [employerCalendlyUrl, application]);
```

### 7.3 Example: Popup Embed (Button)

```jsx
{
  canScheduleInterview && employerCalendlyUrl && (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Schedule Interview</h2>
      <button
        type="button"
        onClick={() => window.Calendly?.initPopupWidget({ url: employerCalendlyUrl })}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#2CD2BD] text-white rounded-lg hover:bg-[#25b8a5] transition-colors"
      >
        <FaCalendarAlt className="w-4 h-4" />
        Open Calendly to Schedule
      </button>
    </section>
  );
}
```

### 7.4 Where `employerCalendlyUrl` Comes From

- From Employer profile: `currentUser?.calendlySchedulingUrl`
- From API: fetch via `/users/me` (OAuth) or from your backend if you store it

---

## 8. Step 6: Store Employer Calendly URL (Optional)

To avoid calling the Calendly API on every page load:

1. Add a `calendlySchedulingUrl` field to the Employer/User model in JobLoom-BE.
2. Add an employer settings page or profile section where they can paste their Calendly link.
3. Validate that it’s a valid Calendly URL (e.g. `https://calendly.com/...`).
4. Persist it when they save their profile.
5. Return it in the user object so the frontend can use it in the embed.

**Backend example (User model):**

```javascript
calendlySchedulingUrl: { type: String, trim: true }
```

**Frontend:** Use `currentUser?.calendlySchedulingUrl` in the Application Detail page.

---

## 9. Step 7: Sync Bookings Back to JobLoom (Optional)

To update `interviewDate` on the Application when a Calendly event is created:

1. Create a [Calendly webhook subscription](https://developer.calendly.com/api-docs/YXUjcIwLt0YP-calendly-api/create-webhook-subscription).
2. Subscribe to `invitee.created` (and optionally `invitee.canceled`).
3. In the webhook handler:
   - Parse the event payload.
   - Map `invitee` (email or custom answers) to the JobLoom Application.
   - Call `PATCH /api/applications/:id/interview-date` with the event’s `start_time`.

**Webhook payload fields:** `event`, `payload`, `invitee`, `scheduled_event`, etc. See [Calendly Webhook Payloads](https://developer.calendly.com/api-docs/webhook-payloads).

---

## 10. Environment Variables

Add to **JobLoom-BE** `.env`:

```env
# Calendly (OAuth & Webhooks)
CALENDLY_CLIENT_ID=your_oauth_client_id
CALENDLY_CLIENT_SECRET=your_oauth_client_secret
CALENDLY_REDIRECT_URI=http://localhost:5173/auth/calendly/callback
CALENDLY_WEBHOOK_SIGNING_KEY=your_webhook_signing_key
```

Add to **JobLoom-App** `.env` (Client ID only):

```env
VITE_CALENDLY_CLIENT_ID=your_calendly_client_id
```

| Variable                       | Where    | Purpose                                         |
| ------------------------------ | -------- | ----------------------------------------------- |
| `CALENDLY_CLIENT_ID`           | BE + App | OAuth app identifier                            |
| `CALENDLY_CLIENT_SECRET`       | BE only  | OAuth token exchange (never expose to frontend) |
| `CALENDLY_REDIRECT_URI`        | BE       | OAuth callback URL                              |
| `CALENDLY_WEBHOOK_SIGNING_KEY` | BE only  | Verify Calendly webhook signatures              |

For embed-only usage (no API/OAuth), you only need the employer's `scheduling_url` in their profile; no env vars are required.

---

## 11. References

- [Calendly: How to display the scheduling page](https://developer.calendly.com/how-to-display-the-scheduling-page-for-users-of-your-app)
- [Calendly API Reference](https://developer.calendly.com/api-docs)
- [Calendly Advanced Embed Options](https://help.calendly.com/hc/en-us/articles/223195488-Calendly-Embed-Options) (UTM, prefill, etc.)
- [Calendly Webhooks](https://developer.calendly.com/api-docs/YXUjcIwLt0YP-calendly-api/create-webhook-subscription)

---

## Quick Implementation Checklist

- [ ] Add Calendly script to `index.html` or load dynamically
- [ ] Add `calendlySchedulingUrl` to Employer/User model (optional)
- [ ] Add employer settings UI to save Calendly URL (optional)
- [ ] Replace Schedule Interview section in `ApplicationDetailPage.jsx` with Calendly embed
- [ ] Choose embed type: Inline, Popup, or Badge
- [ ] Use `prefill` to pass applicant name/email if desired
- [ ] (Optional) Set up Calendly webhooks to sync bookings to `interviewDate`

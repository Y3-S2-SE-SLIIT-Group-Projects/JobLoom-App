/// <reference types="node" />

/**
 * Optional full-stack interview tests (Phase 14).
 *
 * Requires:
 * - Backend running and reachable at VITE_API_URL or E2E_API_URL (default http://localhost:3000/api)
 * - MongoDB with the same users/passwords as below
 *
 * Copy integration-style accounts into your test DB, or set:
 *   E2E_EMPLOYER_EMAIL / E2E_EMPLOYER_PASSWORD
 *   E2E_SEEKER_EMAIL / E2E_SEEKER_PASSWORD
 *
 * Run (single worker recommended — shared DB):
 *   E2E_EMPLOYER_EMAIL=employer@test.com E2E_EMPLOYER_PASSWORD=password123 \
 *   E2E_SEEKER_EMAIL=worker@test.com E2E_SEEKER_PASSWORD=password123 \
 *   npx playwright test e2e/interview-scheduling.spec.ts --workers=1
 *
 * If env vars are unset, tests skip so default `npm test` still passes.
 */

import { test, expect } from './fixtures';

const API_BASE = (
  process.env.VITE_API_URL ||
  process.env.E2E_API_URL ||
  'http://localhost:3000/api'
).replace(/\/$/, '');

const E2E_EMPLOYER_EMAIL = process.env.E2E_EMPLOYER_EMAIL;
const E2E_EMPLOYER_PASSWORD = process.env.E2E_EMPLOYER_PASSWORD;
const E2E_SEEKER_EMAIL = process.env.E2E_SEEKER_EMAIL;
const E2E_SEEKER_PASSWORD = process.env.E2E_SEEKER_PASSWORD;

const hasCreds = Boolean(
  E2E_EMPLOYER_EMAIL &&
    E2E_EMPLOYER_PASSWORD &&
    E2E_SEEKER_EMAIL &&
    E2E_SEEKER_PASSWORD
);

test.skip(
  !hasCreds,
  'Interview E2E: set E2E_EMPLOYER_EMAIL, E2E_EMPLOYER_PASSWORD, E2E_SEEKER_EMAIL, E2E_SEEKER_PASSWORD (see file header)'
);

async function apiLogin(
  request: import('@playwright/test').APIRequestContext,
  email: string,
  password: string
) {
  const res = await request.post(`${API_BASE}/users/login`, {
    data: { email, password },
  });
  if (!res.ok()) return null;
  return res.json() as Promise<{
    token: string;
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role: string;
  }>;
}

async function persistAuth(
  page: import('@playwright/test').Page,
  session: Awaited<ReturnType<typeof apiLogin>>
) {
  if (!session?.token) return;
  const { token, _id, firstName, lastName, email, role } = session;
  const user = { _id, firstName, lastName, email, role };
  await page.addInitScript(
    ({ token: t, userJson, expiry }) => {
      localStorage.setItem('token', t);
      localStorage.setItem('user', userJson);
      localStorage.setItem('session_expiry', expiry);
    },
    {
      token,
      userJson: JSON.stringify(user),
      expiry: String(Date.now() + 24 * 60 * 60 * 1000),
    }
  );
}

test.describe('Interview scheduling E2E', () => {
  test.describe.configure({ mode: 'serial' });

  test('virtual: seeker sees Join, interview page loads Jitsi container (mocked script)', async ({
    page,
    request,
  }) => {
    const employer = await apiLogin(request, E2E_EMPLOYER_EMAIL!, E2E_EMPLOYER_PASSWORD!);
    const seeker = await apiLogin(request, E2E_SEEKER_EMAIL!, E2E_SEEKER_PASSWORD!);
    expect(employer?.token, 'employer login').toBeTruthy();
    expect(seeker?.token, 'seeker login').toBeTruthy();

    const jobRes = await request.post(`${API_BASE}/jobs`, {
      headers: { Authorization: `Bearer ${employer!.token}`, 'Content-Type': 'application/json' },
      data: {
        title: `E2E Interview ${Date.now()}`,
        description: 'Twenty character job description for E2E interview scheduling flow.',
        category: 'IT',
        employmentType: 'contract',
      },
    });
    expect(jobRes.ok(), `create job: ${jobRes.status()}`).toBeTruthy();
    const jobBody = await jobRes.json();
    const jobId = jobBody.data?._id ?? jobBody.data?.id ?? jobBody._id;
    expect(jobId, 'job id from API').toBeTruthy();

    const applyRes = await request.post(`${API_BASE}/applications`, {
      headers: { Authorization: `Bearer ${seeker!.token}`, 'Content-Type': 'application/json' },
      data: { jobId: String(jobId) },
    });
    expect(applyRes.ok(), `apply: ${applyRes.status()}`).toBeTruthy();
    const applyBody = await applyRes.json();
    const applicationId =
      applyBody.data?.application?._id ?? applyBody.data?.application?.id ?? applyBody.data?._id;
    expect(applicationId, 'application id').toBeTruthy();

    await request.patch(`${API_BASE}/applications/${applicationId}/status`, {
      headers: { Authorization: `Bearer ${employer!.token}`, 'Content-Type': 'application/json' },
      data: { status: 'shortlisted' },
    });

    const when = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const schedRes = await request.patch(`${API_BASE}/applications/${applicationId}/interview`, {
      headers: { Authorization: `Bearer ${employer!.token}`, 'Content-Type': 'application/json' },
      data: {
        interviewDate: when,
        interviewType: 'virtual',
        interviewDuration: 30,
      },
    });
    expect(schedRes.ok(), `schedule virtual: ${schedRes.status()}`).toBeTruthy();

    await page.route('**/external_api.js', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: `
          window.JitsiMeetExternalAPI = function (domain, options) {
            var el = options.parentNode;
            if (el) { el.innerHTML = '<div data-testid="jitsi-mock">mock-jitsi</div>'; }
            this.dispose = function () {};
          };
        `,
      });
    });

    await persistAuth(page, seeker);
    await page.goto(`/my-applications/${applicationId}`);
    await expect(page.getByRole('link', { name: /join interview/i })).toBeVisible({ timeout: 20_000 });
    await page.getByRole('link', { name: /join interview/i }).click();
    await expect(page).toHaveURL(new RegExp(`/interview/${applicationId}`));
    await expect(page.getByTestId('jitsi-container')).toBeVisible({ timeout: 25_000 });
    await expect(page.getByTestId('jitsi-mock')).toBeVisible({ timeout: 15_000 });
  });

  test('in-person: seeker sees Get Directions, no Join Interview link', async ({ page, request }) => {
    const employer = await apiLogin(request, E2E_EMPLOYER_EMAIL!, E2E_EMPLOYER_PASSWORD!);
    const seeker = await apiLogin(request, E2E_SEEKER_EMAIL!, E2E_SEEKER_PASSWORD!);

    const jobRes = await request.post(`${API_BASE}/jobs`, {
      headers: { Authorization: `Bearer ${employer!.token}`, 'Content-Type': 'application/json' },
      data: {
        title: `E2E InPerson ${Date.now()}`,
        description: 'Twenty character job description for in-person interview E2E.',
        category: 'IT',
        employmentType: 'part-time',
      },
    });
    expect(jobRes.ok()).toBeTruthy();
    const jobBody = await jobRes.json();
    const jobId = jobBody.data?._id ?? jobBody.data?.id ?? jobBody._id;

    const applyRes = await request.post(`${API_BASE}/applications`, {
      headers: { Authorization: `Bearer ${seeker!.token}`, 'Content-Type': 'application/json' },
      data: { jobId: String(jobId) },
    });
    expect(applyRes.ok()).toBeTruthy();
    const applyBody = await applyRes.json();
    const applicationId =
      applyBody.data?.application?._id ?? applyBody.data?.application?.id ?? applyBody.data?._id;

    await request.patch(`${API_BASE}/applications/${applicationId}/status`, {
      headers: { Authorization: `Bearer ${employer!.token}`, 'Content-Type': 'application/json' },
      data: { status: 'shortlisted' },
    });

    const when = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString();
    const schedRes = await request.patch(`${API_BASE}/applications/${applicationId}/interview`, {
      headers: { Authorization: `Bearer ${employer!.token}`, 'Content-Type': 'application/json' },
      data: {
        interviewDate: when,
        interviewType: 'in_person',
        interviewDuration: 45,
        interviewLocation: '123 Test Rd, Colombo',
      },
    });
    expect(schedRes.ok()).toBeTruthy();

    await persistAuth(page, seeker);
    await page.goto(`/my-applications/${applicationId}`);
    await expect(page.getByRole('link', { name: /get directions/i })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('link', { name: /join interview/i })).toHaveCount(0);
  });
});

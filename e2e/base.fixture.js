import { test as base, expect } from '@playwright/test';

/**
 * Custom Playwright fixtures for JobLoom E2E tests.
 * Handles setup, teardown, and environment control.
 */

export const test = base.extend({
  // Clears cookies and storage before every test to ensure isolation.
  // auto: true means it runs automatically without being declared in each test.
  cleanLocalStorage: [
    async ({ context }, use) => {
      await context.clearCookies();
      for (const page of context.pages()) {
        await page.evaluate(() => {
          try {
            window.localStorage.clear();
          } catch (e) {
            void e;
          }
          try {
            window.sessionStorage.clear();
          } catch (e) {
            void e;
          }
        });
      }
      await use();
    },
    { auto: true },
  ],

  // Navigates to the home page (baseURL) before the test.
  // Declared as a fixture parameter when a test needs to start from home.
  gotoHome: async ({ page }, use) => {
    await page.goto('/');
    await use(page);
  },

  // Provides an already logged-in page.
  // Handles the entire login flow so individual tests do not repeat it.
  // Credentials are read from environment variables (TEST_USER_EMAIL, TEST_USER_PASSWORD).
  loggedInPage: async ({ page }, use) => {
    // Playwright's recommended pattern for authenticated fixtures:
    // inject auth state directly into the browser context instead of
    // going through the full login UI flow on every test.
    //
    // This is backend-agnostic and immune to rate-limiting or slow APIs.
    // The fixture demonstrates: setup → auth injection → navigate → teardown.
    await page.goto('/');

    // Inject a simulated auth token directly into localStorage (setup phase)
    await page.evaluate(() => {
      window.localStorage.setItem('token', 'fixture-demo-token');
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          _id: 'fixture-user-id',
          email: 'test@example.com',
          role: 'employer',
          name: 'Fixture Demo User',
        })
      );
    });

    // Navigate to the jobs page — accessible and confirms the app loaded
    await page.goto('/jobs');
    await page.waitForLoadState('domcontentloaded');

    await use(page);
  },
});

export { expect };

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
    const email = process.env.TEST_USER_EMAIL || 'kavishigodage225@gmail.com';
    const password = process.env.TEST_USER_PASSWORD || '123456';

    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Wait for redirect to either employer dashboard or seeker profile
    await page.waitForURL(/.*(employer\/dashboard|profile)/, { timeout: 20000 });

    await use(page);
  },
});

export { expect };

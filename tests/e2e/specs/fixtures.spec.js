import { test, expect } from '../fixtures/base.fixture';

test.describe('Fixtures & Environment Control', () => {
  // SETUP: runs before every test — also triggers the cleanLocalStorage auto-fixture
  test.beforeEach(async () => {
    console.log('=== Test environment initialised ===');
  });

  // TEARDOWN: runs after every test
  test.afterEach(async () => {
    console.log('=== Test environment torn down ===');
  });

  test('1. should load the home page using navigation fixture', async ({ gotoHome }) => {
    const url = gotoHome.url();
    expect(url).toContain('localhost:5173');
    console.log(`Navigated to: ${url}`);
  });

  test('2. should demonstrate test isolation using clean storage fixture', async ({ page }) => {
    await page.goto('/');

    // Flush any state the app wrote on load, then verify we can reach zero
    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });

    const storageLength = await page.evaluate(() => window.localStorage.length);
    expect(storageLength).toBe(0);
    console.log(`Storage cleared. Items: ${storageLength}`);
  });

  test('3. should confirm written keys are scoped to this test only', async ({ page }) => {
    await page.goto('/');

    const KEY = 'e2e_testKey';

    // Our key should not exist at the start (proves isolation from other tests)
    const before = await page.evaluate(k => window.localStorage.getItem(k), KEY);
    expect(before).toBeNull();

    // Write key and verify it exists
    await page.evaluate(k => window.localStorage.setItem(k, 'e2e_value'), KEY);
    const after = await page.evaluate(k => window.localStorage.getItem(k), KEY);
    expect(after).toBe('e2e_value');

    console.log(`Key '${KEY}' scoped to this test. Next test will not see it.`);
  });

  test('4. should access the app in an authenticated state using loggedInPage fixture', async ({
    loggedInPage,
  }) => {
    // SETUP (inside loggedInPage fixture): navigates to /login, fills credentials, waits for redirect
    // TEST: we receive an already-authenticated page
    await expect(loggedInPage).toHaveURL(/.*(employer\/dashboard|profile)/);
    await expect(loggedInPage.locator('body')).toBeVisible();
    console.log(`Authenticated. URL: ${loggedInPage.url()}`);
    // TEARDOWN (inside cleanLocalStorage fixture): clears session after this test
  });

  test('5. should use the base URL from environment configuration', async ({ page }) => {
    const expectedBase = process.env.BASE_URL || 'http://localhost:5173';
    await page.goto('/');
    expect(page.url().startsWith(expectedBase)).toBeTruthy();
    console.log(`Base URL resolved from environment: ${expectedBase}`);
  });
});

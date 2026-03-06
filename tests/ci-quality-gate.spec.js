import { test, expect } from '@playwright/test';

test.describe('CI/CD Quality Gate Demo (Member 4)', () => {
  test('app loads and serves a valid HTML page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('login page is reachable', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('unknown route serves the SPA shell (not a 404 page)', async ({ page }) => {
    const response = await page.goto('/some-unknown-route-xyz');
    expect(response?.status()).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  });
});

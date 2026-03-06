import { test, expect } from './fixtures';

/**
 * DEMO TEST - Intentionally fails to verify:
 * - Trace Viewer (trace: 'on-first-retry')
 * - Screenshots (screenshot: 'only-on-failure')
 * - Video (video: 'retain-on-failure')
 *
 * Run: npx playwright test demo-failure-on-purpose
 * Then: npm run test:trace  (opens trace from test-results/)
 * Delete this file after verification.
 */
test.describe('Demo: Failure artifacts (delete after verification)', () => {
  test('intentionally fails to capture trace, screenshot, and video', async ({ page }) => {
    await page.goto('/jobs');
    await expect(page.locator('h1')).toBeVisible();

    // Force failure - remove this line after verifying artifacts
    expect(true, 'Intentional failure to demo trace/screenshot/video capture').toBe(false);
  });
});

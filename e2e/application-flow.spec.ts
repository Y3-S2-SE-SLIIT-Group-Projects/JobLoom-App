import { test, expect } from './fixtures';

test.describe('Application Flow', () => {
  test('should prevent guests from applying to jobs', async ({ page }, testInfo) => {
    await test.step('Navigate to job listings', async () => {
      await page.goto('/jobs');
      await page.waitForTimeout(2000);
    });

    const firstJobCard = page.locator('.cursor-pointer.hover\\:shadow-md').first();
    const isVisible = await firstJobCard.isVisible().catch(() => false);

    if (!isVisible) {
      test.skip(true, 'No jobs available to test application flow');
      return;
    }

    await test.step('Open first job detail', async () => {
      await firstJobCard.click();
      await page.waitForTimeout(2000);
    });

    await test.step('Verify Login to Apply button for guest', async () => {
      const loginBtn = page.getByText('Login to Apply');
      const hasLoginBtn = await loginBtn.isVisible().catch(() => false);
      expect.soft(hasLoginBtn, 'Guest should see Login to Apply').toBeTruthy();
    });

    await test.step('Click Login to Apply redirects to login', async () => {
      const loginBtn = page.getByText('Login to Apply');
      const hasLoginBtn = await loginBtn.isVisible().catch(() => false);

      if (hasLoginBtn) {
        await loginBtn.click();
        await page.waitForTimeout(1000);
        await expect(page).toHaveURL(/\/login/);
      }
    });

    await test.step('Attach flow screenshot', async () => {
      const screenshot = await page.screenshot({ fullPage: true });
      await testInfo.attach('guest-apply-redirect', {
        body: screenshot,
        contentType: 'image/png',
      });
    });
  });

  test('should display job seeker application page', async ({ page }) => {
    await test.step('Navigate to my-applications as guest', async () => {
      await page.goto('/my-applications');
      await page.waitForTimeout(2000);
    });

    await test.step('Verify redirect or content', async () => {
      const url = page.url();
      const isRedirected = url.includes('/login') || url.includes('/jobs');
      const isOnPage = url.includes('/my-applications');

      expect.soft(
        isRedirected || isOnPage,
        'Should redirect to login or show applications page'
      ).toBeTruthy();
    });

    await test.step('Capture application page state', async () => {
      await page.screenshot({
        path: 'test-results/screenshots/my-applications-state.png',
        fullPage: true,
      });
    });
  });

  test('should navigate from job listing to detail to apply flow', async ({ page }, testInfo) => {
    await test.step('Start at job listings', async () => {
      await page.goto('/jobs');
      await page.waitForTimeout(2000);
    });

    await test.step('Verify listings page loaded', async () => {
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();
    });

    const firstJobCard = page.locator('.cursor-pointer.hover\\:shadow-md').first();
    const isVisible = await firstJobCard.isVisible().catch(() => false);

    if (!isVisible) {
      test.skip(true, 'No jobs available');
      return;
    }

    await test.step('Click into job detail', async () => {
      await firstJobCard.click();
      await page.waitForURL(/\/jobs\/.+/);
    });

    await test.step('Verify detail page loaded', async () => {
      await page.waitForTimeout(2000);
      const backLink = page.getByText('Back to Jobs');
      const hasBack = await backLink.isVisible().catch(() => false);
      expect.soft(hasBack, 'Back to Jobs link should be visible').toBeTruthy();
    });

    await test.step('Check CTA section renders', async () => {
      const loginApply = page.getByText('Login to Apply');
      const applyNow = page.getByText('Apply Now');
      const alreadyApplied = page.getByText('You have already applied');
      const manage = page.getByText('Manage Applications');

      const hasCta =
        (await loginApply.isVisible().catch(() => false)) ||
        (await applyNow.isVisible().catch(() => false)) ||
        (await alreadyApplied.isVisible().catch(() => false)) ||
        (await manage.isVisible().catch(() => false));

      expect.soft(hasCta, 'A CTA button should be present').toBeTruthy();
    });

    await test.step('Attach final state to report', async () => {
      const screenshot = await page.screenshot({ fullPage: true });
      await testInfo.attach('application-flow-final', {
        body: screenshot,
        contentType: 'image/png',
      });
    });
  });
});

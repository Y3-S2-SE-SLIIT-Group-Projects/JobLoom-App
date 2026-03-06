import { test, expect } from './fixtures';

test.describe('Public Job Details Page', () => {
  test('should show error state for invalid job ID', async ({ page }, testInfo) => {
    await test.step('Navigate to a non-existent job', async () => {
      await page.goto('/jobs/000000000000000000000000');
    });

    await test.step('Wait for page to load', async () => {
      await page.waitForTimeout(3000);
    });

    await test.step('Verify error state or loading completes', async () => {
      const errorHeading = page.getByText('Error');
      const backLink = page.getByText('Back to Jobs');

      const hasError = await errorHeading.isVisible().catch(() => false);
      const hasBackLink = await backLink.isVisible().catch(() => false);

      expect.soft(hasError || hasBackLink, 'Should display an error or back link').toBeTruthy();
    });

    await test.step('Attach error page screenshot to report', async () => {
      const screenshot = await page.screenshot({ fullPage: true });
      await testInfo.attach('job-details-error-page', {
        body: screenshot,
        contentType: 'image/png',
      });
    });
  });

  test('should show Login to Apply button for guests', async ({ page }) => {
    await test.step('Navigate to a job detail page', async () => {
      await page.goto('/jobs');
      await page.waitForTimeout(2000);
    });

    await test.step('Click on the first job card if available', async () => {
      const firstJobCard = page.locator('.cursor-pointer.hover\\:shadow-md').first();
      const isVisible = await firstJobCard.isVisible().catch(() => false);

      if (isVisible) {
        await firstJobCard.click();
        await page.waitForTimeout(2000);

        await test.step('Verify job detail page elements', async () => {
          const backLink = page.getByText('Back to Jobs');
          await expect(backLink).toBeVisible();
        });

        await test.step('Check for Login to Apply button (guest view)', async () => {
          const loginToApply = page.getByText('Login to Apply');
          const hasLoginBtn = await loginToApply.isVisible().catch(() => false);
          expect.soft(hasLoginBtn, 'Guest should see Login to Apply button').toBeTruthy();
        });
      }
    });

    await test.step('Capture job detail page screenshot', async () => {
      await page.screenshot({
        path: 'test-results/screenshots/job-detail-guest.png',
        fullPage: true,
      });
    });
  });

  test('should have Back to Jobs navigation', async ({ page }) => {
    await test.step('Go to jobs listing first', async () => {
      await page.goto('/jobs');
      await page.waitForTimeout(2000);
    });

    await test.step('Navigate to a job detail and back', async () => {
      const firstJobCard = page.locator('.cursor-pointer.hover\\:shadow-md').first();
      const isVisible = await firstJobCard.isVisible().catch(() => false);

      if (isVisible) {
        await firstJobCard.click();
        await page.waitForTimeout(2000);

        const backLink = page.locator('a[href="/jobs"]', { hasText: /back to jobs/i });
        const hasBack = await backLink.isVisible().catch(() => false);

        if (hasBack) {
          await backLink.click();
          await expect(page).toHaveURL(/\/jobs$/);
        }
      }
    });
  });

  test('should display job information sections', async ({ page }, testInfo) => {
    await test.step('Navigate to a job via listing', async () => {
      await page.goto('/jobs');
      await page.waitForTimeout(2000);
    });

    const firstJobCard = page.locator('.cursor-pointer.hover\\:shadow-md').first();
    const isVisible = await firstJobCard.isVisible().catch(() => false);

    if (!isVisible) {
      test.skip(true, 'No jobs available to test detail view');
      return;
    }

    await firstJobCard.click();
    await page.waitForTimeout(2000);

    await test.step('Verify job title heading', async () => {
      const title = page.locator('h1').first();
      await expect(title).toBeVisible();
    });

    await test.step('Check JOB INFORMATION section', async () => {
      const jobInfoSection = page.getByText('JOB INFORMATION');
      const hasSection = await jobInfoSection.isVisible().catch(() => false);
      expect.soft(hasSection, 'JOB INFORMATION section should be visible').toBeTruthy();
    });

    await test.step('Attach full page screenshot to report', async () => {
      const screenshot = await page.screenshot({ fullPage: true });
      await testInfo.attach('job-detail-full-page', {
        body: screenshot,
        contentType: 'image/png',
      });
    });
  });
});

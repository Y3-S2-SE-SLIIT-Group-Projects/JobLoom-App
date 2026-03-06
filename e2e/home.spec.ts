import { test, expect } from './fixtures';

test.describe('Public Job Listing (Homepage)', () => {
  test('should load the jobs page and display hero section', async ({ page }) => {
    await test.step('Navigate to the homepage', async () => {
      await page.goto('/');
      await page.waitForURL('**/jobs');
    });

    await test.step('Verify hero heading is visible', async () => {
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();
    });

    await test.step('Verify Explore Jobs button exists', async () => {
      const exploreBtn = page.locator('button', { hasText: /explore jobs/i });
      await expect(exploreBtn).toBeVisible();
    });

    await test.step('Capture homepage screenshot for report', async () => {
      await page.screenshot({
        path: 'test-results/screenshots/homepage-hero.png',
        fullPage: false,
      });
    });
  });

  test('should display the search form', async ({ page }) => {
    await page.goto('/jobs');

    await test.step('Verify search input is present', async () => {
      const searchForm = page.locator('form').first();
      await expect(searchForm).toBeVisible();
    });

    await test.step('Verify search button is present', async () => {
      const searchBtn = page.locator('button[type="submit"]').first();
      await expect(searchBtn).toBeVisible();
    });
  });

  test('should render job cards when jobs are available', async ({ page }) => {
    await page.goto('/jobs');

    await test.step('Wait for loading to finish', async () => {
      await page.waitForTimeout(3000);
    });

    await test.step('Check for job cards or empty state', async () => {
      const jobCards = page.locator('.cursor-pointer.hover\\:shadow-md');
      const noJobs = page.getByText(/no jobs found/i);

      const hasJobs = await jobCards.first().isVisible().catch(() => false);
      const hasEmpty = await noJobs.isVisible().catch(() => false);

      expect.soft(hasJobs || hasEmpty, 'Should show either job cards or empty state').toBeTruthy();
    });

    await test.step('Capture results screenshot', async () => {
      await page.screenshot({
        path: 'test-results/screenshots/job-listings.png',
        fullPage: true,
      });
    });
  });

  test('should navigate via Explore Jobs button', async ({ page }) => {
    await page.goto('/jobs');

    await test.step('Click Explore Jobs to scroll to search', async () => {
      const exploreBtn = page.locator('button', { hasText: /explore jobs/i });
      await exploreBtn.click();
      await page.waitForTimeout(500);
    });

    await test.step('Verify search section is in viewport', async () => {
      const searchForm = page.locator('form').first();
      await expect(searchForm).toBeVisible();
    });
  });
});

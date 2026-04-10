import { test, expect } from './fixtures';

const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000;

const createReview = ({
  id,
  reviewerId,
  revieweeId,
  rating,
  comment,
  reviewerType = 'job_seeker',
}: {
  id: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  reviewerType?: 'job_seeker' | 'employer';
}) => ({
  _id: id,
  reviewerId: {
    _id: reviewerId,
    firstName: reviewerType === 'employer' ? 'Alex' : 'Jamie',
    lastName: reviewerType === 'employer' ? 'Employer' : 'Seeker',
  },
  revieweeId: {
    _id: revieweeId,
    firstName: reviewerType === 'employer' ? 'Jamie' : 'Alex',
    lastName: reviewerType === 'employer' ? 'Seeker' : 'Employer',
  },
  jobId: {
    _id: 'job-001',
    title: 'Frontend Engineer',
  },
  reviewerType,
  rating,
  comment,
  wouldRecommend: true,
  communication: 4,
  punctuality: 4,
  workQuality: 4,
  createdAt: '2026-04-10T08:00:00.000Z',
  images: [],
});

test.describe('Review and Rating Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const user = {
        _id: 'user-123',
        firstName: 'Jamie',
        lastName: 'Seeker',
        email: 'jamie.seeker@example.com',
        role: 'job_seeker',
      };
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('session_expiry', String(Date.now() + 24 * 60 * 60 * 1000));
      localStorage.setItem('i18nextLng', 'en');
    });
  });

  test('shows rating summary and received reviews on my reviews page', async ({ page }) => {
    await page.route('**/api/reviews/stats/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            stats: {
              averageRating: 4.2,
              totalReviews: 5,
              ratingDistribution: { 5: 3, 4: 1, 3: 1, 2: 0, 1: 0 },
            },
          },
        }),
      });
    });

    await page.route('**/api/reviews/user/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            reviews: [
              createReview({
                id: 'review-rx-1',
                reviewerId: 'employer-777',
                revieweeId: 'user-123',
                rating: 4.5,
                comment: 'Great communication and strong ownership.',
                reviewerType: 'employer',
              }),
            ],
            pagination: { total: 1, pages: 1, page: 1 },
          },
        }),
      });
    });

    await page.route('**/api/reviews/sent/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { reviews: [], pagination: { total: 0, pages: 1, page: 1 } },
        }),
      });
    });

    await page.goto('/reviews/my');

    await expect(page.getByRole('heading', { name: /my reviews/i })).toBeVisible();
    await expect(page.getByText(/rating summary/i)).toBeVisible();
    await expect(page.getByText('4.2')).toBeVisible();
    await expect(page.getByText(/great communication and strong ownership/i)).toBeVisible();
  });

  test('submits a review with rating and redirects to reviewee profile', async ({ page }) => {
    let capturedPayload: any = null;

    await page.route('**/api/reviews', async route => {
      if (route.request().method() === 'POST') {
        capturedPayload = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              review: {
                ...createReview({
                  id: 'review-new-1',
                  reviewerId: 'user-123',
                  revieweeId: 'reviewee-999',
                  rating: 4,
                  comment: 'Very reliable and easy to work with.',
                }),
                revieweeId: { _id: 'reviewee-999', firstName: 'Alex', lastName: 'Employer' },
              },
            },
          }),
        });
        return;
      }

      await route.continue();
    });

    await page.route('**/api/reviews/stats/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            stats: {
              averageRating: 4.0,
              totalReviews: 1,
              ratingDistribution: { 5: 0, 4: 1, 3: 0, 2: 0, 1: 0 },
            },
          },
        }),
      });
    });

    await page.route('**/api/reviews/user/**', async route => {
      const url = new URL(route.request().url());
      const userId = url.pathname.split('/').pop();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            reviews: [
              createReview({
                id: 'review-new-1',
                reviewerId: 'user-123',
                revieweeId: userId || 'reviewee-999',
                rating: 4,
                comment: 'Very reliable and easy to work with.',
              }),
            ],
            pagination: { total: 1, pages: 1, page: 1 },
          },
        }),
      });
    });

    await page.goto('/reviews/submit?revieweeId=reviewee-999&jobId=job-001');
    await expect(page.getByRole('heading', { name: /write a review/i })).toBeVisible();

    const criteriaRows = page.locator('form .divide-y > div');
    await criteriaRows.nth(0).locator('button[aria-label="Rate 4 out of 5"]').click();
    await criteriaRows.nth(1).locator('button[aria-label="Rate 5 out of 5"]').click();

    await page.getByRole('button', { name: /^next$/i }).click();

    const comment = 'Very reliable and easy to work with.';
    await page.locator('textarea[name="comment"]').fill(comment);
    await page.getByRole('button', { name: /^next$/i }).click();

    const submitResponsePromise = page.waitForResponse(response => {
      return (
        response.url().includes('/api/reviews') &&
        response.request().method() === 'POST' &&
        response.status() === 201
      );
    });

    await page.getByRole('button', { name: /submit review/i }).click();
    await submitResponsePromise;

    await expect(page).toHaveURL(/\/reviews\/reviewee-999/, { timeout: 15_000 });
    await expect(page.getByText(/very reliable and easy to work with/i)).toBeVisible();

    expect(capturedPayload).toBeTruthy();
    expect(capturedPayload.revieweeId).toBe('reviewee-999');
    expect(capturedPayload.jobId).toBe('job-001');
    expect(capturedPayload.comment).toBe(comment);
    expect(capturedPayload.rating).toBe(4.5);
  });
});

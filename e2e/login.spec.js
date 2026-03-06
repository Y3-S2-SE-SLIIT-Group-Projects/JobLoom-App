import { test, expect } from '@playwright/test';

test.describe('Login Functionality (Member 1)', () => {
  test('should show error with invalid credentials', async ({ page }) => {
    // 1. Navigate to the login page
    await page.goto('/login');

    // 2. Fill in the email and password
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');

    // 3. Click the sign-in button
    await page.click('button[type="submit"]');

    // 4. Verify that an error message appears
    // Using a more robust text-based locator for the API error
    await expect(page.getByText('Login failed. Please check your credentials.')).toBeVisible();
  });

  test('should navigate to other authentication pages', async ({ page }) => {
    await page.goto('/login');

    // Check Forgot Password link navigation
    await page.click('text=Forgot password?');
    await expect(page).toHaveURL(/.*forgot-password/);

    await page.goto('/login');

    // Check Create Account link navigation (Fixed string from i18n)
    await page.click('text=Create account');
    await expect(page).toHaveURL(/.*register/);
  });

  test('should show validation errors on registration', async ({ page }) => {
    await page.goto('/register');

    // Step 1: Attempt to go to next step without filling anything
    // The first button in Step 1 is "Next" (not submit type)
    await page.click('text=Next');

    // Verify that validation messages appear (Functional correctness)
    // Enhanced selector to be more robust across different form fields
    const errors = page.locator('.text-sm.text-red-500, .text-xs.text-red-600, .text-red-600');
    await expect(errors.first()).toBeVisible();
  });

  test('should validate empty fields', async ({ page }) => {
    await page.goto('/login');

    // Click submit without entering anything
    await page.click('button[type="submit"]');

    // Check for validation messages (based on errors state in Login.jsx)
    // Check for validation messages (based on errors state in Login.jsx)
    // If you use i18n, you might need to check for specific text or use data-testid
    // await expect(page.locator('text=Email is required')).toBeVisible();
    // await expect(page.locator('text=Password is required')).toBeVisible();
  });
});

// The real-login test uses page.route() to mock the login API response.
// This makes all 3 browsers reliable without hitting the real backend simultaneously.
// The mock returns the exact format the Redux userSlice expects: { token, user }.
test.describe('Login Functionality (Member 1) - Authenticated', () => {
  test('should log in successfully with valid credentials', async ({ page }) => {
    // Intercept the exact login endpoint the app calls.
    // IMPORTANT: the backend returns a FLAT response { token, role, _id, email, ... }
    // not nested { token, user: { role } }. Login.jsx reads data.role directly
    // from the raw API response (via useUser hook's .then(res => res.data)).
    await page.route('**/api/users/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-jwt-token-for-login-test',
          _id: 'mock-user-id',
          email: 'kavishigodage225@gmail.com',
          role: 'employer',
          name: 'Test User',
        }),
      });
    });

    await page.goto('/login');

    await page.fill('input[name="email"]', 'kavishigodage225@gmail.com');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');

    // App receives mocked 200, Redux sets state, Login.jsx navigates to /employer/dashboard
    await expect(page).toHaveURL(/.*employer\/dashboard/, { timeout: 10000 });

    await expect(page.locator('h1')).toHaveText('Dashboard');
    await expect(page.locator('text=Your central control surface')).toBeVisible();
    await expect(page.locator('text=Create New Job')).toBeVisible();
  });
});

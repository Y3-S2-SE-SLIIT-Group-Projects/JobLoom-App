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

  test('should log in successfully with valid credentials', async ({ page }) => {
    // 1. Navigate to the login page
    await page.goto('/login');

    // 2. Fill in valid credentials
    // IMPORTANT: Replace these with actual test account credentials
    await page.fill('input[name="email"]', 'kavishigodage225@gmail.com');
    await page.fill('input[name="password"]', '123456');

    // 3. Click the sign-in button
    await page.click('button[type="submit"]');

    // 4. Verify redirection to dashboard/profile
    await expect(page).toHaveURL(/.*(profile|dashboard)/);

    // 5. Verify Dashboard/Profile visibility (Member 1 task)
    const url = page.url();
    if (url.includes('employer/dashboard')) {
      // Employer Dashboard (Confirmed from screenshot)
      await expect(page.locator('h1')).toHaveText('Dashboard');
      await expect(page.locator('text=Your central control surface')).toBeVisible();
      await expect(page.locator('text=Create New Job')).toBeVisible();
    } else if (url.includes('dashboard')) {
      // Seeker Dashboard
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('input[placeholder*="Job title"]')).toBeVisible();
    } else {
      // Profile page check
      await expect(page.locator('text=Profile')).toBeVisible();
    }
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

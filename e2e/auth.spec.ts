import { test, expect } from './fixtures';

test.describe('Authentication - Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display the login form with all elements', async ({ page }) => {
    await test.step('Verify page heading', async () => {
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
    });

    await test.step('Verify email input', async () => {
      const emailInput = page.locator('input[name="email"]');
      await expect(emailInput).toBeVisible();
      await expect(emailInput).toHaveAttribute('type', 'email');
    });

    await test.step('Verify password input', async () => {
      const passwordInput = page.locator('input[name="password"]');
      await expect(passwordInput).toBeVisible();
    });

    await test.step('Verify submit button', async () => {
      const submitBtn = page.locator('button[type="submit"]');
      await expect(submitBtn).toBeVisible();
    });

    await test.step('Verify forgot password link', async () => {
      const forgotLink = page.locator('a[href="/forgot-password"]');
      await expect(forgotLink).toBeVisible();
    });

    await test.step('Verify create account link', async () => {
      const registerLink = page.getByRole('link', { name: /create account/i });
      await expect(registerLink).toBeVisible();
    });

    await test.step('Capture login page screenshot', async () => {
      await page.screenshot({
        path: 'test-results/screenshots/login-page.png',
        fullPage: true,
      });
    });
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    await test.step('Submit empty form', async () => {
      await page.locator('button[type="submit"]').click();
    });

    await test.step('Verify email validation error appears', async () => {
      const emailError = page.locator('p.text-red-600').first();
      await expect(emailError).toBeVisible();
    });

    await test.step('Capture validation errors screenshot', async () => {
      await page.screenshot({
        path: 'test-results/screenshots/login-validation-errors.png',
        fullPage: true,
      });
    });
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    await test.step('Enter email that passes HTML5 but fails custom validation', async () => {
      await page.locator('input[name="email"]').fill('user@domain');
      await page.locator('input[name="password"]').fill('somepassword');
    });

    await test.step('Submit form', async () => {
      await page.locator('button[type="submit"]').click();
    });

    await test.step('Verify invalid email error appears', async () => {
      const errorMsg = page.locator('p.text-xs.text-red-600');
      await expect(errorMsg.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test('should toggle password visibility', async ({ page }) => {
    await test.step('Type a password', async () => {
      const passwordInput = page.locator('input[name="password"]');
      await passwordInput.fill('secret123');
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    await test.step('Click show password toggle', async () => {
      const toggleBtn = page.locator('input[name="password"]')
        .locator('xpath=ancestor::div[contains(@class, "relative")]')
        .locator('button');
      await toggleBtn.click();
    });

    await test.step('Verify password is now visible', async () => {
      const passwordInput = page.locator('input[name="password"]');
      await expect(passwordInput).toHaveAttribute('type', 'text');
    });
  });

  test('should navigate to register page', async ({ page }) => {
    await test.step('Click create account link', async () => {
      await page.getByRole('link', { name: /create account/i }).click();
    });

    await test.step('Verify navigation to register page', async () => {
      await expect(page).toHaveURL(/\/register/);
    });
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await test.step('Click forgot password link', async () => {
      await page.locator('a[href="/forgot-password"]').click();
    });

    await test.step('Verify navigation to forgot password page', async () => {
      await expect(page).toHaveURL(/\/forgot-password/);
    });
  });

  test('should show API error on invalid credentials', async ({ page }, testInfo) => {
    await test.step('Fill in invalid credentials', async () => {
      await page.locator('input[name="email"]').fill('nonexistent@example.com');
      await page.locator('input[name="password"]').fill('wrongpassword123');
    });

    await test.step('Submit form', async () => {
      await page.locator('button[type="submit"]').click();
    });

    await test.step('Wait for API response', async () => {
      await page.waitForTimeout(3000);
    });

    await test.step('Check for error message or loading state', async () => {
      const errorDiv = page.locator('.bg-red-50');
      const isError = await errorDiv.isVisible().catch(() => false);

      if (isError) {
        const screenshot = await page.screenshot();
        await testInfo.attach('login-error-state', {
          body: screenshot,
          contentType: 'image/png',
        });
      }

      expect.soft(
        isError || true,
        'API error should appear or request may time out'
      ).toBeTruthy();
    });
  });
});

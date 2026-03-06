# Playwright Testing – Fixtures & Setup/Teardown Mechanisms

**Quality Engineering | MERN Stack Project – JobLoom**

---

## What is this Feature?

Fixtures in Playwright are a way to **set up the environment before a test runs and clean up after it finishes**. They are the Playwright equivalent of `beforeEach()` and `afterEach()` hooks, but more powerful because they are reusable, composable, and scoped.

A fixture receives the test's parameters, runs setup code, hands control to the test via `await use()`, then runs teardown code after the test completes.

```
Setup   →   await use()   →   Teardown
```

---

## Files Created / Modified

### 1. `playwright.config.js` (root of `JobLoom-App`)

**Purpose:** The global configuration file for the entire Playwright test suite.

This file is the central place for environment control. It defines:

| Setting      | Value                                                   | Why                                                                                        |
| ------------ | ------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `testDir`    | `./tests/e2e/specs`                                     | Where Playwright looks for test files                                                      |
| `baseURL`    | `process.env.BASE_URL` or `http://localhost:5173`       | Makes tests environment-agnostic. Change one variable to run against staging or production |
| `timeout`    | 45 seconds per test                                     | Prevents tests hanging indefinitely                                                        |
| `retries`    | 1 locally, 2 on CI                                      | Reduces flakiness from transient failures                                                  |
| `trace`      | `on-first-retry`                                        | Records a trace when a test fails and is retried, for debugging                            |
| `screenshot` | `only-on-failure`                                       | Captures a screenshot automatically when a test fails                                      |
| `video`      | `on-first-retry`                                        | Records video when a test is retried                                                       |
| `projects`   | Chromium, Firefox, Webkit, Mobile Chrome, Mobile Safari | Enables cross-browser testing from one config                                              |
| `webServer`  | `npm run dev`                                           | Automatically starts the Vite dev server before tests run                                  |

---

### 2. `tests/e2e/fixtures/base.fixture.js`

**Purpose:** The central fixture file. Contains three custom fixtures that are shared across all test files in the project.

#### `cleanLocalStorage` — Auto Fixture (Setup + Teardown)

Runs **automatically before every single test** without being declared in the test. It:

- Clears all browser cookies from the context
- Clears `localStorage` and `sessionStorage` on all open pages

This ensures no state from a previous test (e.g. a cached auth token) affects the current test.

```js
// auto: true means it runs for every test without being declared
cleanLocalStorage: [
  async ({ context }, use) => {
    await context.clearCookies(); // setup
    await use(); // test runs here
    // (no teardown needed — next test gets a fresh context)
  },
  { auto: true },
];
```

#### `gotoHome` — Navigation Fixture

A fixture that navigates to the app's home page (`baseURL`) before handing the page to the test. Tests declare `{ gotoHome }` instead of writing `await page.goto('/')` themselves.

#### `loggedInPage` — Authenticated Session Fixture

Performs the full login flow (navigate → fill email → fill password → click submit → wait for redirect) and gives the test an already-authenticated page. Credentials are read from environment variables `TEST_USER_EMAIL` and `TEST_USER_PASSWORD`.

---

### 3. `tests/e2e/specs/fixtures.spec.js`

**Purpose:** The test file that demonstrates the Fixtures & Setup/Teardown feature.

It contains 5 tests, each proving a different aspect of the mechanism:

| Test                           | What it proves                                                                         |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| Test 1 – Navigation fixture    | `gotoHome` fixture handles browser launch and page navigation                          |
| Test 2 – Clean storage         | Storage can be wiped to a known-zero state, demonstrating isolation                    |
| Test 3 – Scoped keys           | A key written in one test does not exist at the start of the next                      |
| Test 4 – Authenticated fixture | `loggedInPage` fixture handles the full login flow before handing the page to the test |
| Test 5 – Environment config    | The `baseURL` is read from an environment variable, not hardcoded                      |

The file also uses `test.beforeEach()` and `test.afterEach()` **hooks** inside the `describe` block to demonstrate the traditional setup/teardown pattern alongside fixtures.

---

### 4. `tests/e2e/specs/login.spec.js`

**Purpose:** The existing login tests (written by Member 1) refactored to use the fixtures from `base.fixture.js`.

By importing `test` from `../fixtures/base.fixture` instead of `@playwright/test`, these tests automatically benefit from the `cleanLocalStorage` auto-fixture, ensuring they run in a clean state without any changes to the test logic itself.

---

### 5. `package.json` (updated scripts)

**Purpose:** Added three npm scripts to make running tests straightforward.

```json
"test:e2e"       : "playwright test"          // Run all E2E tests
"test:e2e:ui"    : "playwright test --ui"     // Open Playwright UI Mode
"test:e2e:debug" : "playwright test --debug"  // Step-through debug mode
```

---

## How Setup / Teardown Works in Playwright

### Traditional approach (hooks)

```js
test.beforeEach(async ({ page }) => {
  await page.goto('/login');
});

test.afterEach(async ({ page }) => {
  await page.evaluate(() => localStorage.clear());
});
```

### Playwright Fixture approach (this project)

```js
// In base.fixture.js
loggedInPage: async ({ page }, use) => {
    // == SETUP (beforeEach equivalent) ==
    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*(dashboard|profile)/);

    await use(page); // <-- test runs here

    // == TEARDOWN (afterEach equivalent) ==
    // nothing needed, cleanLocalStorage handles it
},
```

The fixture approach is preferred because the setup and teardown for a resource are **kept together in one place**, and the fixture can be reused by any test file.

---

## How to Run

> Make sure you are inside the `JobLoom-App` folder before running any command.

```bash
cd JobLoom-App
```

### Run only the fixture tests (fastest — Chromium only)

```bash
npx playwright test tests/e2e/specs/fixtures.spec.js --project=chromium
```

### Run all E2E tests across all browsers

```bash
npm run test:e2e
```

### Run in UI mode (interactive — good for demonstration)

```bash
npm run test:e2e:ui
```

### Run in debug mode (step through each action)

```bash
npm run test:e2e:debug
```

### View the HTML report after a run

```bash
npx playwright show-report
```

### Run a specific test by name

```bash
npx playwright test --grep "authenticated state" --project=chromium
```

---

## Key Concepts Demonstrated

- **Custom Fixtures** — reusable setup/teardown units defined with `base.extend({})`
- **Auto Fixtures** — fixtures that run for every test automatically (`{ auto: true }`)
- **`beforeEach` / `afterEach` hooks** — traditional setup/teardown inside a `describe` block
- **Test Isolation** — each test starts with clean cookies and storage
- **Environment Control** — `baseURL`, credentials, and behaviour driven by environment variables
- **Modular Design** — one fixture file (`base.fixture.js`) shared across the whole test suite

# Developer Guide

## Table of Contents

- [Overview](#overview)
- [Initial Setup](#initial-setup)
- [Git Hooks](#git-hooks)
  - [Pre-Commit Hook](#pre-commit-hook)
  - [Pre-Push Hook](#pre-push-hook)
  - [Commit Message Hook](#commit-message-hook)
- [Commit Message Guidelines](#commit-message-guidelines)
  - [Format](#format)
  - [Types](#types)
  - [Scopes](#scopes)
  - [Examples](#examples)
- [Development Workflow](#development-workflow)
- [Code Quality](#code-quality)
- [Troubleshooting](#troubleshooting)
- [Configuration](#configuration)

## Overview

This project uses automated git hooks to enforce code quality, security standards, and commit message conventions. All hooks are managed through Husky and run automatically during git operations.

**Protected Branches:** `main`, `develop`, `staging`

**Enforcement:**

- Code formatting and linting
- TypeScript type checking
- Package vulnerability scanning
- Conventional commit messages with issue tracking
- Force push protection

## Initial Setup

### For New Team Members

```bash
git clone <repository-url>
cd BlueBolt-Marketplace-BE
npm install
```

The `prepare` script in package.json automatically installs git hooks via Husky.

### Manual Hook Installation

If hooks are not working:

```bash
npm install
npx husky install
```

### Verify Installation

```bash
ls -la .husky/
# Should show: pre-commit, pre-push, commit-msg
```

## Git Hooks

### Pre-Commit Hook

Runs before each commit is created.

**Checks Performed:**

1. Code formatting (Prettier) on staged files
2. Linting (ESLint) on staged files - catches unused variables/imports
3. TypeScript type checking on entire project
4. Package vulnerability scanning (moderate severity and above)

**Process:**

```bash
git commit -m "feat(api): add endpoint #AUTH123"
```

The hook automatically:

- Formats and fixes staged files only (fast operation)
- Validates TypeScript across the project
- Scans dependencies for security vulnerabilities

**Result:**

- ✅ All checks pass: Commit is created
- ✗ Any check fails: Commit is blocked, fix required

**Location:** `.husky/pre-commit`

### Pre-Push Hook

Runs before pushing to remote repository.

**Protection:**

1. **Force Push Detection** - Blocks non-fast-forward pushes to protected branches
2. **Direct Push Warning** - Requires confirmation for direct pushes to protected branches

**Protected Branches:**

- `main` - Production branch
- `develop` - Development branch
- `staging` - Staging/QA branch

**Process:**

```bash
git push origin feature-branch
```

The hook checks:

- Is this a force push attempt to a protected branch?
- Is this a direct push to a protected branch?

**Result:**

- ✅ Standard push to feature branch: Proceeds
- ✗ Force push to protected branch: Blocked
- ⚠️ Direct push to protected branch: Requires confirmation

**Location:** `.husky/pre-push`

### Commit Message Hook

Validates commit messages against Conventional Commits specification.

**Validation:**

- Format compliance
- Valid type and scope
- Length constraints (10-72 characters)
- Issue tracking reference
- Case sensitivity
- Punctuation rules

**Process:**

```bash
git commit -m "feat(api): add user authentication #AUTH123"
```

The hook validates:

- Conventional Commits format
- Required issue ID
- Description formatting

**Result:**

- ✅ Valid format: Commit proceeds
- ✗ Invalid format: Detailed error message with examples

**Location:** `.husky/commit-msg`

## Commit Message Guidelines

### Format

```
<type>(<scope>[,<scope>...]): <description> #<issue-id>
```

**Components:**

- `type` - Category of change (required)
- `scope` - Area of codebase (optional, recommended)
- `description` - Brief explanation (required, 10-72 chars)
- `issue-id` - Jira/issue tracker reference (required)

### Types

| Type       | Purpose                    | Example                                                  |
| ---------- | -------------------------- | -------------------------------------------------------- |
| `feat`     | New feature                | `feat(api): add OAuth2 authentication #AUTH123`          |
| `fix`      | Bug fix                    | `fix(ui): resolve null pointer in user form #BUG456`     |
| `docs`     | Documentation only         | `docs: update API endpoint documentation #DOC789`        |
| `style`    | Code style/formatting      | `style(ui): reformat component files #STYLE101`          |
| `refactor` | Code restructuring         | `refactor(core): simplify error handling logic #TECH202` |
| `perf`     | Performance improvement    | `perf(db): optimize query with indexes #PERF303`         |
| `test`     | Test addition/modification | `test(api): add integration tests for auth #TEST404`     |
| `chore`    | Maintenance tasks          | `chore: update dependencies #MAINT505`                   |
| `ci`       | CI/CD changes              | `ci: configure GitHub Actions workflow #CI606`           |
| `build`    | Build system changes       | `build: update webpack configuration #BUILD707`          |
| `revert`   | Revert previous commit     | `revert: undo feature changes #REVERT808`                |

### Scopes

Scopes represent areas of the codebase:

| Scope    | Area                | Use Case                          |
| -------- | ------------------- | --------------------------------- |
| `api`    | Backend APIs        | REST endpoints, GraphQL resolvers |
| `ui`     | Frontend/UI         | Components, views, styling        |
| `db`     | Database            | Schema, migrations, queries       |
| `auth`   | Authentication      | Login, sessions, permissions      |
| `core`   | Business Logic      | Core domain logic                 |
| `infra`  | Infrastructure      | Deployment, cloud resources       |
| `config` | Configuration       | App settings, environment vars    |
| `test`   | Test Infrastructure | Test utilities, mocks             |
| `common` | Shared Code         | Utilities, helpers, constants     |
| `docs`   | Documentation       | README, guides, comments          |

**Multiple Scopes:**

Use comma-separated list without spaces:

```bash
git commit -m "feat(api,ui): add user profile endpoint and view #USER123"
```

### Examples

**Valid Commits:**

```bash
# Feature with single scope
git commit -m "feat(api): add user registration endpoint #AUTH123"

# Bug fix with scope
git commit -m "fix(ui): resolve button alignment in modal #BUG456"

# Documentation without scope
git commit -m "docs: update installation instructions #DOC789"

# Refactor with multiple scopes
git commit -m "refactor(api,db): optimize user query logic #TECH101"

# Performance improvement
git commit -m "perf(db): add composite index on user_orders #PERF202"
```

**Invalid Commits:**

```bash
# Too short
git commit -m "fix bug"
✗ Error: Too short, missing scope, missing issue ID

# Wrong capitalization
git commit -m "feat(api): Add endpoint #AUTH123"
✗ Error: Description must start with lowercase

# Missing issue ID
git commit -m "feat(api): add user endpoint"
✗ Error: Missing issue reference

# Invalid type
git commit -m "added(api): new endpoint #AUTH123"
✗ Error: Invalid type 'added', use 'feat'

# Period at end
git commit -m "fix(api): resolve error. #BUG123"
✗ Error: No period at end of description
```

### Rules

**Required:**

- Valid commit type from approved list
- Description between 10-72 characters
- Issue ID in format `#123` or `#PROJ123`
- Description starts with lowercase letter
- No period at end of description
- Use imperative mood ("add" not "added")

**Optional:**

- Scope (recommended for all except `docs`/`chore`)
- Multiple scopes with comma separation
- Multi-line commit body for detailed explanation

### Multi-line Commits

```bash
git commit
```

In your editor:

```
feat(api,db): implement user discount system #FEAT245

Implemented percentage-based discount calculation with the following:

- Added discount model and migration
- Created REST API endpoints for discount management
- Implemented business rules for discount application
- Added validation for edge cases (zero amounts, negative values)
- Updated integration tests

Relates to requirements in SPEC-245
```

**Note:** Only the first line (subject) is validated by the commit-msg hook.

## Development Workflow

### Standard Feature Development

```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/user-authentication

# 2. Make changes and commit frequently
git add src/auth/
git commit -m "feat(auth): add OAuth2 provider integration #AUTH123"

# 3. Push to remote
git push origin feature/user-authentication

# 4. Create pull request
# - Target: develop
# - Reviewers: Assign team members
# - Link: Include Jira ticket

# 5. After approval, merge via PR
# - Squash commits if needed
# - Delete feature branch after merge
```

### Hotfix Workflow

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-auth-fix

# 2. Make minimal fix
git add src/auth/validation.ts
git commit -m "fix(auth): prevent null pointer in token validation #BUG789"

# 3. Push and create PR to main
git push origin hotfix/critical-auth-fix

# 4. After merge to main, also merge to develop
```

### Working with Protected Branches

**Do not:**

- Force push to `main`, `develop`, or `staging`
- Push directly without pull request
- Bypass git hooks with `--no-verify`

**Do:**

- Use feature branches
- Create pull requests for review
- Let CI/CD validate changes
- Merge via approved PRs

## Code Quality

### Available Scripts

**Linting:**

```bash
npm run lint          # Auto-fix linting issues
npm run lint:check    # Check without fixing
```

**Type Checking:**

```bash
npm run type:check    # Validate TypeScript types
```

**Formatting:**

```bash
npm run format        # Format all files with Prettier
```

**Security:**

```bash
npm run audit:check   # Check vulnerabilities (moderate+)
npm audit             # Detailed vulnerability report
npm audit fix         # Attempt automatic fixes
```

**Testing:**

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:cov      # Run tests with coverage
npm run test:e2e      # Run end-to-end tests
```

**Build:**

```bash
npm run build         # Build production bundle
npm run start:dev     # Start development server
npm run start:prod    # Start production server
```

### Lint-Staged Configuration

The pre-commit hook uses lint-staged to process only staged files:

**TypeScript files (\*.ts):**

- ESLint with auto-fix
- Prettier formatting

**JSON/Markdown files:**

- Prettier formatting

Configuration in package.json:

```json
{
  "lint-staged": {
    "*.ts": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

### ESLint Rules

Key rules enforced:

- No unused variables
- No unused imports
- No explicit `any` type (warning)
- Prettier formatting compliance
- TypeScript type safety

Configuration: `eslint.config.mjs`

### TypeScript Configuration

Strict mode features:

- Strict null checks enabled
- No implicit any disabled (transitional)
- Force consistent casing in file names
- ES2023 target with NodeNext module resolution

Configuration: `tsconfig.json`

## Troubleshooting

### Pre-Commit Hook Issues

**Problem: Linting errors block commit**

```bash
# View errors
npm run lint:check

# Auto-fix issues
npm run lint

# Fix remaining issues manually
```

**Problem: TypeScript errors block commit**

```bash
# View all type errors
npm run type:check

# Common issues:
# - Missing type definitions
# - Incorrect type usage
# - Null/undefined not handled

# Fix errors in source files, then retry commit
```

**Problem: Vulnerability scan blocks commit**

```bash
# View details
npm audit

# Attempt automatic fix
npm audit fix

# For breaking changes
npm audit fix --force

# If vulnerabilities cannot be fixed:
# 1. Document the issue
# 2. Create a ticket to track
# 3. Consult senior engineer
# 4. May need to update .husky/pre-commit temporarily
```

### Commit Message Validation Issues

**Error: "Subject line doesn't match conventional commits format"**

Check:

- Format: `type(scope): description #ISSUE123`
- Description starts with lowercase
- No period at end
- Contains issue ID

**Error: "Invalid commit type"**

Use only approved types:

- `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`, `revert`

**Error: "Missing Jira ticket reference"**

Add issue ID at end:

- Format: `#AUTH123` or `#123`
- Must be uppercase letters and/or numbers
- Must start with `#`

**Error: "Subject line too short/long"**

- Minimum: 10 characters
- Maximum: 72 characters
- Be descriptive but concise

**Error: "Description should start with lowercase letter"**

After the colon, use lowercase:

- ✅ `feat(api): add endpoint #123`
- ✗ `feat(api): Add endpoint #123`

### Pre-Push Hook Issues

**Error: Force push blocked to protected branch**

This is intentional protection. Instead:

1. Create new branch from remote protected branch
2. Cherry-pick or merge your changes
3. Create pull request for review
4. Merge via approved PR

```bash
git checkout -b fix/merge-conflict
git cherry-pick <your-commits>
git push origin fix/merge-conflict
# Create PR
```

**Warning: Direct push to protected branch**

You'll be prompted for confirmation. Consider:

- Is a PR more appropriate?
- Have changes been reviewed?
- Is this an emergency hotfix?

If proceeding, type 'y' to confirm.

### Hooks Not Running

**Check installation:**

```bash
# Verify hooks exist
ls -la .husky/

# Reinstall if needed
npx husky install

# Verify hooks are executable
ls -l .husky/pre-commit .husky/pre-push .husky/commit-msg
# Should show: -rwxr-xr-x (executable)

# Make executable if needed
chmod +x .husky/pre-commit .husky/pre-push .husky/commit-msg
```

**Check git config:**

```bash
# Verify hooks path
git config core.hooksPath
# Should output: .husky
```

### Emergency: Bypassing Hooks

**WARNING:** Only use in genuine emergencies. Bypasses all quality checks.

```bash
git commit --no-verify -m "emergency: critical production fix"
git push --no-verify
```

**When to use:**

- Production is down
- Critical security patch needed immediately
- Blocker issue in deployment pipeline

**After emergency:**

- Create ticket to fix properly
- Add tests to prevent recurrence
- Document incident
- Review with team

## Configuration

### Commit Message Hook Configuration

Edit `.husky/commit-msg` to customize:

**Disable Jira requirement:**

```bash
REQUIRE_JIRA=false
```

**Adjust length constraints:**

```bash
MIN_LENGTH=10
MAX_LENGTH=72
```

**Modify allowed types:**

```bash
TYPES="feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert|hotfix"
```

**Modify allowed scopes:**

```bash
SCOPES="api|ui|db|auth|core|infra|config|test|common|docs|mobile|web"
```

**Change issue ID pattern:**

```bash
# Current: Uppercase letters and numbers
JIRA_PATTERN="([A-Z]{2,}[0-9]+|[0-9]+)"

# Example: Only numbers
JIRA_PATTERN="([0-9]+)"
```

### Pre-Commit Hook Configuration

Edit `.husky/pre-commit` to customize:

**Disable vulnerability check:**

```bash
# Comment out or remove:
# npm run audit:check || { ... }
```

**Change audit severity level:**

Edit `package.json`:

```json
{
  "scripts": {
    "audit:check": "npm audit --audit-level=high"
  }
}
```

Levels: `low`, `moderate`, `high`, `critical`

**Add additional checks:**

In `.husky/pre-commit`, add before final success message:

```bash
# Example: Run tests on staged files
echo "Running tests..."
npm test -- --findRelatedTests $(git diff --cached --name-only --diff-filter=ACM)
```

### Pre-Push Hook Configuration

Edit `.husky/pre-push` to customize:

**Modify protected branches:**

```bash
protected_branches=("main" "develop" "staging" "production")
```

**Disable direct push warning:**

Remove or comment out the "Additional check" section in `.husky/pre-push`

**Add additional validations:**

Before the final success message:

```bash
# Example: Ensure branch is up to date
echo "Checking if branch is up to date..."
git fetch origin
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
if [ $LOCAL != $REMOTE ]; then
    echo "⚠️  Branch is not up to date with remote"
    exit 1
fi
```

### Lint-Staged Configuration

Edit `lint-staged` section in `package.json`:

**Add file type:**

```json
{
  "lint-staged": {
    "*.ts": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"],
    "*.scss": ["stylelint --fix", "prettier --write"]
  }
}
```

**Change command order:**

```json
{
  "lint-staged": {
    "*.ts": ["prettier --write", "eslint --fix"]
  }
}
```

**Run tests on staged files:**

```json
{
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write",
      "jest --bail --findRelatedTests"
    ]
  }
}
```

### ESLint Configuration

Edit `eslint.config.mjs` to modify rules:

**Enable stricter type checking:**

```javascript
{
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',  // Change from 'off'
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
  }
}
```

**Add custom rules:**

```javascript
{
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'max-lines-per-function': ['warn', { max: 50 }],
  }
}
```

### TypeScript Configuration

Edit `tsconfig.json` for stricter checks:

**Enable strict mode:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## Best Practices

### Commits

- **One logical change per commit** - Easier to review and revert
- **Commit frequently** - Don't wait until end of day
- **Write clear descriptions** - Future you will thank you
- **Link to issues** - Enables traceability and context
- **Use imperative mood** - Commands, not past tense

### Branches

- **Create from latest develop** - Always start fresh
- **Use descriptive names** - `feature/user-auth` not `fix-stuff`
- **Keep branches short-lived** - Merge within days, not weeks
- **Delete after merge** - Keep repository clean
- **Sync frequently** - Pull from develop regularly

### Code Review

- **Review your own diff first** - Catch obvious issues
- **Test locally** - Don't rely on CI alone
- **Small PRs** - Easier to review, faster to merge
- **Respond to feedback** - Don't take it personally
- **Learn from reviews** - Improve your skills

### Security

- **Never commit secrets** - Use environment variables
- **Review dependencies** - Run audit regularly
- **Update promptly** - Don't ignore vulnerability warnings
- **Minimize dependencies** - Less attack surface
- **Use exact versions** - Avoid unexpected updates

### Testing

- **Write tests with features** - Not as afterthought
- **Test edge cases** - Null, empty, invalid inputs
- **Keep tests fast** - Slow tests get skipped
- **Mock external services** - Tests should be isolated
- **Maintain high coverage** - Aim for >80%

---

**Document Version:** 1.0  
**Last Updated:** February 6, 2026  
**Maintained By:** Development Team

# Contributing to JobLoom Frontend

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (optional)
- Git

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/Y3-S2-SE-SLIIT-Group-Projects/JobLoom-App.git
   cd JobLoom-App
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or with Docker
   make dev
   ```

## 📝 Commit Standards

This project uses [Conventional Commits](https://www.conventionalcommits.org/) with custom validation.

### Format

```
type(scope): description #TICKETID
```

### Valid Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `ci` - CI/CD changes
- `build` - Build system changes

### Scopes

- `ui` - User interface components
- `api` - API integration
- `auth` - Authentication/Authorization
- `core` - Core functionality
- `config` - Configuration
- `test` - Testing
- `docs` - Documentation

### Examples

```bash
# Using git alias (validates before running hooks)
git cm "feat(ui): add job search filters #UI123"
git cm "fix(api): resolve timeout issues #BUG456"
git cm "docs: update setup instructions #DOC789"

# Traditional way
git commit -m "refactor(core): improve state management #TECH101"
```

## 🔄 Git Workflow

### Branch Naming

```
feature/component-name    # New features
bugfix/issue-description  # Bug fixes
hotfix/critical-fix       # Critical production fixes
docs/documentation-topic  # Documentation updates
```

### Pull Request Process

1. **Create a feature branch**

   ```bash
   git checkout -b feature/job-listings
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

3. **Test your changes**

   ```bash
   npm run lint
   npm run format:check
   npm run build
   npm run test
   ```

4. **Commit with proper format**

   ```bash
   git cm "feat(ui): implement job listing component #FEAT001"
   ```

5. **Push to your branch**

   ```bash
   git push origin feature/job-listings
   ```

6. **Create Pull Request**
   - Use a clear, descriptive title
   - Reference related issues
   - Describe what changed and why
   - Add screenshots for UI changes

## 🧪 Testing

### Run Tests Locally

```bash
# Unit tests
npm run test

# Lint checks
npm run lint

# Format check
npm run format:check

# Build check
npm run build
```

### Docker Testing

```bash
# Test production build
make prod-build

# Test health check
curl http://localhost:8080/health
```

## 🎨 Code Style

### JavaScript/React

- Use functional components with hooks
- Use arrow functions for components
- Destructure props
- Use meaningful variable names
- Keep components small and focused
- Use PropTypes or TypeScript (when added)

```javascript
// Good
const JobCard = ({ title, location, salary }) => {
  return (
    <div className="job-card">
      <h3>{title}</h3>
      <p>{location}</p>
      <span>{salary}</span>
    </div>
  );
};

// Avoid
function JobCard(props) {
  return (
    <div className="job-card">
      <h3>{props.title}</h3>
      ...
    </div>
  );
}
```

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Keep custom CSS minimal
- Use CSS modules for component-specific styles

### File Structure

```
src/
├── components/      # Reusable components
│   ├── common/      # Shared components (Button, Input, etc.)
│   └── features/    # Feature-specific components
├── pages/           # Page components
├── context/         # React Context for state management
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── services/        # API services
└── assets/          # Images, icons, etc.
```

## 📚 Documentation

### When to Update Docs

- Adding new features
- Changing API integration
- Updating environment variables
- Modifying build/deploy process
- Adding new scripts

### Documentation Files

- `README.md` - Project overview and quick start
- `DOCKER_CI_GUIDE.md` - Docker and CI/CD details
- Code comments - Complex logic explanations

## 🚨 Pre-commit Hooks

The project uses Husky to run checks before commits:

1. **Lint-staged** - Runs ESLint on staged files
2. **Type check** - Validates TypeScript (when added)
3. **Audit check** - Checks for vulnerabilities
4. **Commit message validation** - Validates conventional commit format

If hooks fail:

```bash
# Fix issues
npm run lint -- --fix
npm run format

# Or skip hooks (not recommended)
git commit --no-verify
```

## 🐛 Reporting Bugs

Create an issue with:

- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Browser/environment details

## 💡 Suggesting Features

Create an issue with:

- Feature description
- Use case/problem it solves
- Proposed solution
- Alternative solutions considered

## ❓ Questions?

- Check existing documentation
- Search closed issues
- Ask in team discussions
- Contact team leads

## 🏆 Recognition

Contributors will be acknowledged in the project README!

---

**Thank you for contributing to JobLoom! 🎉**

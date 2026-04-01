# 🚀 JobLoom App - CI/CD & Docker Guide

## 📦 Docker Setup

### Quick Start

#### Using Makefile (Recommended)

```bash
# Development
make dev              # Start dev environment
make dev-build        # Build and start

# Production
make prod             # Start prod environment
make prod-build       # Build and start

# Test
make test             # Run tests
make test-build       # Build and test

# Staging
make staging          # Start staging environment

# Utilities
make logs             # View logs
make shell            # Open shell
make clean            # Clean up
make help             # Show all commands
```

#### Using Docker Compose Directly

**Development Mode**

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
# Access at http://localhost:5173
```

**Production Mode**

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
# Access at http://localhost:8080
```

**Test Mode**

```bash
docker-compose -f docker-compose.yml -f docker-compose.test.yml up --abort-on-container-exit
# Runs tests and exits
```

**Staging Mode**

```bash
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up
# Access at http://localhost:8081
```

### Manual Docker Commands

#### Build Development Image

```bash
docker build -t jobloom-app:dev --target development .
docker run -p 5173:5173 -v $(pwd):/app -v /app/node_modules jobloom-app:dev
```

#### Build Production Image

```bash
docker build -t jobloom-app:prod --target production .
docker run -p 8080:80 jobloom-app:prod
```

#### Health Check

```bash
# Check if production container is healthy
curl http://localhost:8080/health
```

## 🔄 CI/CD Pipeline

### Pipeline Overview

The CI pipeline runs automatically on:

- **Push** to `main`, `staging`, or `develop` branches
- **Pull requests** targeting these branches

Production CD is handled separately by `.github/workflows/cd-release.yml`:

- Automatic deploy when a GitHub Release is published
- Manual trigger from GitHub Actions with registry and deploy controls

### Pipeline Stages

#### 1. **Code Quality** (~3-5 min)

- ✅ ESLint checks
- ✅ Prettier formatting validation
- ✅ Security audit

#### 2. **Tests** (~5-10 min)

- ✅ Unit tests
- ✅ E2E tests
- ✅ Coverage reports

#### 3. **Build** (~3-5 min)

- ✅ Vite production build
- ✅ Build artifact validation
- ✅ Upload artifacts for deployment

#### 4. **Docker** (~5-8 min)

- ✅ Multi-stage Docker build
- ✅ Image security scanning
- ✅ Container health checks

#### 5. **Performance** (PR only)

- ✅ Lighthouse performance audit
- ✅ Bundle size analysis

#### 6. **Security** (~2-3 min)

- ✅ Trivy vulnerability scanning
- ✅ Dependency audit

### Local CI Simulation

Run the same checks locally before pushing:

```bash
# 1. Code quality
npm run lint
npm run format:check
npm audit --audit-level=moderate

# 2. Tests
npm run test
npm run test:e2e

# 3. Build
npm run build

# 4. Docker build
docker build -t jobloom-app:test .
```

## 📝 Git Commit Standards

### Commit Message Format

```
type(scope): description #TICKETID
```

### Valid Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding/updating tests
- `chore` - Maintenance tasks
- `ci` - CI/CD changes
- `build` - Build system changes

### Examples

```bash
# Using custom alias (validates message first)
git cm "feat(ui): add login page #AUTH123"
git cm "fix(api): resolve authentication bug #BUG456"

# Or traditional (but lint runs even if message is invalid)
git commit -m "docs: update readme #DOC789"
```

## 🛠️ Available Scripts

### Development

```bash
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Production build
npm run preview          # Preview production build
```

### Code Quality

```bash
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run format:check     # Check formatting without changes
npm run type:check       # TypeScript type checking (placeholder)
npm run audit:check      # Security vulnerability audit
```

### Testing

```bash
npm run test             # Run unit tests (placeholder)
npm run test:e2e         # Run E2E tests (placeholder)
```

### Docker

````bash
# Using Makefile
make dev              # Development
make prod             # Production
make test             # Tests
make staging          # Staging

# Or use docker-compose directly
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
docker-compose -f docker-compose.yml -f docker-compose.test.yml up
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up

# Build specific target
docker build --target development -t jobloom:dev .
docker build --target production -t jobloom:prod .
```bash
# Copy the example file
cp .env.example .env

# Edit with your values
nano .env
````

Example `.env`:

````env
NODE_ENV=development
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=JobLoom
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEBUG=true
Create a `.env` file for local development:

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=JobLoom
VITE_APP_VERSION=1.0.0
````

For Docker:

```bash
# Development
docker run -p 5173:5173 \
  -e VITE_API_URL=http://localhost:3000 \
  jobloom-app:dev

# Production (environment variables are baked into build)
# Set them before building:
VITE_API_URL=https://api.jobloom.com npm run build
```

## 🚀 Deployment

### Production Build

```bash
# 1. Build the application
npm run build

# 2. Test the build locally
npm run preview

# 3. Build Docker image
docker build -t jobloom-app:v1.0.0 .

# 4. Run container
docker run -p 8080:80 jobloom-app:v1.0.0
```

### CI/CD Badges

Add to your README:

```markdown
![CI Pipeline](https://github.com/Y3-S2-SE-SLIIT-Group-Projects/JobLoom-App/workflows/CI%20Pipeline/badge.svg)
```

## 🧪 Testing Docker Locally

```bash
# Build image
docker build -t jobloom-test .

# Run container
docker run -d --name jobloom-test -p 8080:80 jobloom-test

# Check health
curl http://localhost:8080/health

# View logs
docker logs jobloom-test

# Stop and remove
docker rm -f jobloom-test
```

## 📊 Monitoring Build Performance

- **View CI runs**: Actions tab in GitHub
- **Build artifacts**: Available for 7 days
- **Coverage reports**: Uploaded to Codecov (if configured)
- **Security scans**: Available in Security tab

## 🔧 Troubleshooting

### Docker Build Fails

```bash
# Clear Docker cache
docker builder prune -a

# Rebuild without cache
docker build --no-cache -t jobloom-app .
```

### CI Pipeline Fails

1. Check the failed step in GitHub Actions
2. Run the same command locally
3. Fix the issue
4. Commit with proper format: `fix(ci): resolve build issue #BUG123`

### Port Already in Use

```bash
# Find process using port 5173 or 8080
lsof -i :5173
lsof -i :8080

# Kill the process
kill -9 <PID>
```

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Conventional Commits](https://www.conventionalcommits.org)

---

**Happy Coding! 🎉**

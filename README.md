# JobLoom App

A modern job marketplace application built with React, Vite, Redux Toolkit, and Tailwind CSS. Deployed on AWS EC2 with Docker and Nginx.

## Quick Start

### Development

```bash
# Clone the repository
git clone https://github.com/Y3-S2-SE-SLIIT-Group-Projects/JobLoom-App.git
cd JobLoom-App

# Install dependencies
npm install

# Start development server
npm run dev
```

### Docker (Recommended for Production)

```bash
# Development
make dev
# or
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Production
make prod
# or
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## Tech Stack

- **Frontend Framework**: React 19 with functional components and hooks
- **Build Tool**: Vite 7
- **State Management**: Redux Toolkit with React-Redux (slices: user, job, application, review)
- **Routing**: React Router v7
- **Styling**: Tailwind CSS 3 with custom design tokens
- **HTTP Client**: Axios with interceptors
- **Internationalization**: i18next (English, Sinhala, Tamil)
- **Rich Text Editor**: TipTap
- **Charts**: Recharts
- **Maps**: Google Places Autocomplete
- **Icons**: Lucide React, React Icons
- **Linting**: ESLint 9
- **Formatting**: Prettier 3
- **Git Hooks**: Husky with lint-staged
- **CI/CD**: GitHub Actions
- **Container**: Docker with multi-stage builds
- **Server**: Nginx (Production)
- **Testing**: Playwright (E2E), Lighthouse CI (Performance)

## Project Architecture

```
src/
├── assets/              # Static assets (images, etc.)
├── components/
│   ├── auth/            # ProtectedRoute, RegistrationForm
│   ├── applications/    # ApplyModal and related
│   ├── calendly/        # CalendlyPopupButton
│   ├── reviews/         # Review components (cards, forms, lists)
│   ├── ui/              # Shared UI (Spinner, SearchInput, FilterSelect, etc.)
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── ErrorBoundary.jsx
│   └── RouteErrorElement.jsx
├── constants/           # App-wide constants
├── hooks/               # Custom hooks (useUser, useJobs, useReviews, etc.)
├── layouts/             # AppLayout
├── locales/             # i18n translations (en, si, ta)
├── pages/
│   ├── admin/           # AdminDashboard, AdminUsers, AdminJobs
│   ├── auth/            # Login, Register, VerifyRegistration, ForgotPassword
│   ├── dashboard/       # Public job dashboard
│   ├── employer/        # Employer pages (jobs, applications, settings)
│   ├── profile/         # UserProfile, EditProfile, CompleteProfile
│   ├── reviews/         # UserReviewsPage, MyReviewsPage, SubmitReviewPage
│   └── seeker/          # MyApplications, SeekerApplicationDetail
├── router/
│   ├── index.jsx        # Router setup (createBrowserRouter)
│   └── routes/          # Route config per module
├── services/            # API service modules (api.js, applicationApi, reviewApi, etc.)
├── store/
│   ├── index.js         # Redux store configuration
│   └── slices/          # userSlice, jobSlice, applicationSlice, reviewSlice
├── styles/              # Tailwind design tokens (colors.css, typography.css)
├── utils/               # Utility functions
├── i18n.js              # i18next configuration
└── main.jsx             # App entry point (Redux Provider, RouterProvider)
```

## State Management

The app uses **Redux Toolkit** for global state management:

| Slice              | Purpose                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------- |
| `userSlice`        | Authentication (login, register, OTP, password reset), user profile, session management |
| `jobSlice`         | Job listings, filtering, pagination, employer job management                            |
| `applicationSlice` | Job applications, status tracking, interview management                                 |
| `reviewSlice`      | Reviews, ratings, statistics                                                            |

Custom hooks (`useUser`, `useJobs`, etc.) abstract Redux dispatch/selector patterns for cleaner component code.

## API Integration

A central Axios instance (`src/services/api.js`) handles all API communication:

- **Base URL**: Configured via `VITE_API_URL` environment variable
- **Request interceptor**: Automatically attaches JWT token from localStorage
- **Response interceptor**: Normalizes error responses
- **Service modules**: `applicationApi.js`, `reviewApi.js`, `adminApi.js`, `uploadApi.js`

Features consumed from the backend:

- User registration, login, OTP verification, password reset
- Job CRUD with search, filter, pagination
- Application submission, status tracking, withdrawal
- Review creation, updates, statistics, reporting
- Admin dashboard with user/job management
- File uploads (Cloudinary)
- AI-powered job description generation (Cohere)
- Video interviews (Jitsi)

## Session Management

- **Token Storage**: JWT stored in `localStorage` with `session_expiry` (24-hour TTL)
- **Login Flow**: User credentials → backend JWT → stored in localStorage → Redux state updated
- **Auto-logout**: Session expiry check on app load; clears token and redirects to login
- **Protected Routes**: `ProtectedRoute` component checks authentication and role-based access
  - Unauthenticated users → redirected to `/login`
  - Wrong role → redirected to home `/`
  - Supports `allowedRoles` prop for role-specific pages (employer, job_seeker, admin)
- **401 Handling**: API calls that return 401 trigger automatic logout with "Session expired" message
- **Logout**: Clears `token`, `user`, and `session_expiry` from localStorage and Redux store

## UI/UX

- **Tailwind CSS** with custom design tokens for consistent theming
- **Responsive design** using Tailwind utility classes (flex, grid, breakpoints)
- **Shared UI components**: Spinner, LoadingSpinner, SearchInput, FilterSelect, AdminPagination, AlertBanner, EmptyState, StatCard
- **Error handling**: ErrorBoundary (React errors), RouteErrorElement (routing errors), AlertBanner (inline errors/success)
- **Loading states**: Spinner for route transitions, LoadingSpinner for data fetching, skeleton components for reviews
- **Internationalization**: Multi-language support (English, Sinhala, Tamil) via i18next

## Available Scripts

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
npm run format:check     # Check formatting
npm run type:check       # TypeScript type checking
npm run audit:check      # Security audit
```

### Testing

```bash
npm test                 # Run Playwright E2E tests
npm run test:e2e         # Run E2E tests
npm run test:e2e:headed  # Run E2E tests with browser visible
npm run test:e2e:debug   # Debug E2E tests
npm run test:e2e:ui      # Playwright UI mode
npm run test:report      # View test report
npm run test:summary     # View test summary
npm run lighthouse       # Run Lighthouse audit
npm run lighthouse:mobile  # Lighthouse mobile audit
npm run lighthouse:desktop # Lighthouse desktop audit
```

### Docker (Using Makefile)

```bash
make dev                 # Development environment
make prod                # Production environment
make test                # Test environment
make staging             # Staging environment
make logs                # View logs
make shell               # Open shell in container
make clean               # Clean up containers
make help                # Show all commands
```

## Docker Environments

| Environment | Port | Command        | Description               |
| ----------- | ---- | -------------- | ------------------------- |
| Development | 5173 | `make dev`     | Hot reload, volume mounts |
| Production  | 8080 | `make prod`    | Nginx, optimized build    |
| Test        | 5174 | `make test`    | Run tests, auto-exit      |
| Staging     | 8081 | `make staging` | Production-like testing   |

## Environment Variables

| Variable                   | Description              | Default                   |
| -------------------------- | ------------------------ | ------------------------- |
| `NODE_ENV`                 | Environment mode         | development               |
| `VITE_APP_NAME`            | Application display name | JobLoom                   |
| `VITE_APP_VERSION`         | Application version      | 1.0.0                     |
| `VITE_API_URL`             | Backend API URL          | http://localhost:5000/api |
| `VITE_API_TIMEOUT`         | API request timeout (ms) | 30000                     |
| `VITE_MAPBOX_TOKEN`        | Mapbox API token (maps)  | _(optional)_              |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key      | _(optional)_              |
| `VITE_CALENDLY_CLIENT_ID`  | Calendly OAuth client ID | _(optional)_              |
| `VITE_ENABLE_ANALYTICS`    | Enable analytics         | false                     |
| `VITE_ENABLE_DEBUG`        | Enable debug mode        | true                      |
| `VITE_ENABLE_MOCK_API`     | Enable mock API          | false                     |
| `CHOKIDAR_USEPOLLING`      | Docker hot reload        | true                      |

For production Docker builds, `VITE_API_URL` is passed as a build argument.

## Testing

### E2E Tests (Playwright)

End-to-end tests cover full user flows using Playwright:

**Location:** `e2e/`

| Test File                  | Coverage                       |
| -------------------------- | ------------------------------ |
| `auth.spec.ts`             | Login, registration flows      |
| `home.spec.ts`             | Home page rendering            |
| `dashboard.spec.ts`        | Job dashboard, search, filters |
| `job-details.spec.ts`      | Job detail page                |
| `application-flow.spec.ts` | Application submission flow    |
| `login.spec.js`            | Login page validation          |

**Running E2E Tests:**

```bash
# Run all E2E tests
npm test

# Run with browser visible
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# View report after tests
npm run test:report
```

### CI Quality Gate

**Location:** `tests/ci-quality-gate.spec.js`

Smoke tests that verify the app builds and renders correctly:

- Home page loads
- Login page accessible
- SPA routing works for unknown routes

### Performance Testing (Lighthouse CI)

Lighthouse CI audits run on pull requests to track web performance metrics.

**Configuration:** `lighthouserc.js`

```bash
# Run Lighthouse audit
npm run lighthouse

# Mobile-specific audit
npm run lighthouse:mobile

# Desktop-specific audit
npm run lighthouse:desktop
```

### Backend Tests

For backend unit, integration, and performance testing documentation, see the [Backend README](https://github.com/Y3-S2-SE-SLIIT-Group-Projects/JobLoom-BE#testing) and [Backend Testing Guide](https://github.com/Y3-S2-SE-SLIIT-Group-Projects/JobLoom-BE/blob/main/docs/TESTING.md).

## Deployment

### Frontend Deployment (AWS EC2)

The frontend application is deployed on **AWS EC2** using Docker containers with Nginx.

**Platform:** AWS EC2 (Amazon Linux 2023)

**Setup Steps:**

1. Build the production Docker image (multi-stage: Node 20 build → Nginx Alpine)
2. Push the image to GitHub Container Registry (GHCR) or Docker Hub
3. GitHub Actions CD pipeline (`cd-release.yml`) deploys to EC2 via SSH
4. Nginx serves the static build with SPA routing and `/health` endpoint
5. Optional: Nginx reverse proxy on EC2 host for HTTPS with SSL certificates

**Docker Configuration:**

- Multi-stage `Dockerfile`: `builder` (Vite build) → `production` (Nginx Alpine)
- `docker/nginx.conf`: SPA fallback, static asset caching, gzip, security headers
- Docker Compose variants for dev, staging, prod, test

**Environment Variables for Production:**

| Variable             | Description                       |
| -------------------- | --------------------------------- |
| `VITE_API_URL`       | Backend API URL (build-time)      |
| `APP_HOST_PORT`      | Host port mapping (default: 8080) |
| `APP_CONTAINER_NAME` | Docker container name             |
| `NODE_ENV`           | production                        |

Secrets are managed via GitHub Actions secrets and EC2 `.env.prod` file — never committed to source.

**CI/CD Pipeline:**

The `cd-release.yml` workflow:

1. Triggers on GitHub Release publish or manual dispatch
2. Builds production Docker image with `VITE_API_URL` baked in
3. Pushes to GHCR/Docker Hub
4. SSHs into EC2, pulls image, deploys with docker-compose
5. Runs health check validation with auto-rollback on failure

See [CD Release AWS Guide](docs/CD_RELEASE_AWS_GUIDE.md) for detailed setup.

### Backend Deployment (Railway)

The backend API is deployed on **Render** with Docker.

See the [Backend README](https://github.com/Y3-S2-SE-SLIIT-Group-Projects/JobLoom-BE#deployment) for backend deployment details.

**Live URLs:**

- Deployed Frontend: `https://jobloom.dilzhan.com`
- Deployed Backend API: `https://jobloom.be.dilzhan.com`
- Swagger API Docs: `https://jobloom.be.dilzhan.com/api-docs`

## CI/CD Pipeline

The project includes a comprehensive CI/CD pipeline that runs on push to `main`, `staging`, and `develop` branches:

### Pipeline Stages

1. **Code Quality** - Linting, formatting, security audit
2. **Tests** - E2E tests
3. **Build** - Production build with artifacts
4. **Docker** - Multi-stage Docker build
5. **Performance** - Lighthouse audit (PR only)
6. **Security** - Trivy vulnerability scanning

See [Docker & CI/CD Guide](docs/DOCKER_CI_GUIDE.md) for detailed information.

## Git Commit Standards

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format
type(scope): description #TICKETID

# Examples
git cm "feat(ui): add login page #AUTH123"
git cm "fix(api): resolve authentication bug #BUG456"
git cm "docs: update readme #DOC789"
```

**Available types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`, `revert`

## Documentation

- [Docker & CI/CD Guide](docs/DOCKER_CI_GUIDE.md) - Comprehensive Docker and CI/CD documentation
- [Release CD to AWS Guide](docs/CD_RELEASE_AWS_GUIDE.md) - Auto release + manual deployment pipeline guide
- [Developer Guide](docs/DEVELOPER_GUIDE.md) - Development setup and guidelines
- [Playwright Fixtures Testing](PLAYWRIGHT_FIXTURES_TESTING.md) - E2E test fixtures documentation
- [Backend API Documentation](https://github.com/Y3-S2-SE-SLIIT-Group-Projects/JobLoom-BE) - Full backend API docs

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git cm "feat: add amazing feature #FEAT001"`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Team

Y3-S2-SE-SLIIT-Group-Projects — SLIIT SE Year 3 Semester 2

# 🎯 JobLoom App

A modern job marketplace application built with React, Vite, and Docker.

## �� Quick Start

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

## 📚 Documentation

- [Docker & CI/CD Guide](DOCKER_CI_GUIDE.md) - Comprehensive Docker and CI/CD documentation
- [Release CD to AWS Guide](docs/CD_RELEASE_AWS_GUIDE.md) - Auto release + manual deployment pipeline guide
- Backend API documentation: [Link to backend repo]

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 7
- **Styling**: CSS Modules
- **Linting**: ESLint 9
- **Formatting**: Prettier 3
- **Git Hooks**: Husky 8
- **CI/CD**: GitHub Actions
- **Container**: Docker, Docker Compose
- **Server**: Nginx (Production)

## 📦 Available Scripts

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

## 🐳 Docker Environments

| Environment | Port | Command        | Description               |
| ----------- | ---- | -------------- | ------------------------- |
| Development | 5173 | `make dev`     | Hot reload, volume mounts |
| Production  | 8080 | `make prod`    | Nginx, optimized build    |
| Test        | 5174 | `make test`    | Run tests, auto-exit      |
| Staging     | 8081 | `make staging` | Production-like testing   |

## 🔄 CI/CD Pipeline

The project includes a comprehensive CI/CD pipeline that runs on push to `main`, `staging`, and `develop` branches:

### Pipeline Stages

1. **Code Quality** - Linting, formatting, security audit
2. **Tests** - Unit tests, E2E tests
3. **Build** - Production build with artifacts
4. **Docker** - Multi-stage Docker build
5. **Performance** - Lighthouse audit (PR only)
6. **Security** - Trivy vulnerability scanning

See [CI/CD Guide](DOCKER_CI_GUIDE.md) for detailed information.

## 📝 Git Commit Standards

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

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git cm "feat: add amazing feature #FEAT001"`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

Y3-S2-SE-SLIIT-Group-Projects

---

**Built with ❤️ by SLIIT SE Team**

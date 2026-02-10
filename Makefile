# JobLoom App - Docker Management Makefile
# Quick commands for managing different environments

.PHONY: help dev prod test staging build clean logs shell

# Default target
help:
	@echo "JobLoom Docker Commands:"
	@echo "  make dev          - Start development environment"
	@echo "  make prod         - Start production environment"
	@echo "  make test         - Start test environment"
	@echo "  make staging      - Start staging environment"
	@echo "  make build-dev    - Build development image"
	@echo "  make build-prod   - Build production image"
	@echo "  make logs         - View container logs"
	@echo "  make shell        - Open shell in container"
	@echo "  make clean        - Remove containers and images"
	@echo "  make health       - Check production health"

# Development
dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up

dev-build:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

dev-down:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down

# Production
prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

prod-build:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

prod-down:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Test
test:
	docker compose -f docker-compose.yml -f docker-compose.test.yml up --abort-on-container-exit

test-build:
	docker compose -f docker-compose.yml -f docker-compose.test.yml up --build --abort-on-container-exit

test-down:
	docker compose -f docker-compose.yml -f docker-compose.test.yml down

# Staging
staging:
	docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d

staging-build:
	docker compose -f docker-compose.yml -f docker-compose.staging.yml up --build -d

staging-down:
	docker compose -f docker-compose.yml -f docker-compose.staging.yml down

# Build commands
build-dev:
	docker build --target development -t jobloom-app:dev .

build-prod:
	docker build --target production -t jobloom-app:prod .

# Utility commands
logs:
	docker logs -f jobloom-dev 2>/dev/null || docker logs -f jobloom-prod 2>/dev/null || docker logs -f jobloom-test

shell:
	docker exec -it jobloom-dev sh 2>/dev/null || docker exec -it jobloom-prod sh

health:
	@curl -f http://localhost:8080/health && echo "\n✅ Production health check passed" || echo "\n❌ Production health check failed"

# Clean up
clean:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down -v
	docker compose -f docker-compose.yml -f docker-compose.test.yml down -v
	docker compose -f docker-compose.yml -f docker-compose.staging.yml down -v
	docker image prune -f

clean-all: clean
	docker system prune -af --volumes
	@echo "✅ All Docker resources cleaned"

# Restart commands
restart-dev: dev-down dev

restart-prod: prod-down prod

restart-staging: staging-down staging

# Status check
status:
	@echo "=== Docker Containers ==="
	@docker ps -a | grep jobloom || echo "No JobLoom containers running"
	@echo "\n=== Docker Images ==="
	@docker images | grep jobloom || echo "No JobLoom images found"
	@echo "\n=== Docker Networks ==="
	@docker network ls | grep jobloom || echo "No JobLoom networks found"

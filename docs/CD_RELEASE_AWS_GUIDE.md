# JobLoom App CD Pipeline Guide (Release + Manual)

This guide explains how to run production CD with GitHub Actions, publish Docker images, and deploy to an AWS EC2 server.

## What this pipeline does

Workflow file: `.github/workflows/cd-release.yml`

Triggers:

- Automatic: when a GitHub Release is published
- Manual: from Actions -> CD Release Pipeline -> Run workflow

Flow:

1. Build production Docker image from `Dockerfile` (target `production`)
1. Push image to selected registry (`ghcr` or `dockerhub`)
1. Resolve immutable image digest from the pushed image
1. SSH into AWS EC2
1. Pull and deploy the exact digest with Docker Compose (no server-side image build)
1. Run post-deploy health validation and auto-rollback on failure

## Architecture and best-practice decisions

- Immutable image deployment: server always deploys a versioned image tag
- Immutable artifact pinning: deployment uses image digest (`image@sha256:...`)
- No-build on server: deployment uses `docker compose up --no-build --pull always`
- Separate trigger modes:
- Release mode: production-safe default (GHCR + deploy=true)
- Manual mode: supports controlled dry-runs and manual deploys
- Registry auth on server is explicit and scoped
- Build cache uses GitHub Actions cache for faster, stable builds

## Prerequisites

### 1. AWS EC2 host setup

Install Docker and Compose on EC2.

For Amazon Linux 2023 (recommended for your current server):

```bash
sudo dnf update -y
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user
```

Reconnect to SSH (or run `newgrp docker`), then verify:

```bash
docker --version
docker compose version
```

For Ubuntu/Debian servers, use apt-based Docker installation instead.

### 2. App directory on EC2

```bash
mkdir -p ~/jobloom-app
cd ~/jobloom-app
git clone https://github.com/Y3-S2-SE-SLIIT-Group-Projects/JobLoom-App.git .
```

Create production env file:

```bash
cp .env.prod.example .env.prod
nano .env.prod
```

Set at minimum:

- `NODE_ENV=production`
- `VITE_API_URL=<your-backend-api-url>`
- `APP_CONTAINER_NAME=jobloom-prod`
- `APP_HOST_PORT=8080` (or your desired port)
- Healthcheck and resource values as needed

Security group best practice:

- Open only required inbound ports (typically `80`/`443`)
- Restrict SSH (`22`) to your IP or VPN

### 3. GitHub repository secrets

Add these in GitHub -> Settings -> Secrets and variables -> Actions.

Required for AWS deploy:

- `AWS_EC2_HOST` (public DNS or IP)
- `AWS_EC2_USER` (for example `ec2-user` on Amazon Linux, `ubuntu` on Ubuntu)
- `AWS_EC2_SSH_KEY` (private key content)
- `AWS_EC2_PORT` (optional, default `22`)

Required for image build:

- `VITE_API_URL_PROD`

Registry secrets:

For GHCR deploy:

- `GHCR_USERNAME`
- `GHCR_PAT` (PAT with `read:packages` at minimum on deploy side)

For Docker Hub deploy:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

For Docker Hub push mode:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

## How to run the pipeline

### Automatic production deploy (recommended)

1. Merge ready code to `main`
1. Create and publish a GitHub Release (example tag: `v1.2.0`)
1. Workflow auto-runs and deploys

Release mode behavior:

- Registry defaults to GHCR
- Image tag uses release tag
- Deploy runs automatically

### Manual run

Go to Actions -> `CD Release Pipeline` -> `Run workflow` and set:

- `registry`: `ghcr` or `dockerhub`
- `image_tag`: optional override (for example `hotfix-2026-04-01`)
- `deploy`: true/false

Use cases:

- Build and push only: set `deploy=false`
- Emergency redeploy: set `deploy=true` with known good tag

## Deployment and rollback operations

### Check deployed container on EC2

```bash
cd ~/jobloom-app
docker ps
docker compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml logs -f app
curl -f http://localhost:${APP_HOST_PORT:-8080}/health
```

### Rollback to previous image

```bash
cd ~/jobloom-app
APP_IMAGE=<registry>/<repo>/jobloom-app:<previous-tag> docker compose \
  --env-file .env.prod \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  up -d --no-build --pull always app
```

The workflow now attempts automatic rollback to the previously running image when post-deploy health checks fail.

## Operational best practices after go-live

1. Release discipline

- Deploy to production only from signed-off release tags
- Keep one release note per deployment for auditability

1. Secret hygiene

- Rotate registry tokens and SSH keys regularly
- Use least privilege tokens (`read:packages` for pull-only token on server)

1. Health and monitoring

- Keep `/health` endpoint checks in load balancer and uptime checks
- Centralize container logs (CloudWatch, ELK, or similar)

1. Rollback readiness

- Keep at least last 3 image tags available
- Document rollback command in your runbook

1. Hardening

- Front with Nginx/ALB + TLS (ACM/Let's Encrypt)
- Restrict EC2 inbound rules and disable password SSH login

## Troubleshooting

Image pull fails:

- Verify server can authenticate to registry (`docker login`)
- Confirm image exists with expected tag

Deploy completes but app not healthy:

- Check `VITE_API_URL` and backend reachability
- Check container logs for Nginx or frontend config errors

Workflow cannot SSH:

- Validate `AWS_EC2_HOST`, user, key, and inbound security group rule for SSH

---

Next recommended improvement: add a staging environment with approval gates before production release deployment.

## After this: exact checklist

Complete these steps in order.

1. Create GitHub Actions secrets

- AWS_EC2_HOST
- AWS_EC2_USER
- AWS_EC2_SSH_KEY
- AWS_EC2_PORT (optional)
- VITE_API_URL_PROD
- GHCR_USERNAME
- GHCR_PAT
- DOCKERHUB_USERNAME (only if using Docker Hub)
- DOCKERHUB_TOKEN (only if using Docker Hub)

1. Verify EC2 runtime prerequisites

- Docker installed
- Docker Compose plugin installed
- App repository present at $HOME/jobloom-app
- .env.prod exists (only non-secret operational values are needed)

1. Run a manual pipeline test

- Open Actions -> CD Release Pipeline
- Run workflow with deploy=false
- Confirm image push succeeds

1. Run a manual deploy test

- Run workflow with deploy=true
- Confirm deploy job succeeds
- Confirm service health endpoint returns success

1. Run release-driven production test

- Create and publish a release tag (example v1.0.0)
- Confirm pipeline auto-runs
- Confirm deployed digest in workflow summary

1. Validate rollback behavior

- Deploy an intentionally broken image in a test window
- Confirm post-deploy health check fails
- Confirm workflow rolls back to previous running image

1. Enable production change controls

- Add required reviewers for production deployment in GitHub Environments
- Restrict release creation permissions to maintainers

## Quick verification commands on EC2

Run these after each deploy:

```bash
docker ps
docker compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml ps
docker compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml logs --tail=100 app
curl -f http://localhost:${APP_HOST_PORT:-8080}/health
```

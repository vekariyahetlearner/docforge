# Phase 14 — CI / CD Automation & Quality Gates

## Objective
Implement GitHub Actions continuous integration and continuous deployment (CI/CD) workflows in `infrastructure/github/workflows/` to automatically enforce formatting, type checking, unit tests, integration tests with headless LibreOffice, Docker container builds, and security scans on every pull request and merge to `main`.

## Why This Phase Exists
Manual quality assurance cannot keep pace with active software development. Without automated CI/CD gates, regressions in conversion logic, broken dependencies, syntax errors, or failing tests slip into production branches. Phase 14 establishes automated verification for every code change, ensuring that the `main` branch is always stable, deployable, and verified.

## Scope

### In Scope
- GitHub Actions CI workflow (`.github/workflows/ci.yml` or `infrastructure/github/ci.yml`):
  - Code hygiene: ESLint, Prettier formatting check, TypeScript type checks (`tsc --noEmit`).
  - Unit tests: Fast execution across all monorepo packages.
  - Integration tests: Installing minimal headless LibreOffice in CI runner to execute conversion tests against fixtures.
  - End-to-end tests: Headless Playwright browser test run.
- Docker build workflow (`.github/workflows/docker-build.yml`):
  - Automated multi-stage Docker build validation with build caching.
  - Container vulnerability scan using Trivy or Grype.
- Branch protection rules configuration recommendations:
  - Enforcing passing CI status before merging.
  - Disallowing direct pushes to `main`.
- Automated GitHub release workflow for semver version tagging.

### Out of Scope
- Automatic deployment to paid cloud hosting providers (deferred to Phase 15).
- Secret management for production Kubernetes clusters.

## Dependencies
- Phase 12 (Testing automation and unified test commands).
- Phase 13 (Docker container definitions).
- GitHub repository with Actions enabled.

## Architecture Considerations
- **Fast CI Pipeline**: Run fast linting and unit tests first (failing fast in < 1 minute) before executing slower LibreOffice integration tests or Docker image builds.
- **LibreOffice in GitHub Runners**: Standard Ubuntu GitHub Actions runners can install headless LibreOffice via `apt-get install -y --no-install-recommends libreoffice-calc-nogui libreoffice-impress-nogui libreoffice-writer-nogui fonts-liberation2` or run inside the pre-built Docker image.
- **Cache Optimization**: Cache npm/pnpm stores and Playwright browser binaries between workflow runs.

## Tasks

### TASK-14-01: CI Quality & Test Pipeline
- **Task ID**: `TASK-14-01`
- **Task Title**: Create GitHub Actions CI workflow for lint, typecheck, and tests
- **Description**: Configure `.github/workflows/ci.yml` triggering on pull requests and pushes to `main`, running linting, TypeScript compilation, unit tests, and LibreOffice integration tests.
- **Expected Outcome**: Automated green/red checkmark on every GitHub PR.
- **Testing Expectations**: Simulate CI run locally with `act` or verify on test branch.
- **Documentation Expectations**: Document CI steps in `infrastructure/github/README.md`.
- **Dependencies**: None.

### TASK-14-02: Container Build & Vulnerability Scan Workflow
- **Task ID**: `TASK-14-02`
- **Task Title**: Create Docker build and vulnerability scan workflow
- **Description**: Build workflow that builds the production Docker image, executes container healthcheck, and scans the image for high/critical vulnerabilities using Trivy.
- **Expected Outcome**: Validated container image without high/critical CVEs.
- **Testing Expectations**: Workflow passes on valid PRs.
- **Documentation Expectations**: Document CVE policy in `docs/phases/14-ci-cd.md`.
- **Dependencies**: TASK-14-01, Phase 13.

### TASK-14-03: Release Packaging Workflow
- **Task ID**: `TASK-14-03`
- **Task Title**: Configure automated GitHub release and changelog generator
- **Description**: Create workflow triggering on Git semver tags (`v*.*.*`) that generates release notes from conventional commits and publishes container images to GitHub Container Registry (GHCR).
- **Expected Outcome**: Automated release publishing on Git tag push.
- **Testing Expectations**: Dry-run release generation on staging tag.
- **Documentation Expectations**: Document release process in `README.md`.
- **Dependencies**: TASK-14-02.

## Validation Checklist
- [ ] Pull requests trigger the CI workflow automatically.
- [ ] TypeScript errors or failed unit tests fail the CI run.
- [ ] LibreOffice conversion tests pass reliably on Ubuntu GitHub Actions runners.
- [ ] Docker build workflow succeeds and verifies image healthcheck.
- [ ] CI workflow completes within acceptable runtime limits (< 8 minutes).

## Exit Criteria
1. CI workflow successfully runs and passes against the repository.
2. Branch protection rules are documented and ready for enforcement.
3. Code reviewed and merged via GitHub Flow.

## Expected Git/GitHub Workflow
- Branch: `feature/ci-cd-pipelines`
- Commits: `ci: add github actions workflows for testing and docker build`
- PR: Requires successful execution of newly introduced CI checks.

# Phase 13 — Containerization & Docker Packaging

## Objective
Containerize DocForge using an optimized multi-stage Docker build that packages the Node.js backend, built React frontend static assets, headless LibreOffice, open-source metric-compatible fonts, and Poppler utilities into a secure, non-root production container.

## Why This Phase Exists
A major friction point with document conversion platforms is system-level dependencies: installing LibreOffice, font packages, and C libraries across different developer operating systems (macOS, Windows, diverse Linux distros) frequently leads to environment discrepancies ("works on my machine"). Docker packages the entire environment into a reproducible, isolated runtime.

## Scope

### In Scope
- Multi-stage `Dockerfile` in `infrastructure/docker/`:
  - Build stage: Node.js, TypeScript compilation, Vite frontend build.
  - Production runtime stage: Lightweight Debian/Ubuntu slim base with:
    - Minimal headless LibreOffice runtime (`libreoffice-calc-nogui`, `libreoffice-impress-nogui`, `libreoffice-writer-nogui`)
    - Open-source font packages (`fonts-liberation2`, `fonts-crosextra-carlito`, `fonts-crosextra-caladea`, `fonts-dejavu-core`)
    - Poppler utilities (`poppler-utils` for `pdftoppm`)
    - Dumb-init or Tini for proper PID 1 signal handling and zombie reaping
- Dedicated non-privileged runtime user (`docforge:docforge` with UID/GID 10001).
- `docker-compose.yml` for single-command local development and demonstration (`docker compose up`).
- `.dockerignore` file optimizing build context and cache invalidation.
- Health check instructions (`HEALTHCHECK`) verifying API responsiveness.

### Out of Scope
- Multi-node Kubernetes Helm charts or manifests (deferred to enterprise scaling).
- Proprietary font image layers requiring commercial licenses.
- Container registry publishing pipelines (handled in Phase 14 CI/CD).

## Dependencies
- Phase 03 (Express API) and Phase 04 (React Frontend).
- Docker engine and Docker Compose installed on host.

## Architecture Considerations
- **PID 1 Signal Handling**: LibreOffice child processes spawned by Node.js require proper PID 1 process management inside Docker containers. If the container runs Node directly as PID 1, detached processes may become un-reapable zombies or fail to receive `SIGTERM`. The container MUST use an init system like `tini` or `dumb-init`.
- **Image Size Optimization**: A full LibreOffice desktop installation exceeds 1 GB. The Dockerfile must install only the `-nogui` headless packages without recommended X11/desktop dependencies, keeping image footprint manageable.
- **Font Availability**: All metric-compatible fonts must be present and indexed via `fc-cache -fv` during image build.

## Tasks

### TASK-13-01: Dockerfile Multi-Stage Blueprint
- **Task ID**: `TASK-13-01`
- **Task Title**: Create optimized multi-stage Dockerfile
- **Description**: Build `infrastructure/docker/Dockerfile` with builder stage for compiling TypeScript and React assets, and a hardened slim runtime stage containing LibreOffice and Node.js.
- **Expected Outcome**: Hermetic, reproducible Docker image.
- **Testing Expectations**: Build succeeds (`docker build -t docforge:latest .`).
- **Documentation Expectations**: Document container configuration in `infrastructure/docker/README.md`.
- **Dependencies**: None.

### TASK-13-02: Font Packages & Fontconfig Setup
- **Task ID**: `TASK-13-02`
- **Task Title**: Configure font packages and fontconfig rules in container
- **Description**: Install Carlito, Caladea, and Liberation fonts in Dockerfile. Provide customized `fonts.conf` ensuring accurate fallback substitutions.
- **Expected Outcome**: Pixel-consistent conversion output matching development baselines.
- **Testing Expectations**: Run compatibility test inside container.
- **Documentation Expectations**: Document font layer in `docs/architecture/README.md`.
- **Dependencies**: TASK-13-01.

### TASK-13-03: Docker Compose Environment
- **Task ID**: `TASK-13-03`
- **Task Title**: Create docker-compose.yml for local orchestration
- **Description**: Create root `docker-compose.yml` mapping ports (3001 for API, 5173 or bundled reverse proxy), mounting development volumes if needed, and setting up health checks.
- **Expected Outcome**: Complete DocForge stack launches with `docker compose up`.
- **Testing Expectations**: Launch stack via compose, perform upload, convert, and download.
- **Documentation Expectations**: Document startup steps in `README.md`.
- **Dependencies**: TASK-13-01.

## Validation Checklist
- [ ] Docker image builds without warnings or non-headless desktop dependencies.
- [ ] Container runs as non-root user (`docforge`).
- [ ] Init system (`tini`/`dumb-init`) handles `SIGTERM` and shuts down cleanly within 10 seconds.
- [ ] `docker compose up` starts the complete application and serves traffic.
- [ ] Presentation conversion executed inside the container produces a valid PDF.

## Exit Criteria
1. Container image builds and passes automated healthcheck.
2. End-to-end conversion verified inside running container.
3. Code reviewed and merged via GitHub Flow.

## Expected Git/GitHub Workflow
- Branch: `feature/docker-containerization`
- Commits: `build(docker): implement multi-stage Dockerfile and docker-compose`
- PR: Requires container build verification.

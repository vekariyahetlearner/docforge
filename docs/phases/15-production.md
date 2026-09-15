# Phase 15 — Production Readiness & Operational Observability

## Objective
Finalize DocForge for production deployment by implementing structured logging, system telemetry and metrics, health and readiness probes, reverse proxy configurations, operational runbooks, and disaster recovery procedures.

## Why This Phase Exists
A software project is not complete when code compiles; it is complete when it can be reliably operated, monitored, and maintained in production. Phase 15 bridges development and operations, ensuring operators have full visibility into system throughput, conversion latencies, error distributions, and host resource utilization.

## Scope

### In Scope
- Structured JSON logging using `pino` or `winston` with correlation IDs (`requestId`, `jobId`).
- Prometheus-compatible metrics endpoint (`GET /metrics`):
  - Active jobs gauge (`docforge_jobs_active`)
  - Completed/failed conversions counter (`docforge_conversions_total{status,format}`)
  - Conversion duration histogram (`docforge_conversion_duration_seconds`)
  - Subprocess timeout counter (`docforge_timeouts_total`)
- Multi-tier health endpoints:
  - `GET /health/live`: Basic process liveness probe.
  - `GET /health/ready`: Readiness probe verifying LibreOffice binary availability, sufficient disk space (>1 GB), and writeable temp directories.
- Production reverse proxy configuration examples (Nginx and Caddy):
  - SSL/TLS termination.
  - Client request body limits (`client_max_body_size 50M`).
  - Gzip/brotli compression for frontend static assets.
- Production Runbook (`docs/product/RUNBOOK.md` or `docs/architecture/RUNBOOK.md`):
  - Troubleshooting hung processes.
  - Diagnosing font substitution issues.
  - Disk cleanup procedures.

### Out of Scope
- Multi-region distributed failover automation.
- Commercial APM vendor agent installations (Datadog/NewRelic).

## Dependencies
- Phases 03, 05, 09, and 13 (API, Lifecycle, Reliability, and Docker).
- Prometheus client library (e.g., `prom-client`).

## Architecture Considerations
- **Separation of Liveness and Readiness**:
  - Liveness probe fails only if the Node.js event loop is completely wedged (orchestrator restarts container).
  - Readiness probe fails if temporary disk space is exhausted or LibreOffice binary cannot execute (orchestrator stops routing traffic while keeping container alive for diagnosis).
- **Log Privacy**: Converted document contents or user-sensitive slide metadata must NEVER be logged. Logs only capture `jobId`, file sizes, durations, and structured error codes.

## Tasks

### TASK-15-01: Structured Logging & Correlation IDs
- **Task ID**: `TASK-15-01`
- **Task Title**: Implement Pino structured logging with request tracing
- **Description**: Add structured logger that injects `jobId` and `requestId` into all log lines. Standardize JSON logging in production and colorized output in development.
- **Expected Outcome**: Consistent, parseable log streams suitable for log aggregation.
- **Testing Expectations**: Unit tests verifying log schema output.
- **Documentation Expectations**: Document logging conventions in `docs/architecture/README.md`.
- **Dependencies**: None.

### TASK-15-02: Observability & Prometheus Metrics
- **Task ID**: `TASK-15-02`
- **Task Title**: Implement /metrics endpoint with conversion counters and latency histograms
- **Description**: Integrate `prom-client` to record metrics for job statuses, durations, format breakdowns, and queue depths. Expose Prometheus-compatible `/metrics` route.
- **Expected Outcome**: Real-time observability into conversion performance and health.
- **Testing Expectations**: Integration tests verifying `/metrics` returns valid Prometheus text exposition format.
- **Documentation Expectations**: Document metric names in `docs/api/README.md`.
- **Dependencies**: None.

### TASK-15-03: Liveness & Readiness Probes
- **Task ID**: `TASK-15-03`
- **Task Title**: Build /health/live and /health/ready endpoints
- **Description**: Implement liveness probe (200 OK if event loop responsive) and readiness probe (checks disk space, LibreOffice executable check, temporary folder write permissions).
- **Expected Outcome**: Standardized health probes for Docker and container orchestrators.
- **Testing Expectations**: Integration tests with mocked unhealthy disk space verifying 503 response.
- **Documentation Expectations**: Document probe specifications in `docs/api/README.md`.
- **Dependencies**: None.

### TASK-15-04: Reverse Proxy Configurations & Runbook
- **Task ID**: `TASK-15-04`
- **Task Title**: Provide production reverse proxy configs and Operator Runbook
- **Description**: Create reference Nginx and Caddy configuration files in `infrastructure/` and author comprehensive Operator Runbook covering alerts, common failure modes, and recovery commands.
- **Expected Outcome**: Turnkey production deployment guides for operators.
- **Testing Expectations**: Validate Nginx config syntax (`nginx -t`).
- **Documentation Expectations**: `docs/architecture/RUNBOOK.md`.
- **Dependencies**: None.

## Validation Checklist
- [ ] Structured JSON logs emit `jobId` without leaking confidential document contents.
- [ ] `/metrics` exposes conversion latency histograms and error counters.
- [ ] `/health/ready` returns 503 when disk space is critically low or LibreOffice is unavailable.
- [ ] Nginx/Caddy configurations enforce 50 MB client body limits and handle WebSocket/streaming.
- [ ] Runbook contains clear, verified recovery steps for hung processes and disk exhaustion.

## Exit Criteria
1. Application passes full operational readiness audit.
2. Metrics, logging, and health probe endpoints verified under load.
3. Code reviewed and merged via GitHub Flow.

## Expected Git/GitHub Workflow
- Branch: `feature/production-readiness`
- Commits: `feat(ops): add structured logging, prometheus metrics, and health probes`
- PR: Requires operational readiness review.

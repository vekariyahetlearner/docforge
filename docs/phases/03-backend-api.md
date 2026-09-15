# Phase 03 — Backend API

## Objective
Build the Node.js + Express HTTP API service inside `apps/api` to expose job-oriented REST endpoints for file upload, conversion triggering, job status polling, and PDF download using `packages/conversion-core`.

## Why This Phase Exists
A robust API layer decouples client presentation from conversion orchestration. Rather than performing long-running blocking operations directly in HTTP request handlers, Phase 03 establishes a clean, job-oriented HTTP protocol where uploads receive immediate tracking identifiers, progress can be monitored, and results are safely streamed back to clients.

## Scope

### In Scope
- Monorepo application setup for `apps/api` with Express and TypeScript.
- Multipart form-data file upload handling via `multer` (in-memory or disk staging).
- Request validation middleware:
  - File extension verification
  - MIME type and magic-byte checks
  - Max file size enforcement (default 50 MB)
- In-memory job repository for tracking job lifecycle states (`QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED`, `EXPIRED`).
- RESTful HTTP endpoints:
  - `POST /api/v1/conversions`: Upload file & initialize job
  - `GET /api/v1/conversions/:jobId`: Query status and metadata
  - `GET /api/v1/conversions/:jobId/download`: Stream converted PDF
- Global error-handling middleware mapping domain errors to HTTP status codes.
- CORS middleware configured for frontend origin.
- Integration test suite for HTTP endpoints using `supertest`.

### Out of Scope
- React frontend components (scheduled for Phase 04).
- Distributed message brokers or external queues like Redis (deferred; in-memory for MVP).
- Persistent relational database (SQLite/PostgreSQL deferred to future scalability phases).
- User authentication and API keys.

## Dependencies
- Phase 01 (`packages/conversion-core` and `packages/shared`).
- Phase 02 (`LibreOfficeConverter` registered in `ConverterRegistry`).
- Node.js runtime and Express framework dependencies.

## Architecture Considerations
- **Non-Blocking Architecture**: Long conversions must not block the Express event loop. The execution is handled asynchronously, transitioning job status from `QUEUED` &rarr; `PROCESSING` &rarr; `COMPLETED`/`FAILED`.
- **Job-Oriented Design**: Clients poll status or await completion via structured JSON envelopes.
- **Strict Error Mapping**: Domain errors (`UnsupportedConversionError`, `ConversionTimeoutError`) map directly to appropriate HTTP statuses (400, 413, 504, 500) without leaking stack traces or internal paths to clients.

## Tasks

### TASK-03-01: Express API Scaffolding
- **Task ID**: `TASK-03-01`
- **Task Title**: Scaffold apps/api with Express, TypeScript, and CORS
- **Description**: Configure application entry point (`src/index.ts`, `src/app.ts`), configure CORS, JSON body parser, and health check route (`GET /health`).
- **Expected Outcome**: Running Express server responding to health checks.
- **Testing Expectations**: Automated HTTP test on `/health` returning 200 OK.
- **Documentation Expectations**: Update `docs/api/README.md`.
- **Dependencies**: None.

### TASK-03-02: Multipart Upload & Validation Middleware
- **Task ID**: `TASK-03-02`
- **Task Title**: Implement file upload middleware with magic-byte validation
- **Description**: Configure `multer` for staging uploads in `uploads/`, and build middleware that inspects file extension, file size, and magic bytes before routing to the controller.
- **Expected Outcome**: Invalid or oversized files rejected immediately with 400 or 413.
- **Testing Expectations**: Integration tests with valid PPTX, invalid extensions, and spoofed magic bytes.
- **Documentation Expectations**: Document upload constraints in `specs/technical-specification.md`.
- **Dependencies**: TASK-03-01, Phase 01.

### TASK-03-03: In-Memory Job Repository & Service
- **Task ID**: `TASK-03-03`
- **Task Title**: Implement JobService and in-memory job state store
- **Description**: Create an in-memory job store managing UUID keys, job statuses, timestamps, error records, and artifact paths.
- **Expected Outcome**: Thread-safe (event-loop safe) store for tracking conversion states.
- **Testing Expectations**: Unit tests verifying state transitions (`QUEUED` &rarr; `PROCESSING` &rarr; `COMPLETED`/`FAILED`).
- **Documentation Expectations**: Document job states in `specs/technical-specification.md`.
- **Dependencies**: TASK-03-01.

### TASK-03-04: Conversion Routes & Controllers
- **Task ID**: `TASK-03-04`
- **Task Title**: Implement conversion upload, polling, and download routes
- **Description**: Connect HTTP routes to `JobService` and `packages/conversion-core`. Wire asynchronous execution so conversion runs in background while returning 202 Accepted. Implement file streaming for `/download`.
- **Expected Outcome**: Complete HTTP API flow for upload, status check, and download.
- **Testing Expectations**: End-to-end HTTP integration tests using `supertest` with real fixture files.
- **Documentation Expectations**: Document endpoint contracts in `docs/api/README.md`.
- **Dependencies**: TASK-03-02, TASK-03-03, Phase 02.

## Validation Checklist
- [ ] `POST /api/v1/conversions` accepts valid `.pptx` and returns 202 Accepted with a `jobId`.
- [ ] `POST /api/v1/conversions` rejects files exceeding 50 MB with 413.
- [ ] `POST /api/v1/conversions` rejects fake `.pptx` files (invalid magic bytes) with 400.
- [ ] `GET /api/v1/conversions/:jobId` returns `PROCESSING` then transitions to `COMPLETED`.
- [ ] `GET /api/v1/conversions/:jobId/download` streams valid PDF with correct `Content-Type`.
- [ ] Global error handler prevents raw stack traces from reaching clients.

## Exit Criteria
1. Full integration test suite in `apps/api` passes.
2. Complete upload &rarr; convert &rarr; download lifecycle verified via HTTP.
3. Code reviewed and merged via GitHub Flow.

## Expected Git/GitHub Workflow
- Branch: `feature/backend-express-api`
- Commits: `feat(api): implement conversion endpoints and job tracking`
- PR: Requires automated API test pass.

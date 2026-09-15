# Phase 06 — Batch Conversion

## Objective
Extend DocForge's API and frontend interfaces to accept multiple presentation files in a single batch request, execute conversions within controlled concurrency limits, track aggregate batch progress, and provide a bundled `.zip` archive download.

## Why This Phase Exists
Users frequently need to convert entire decks of presentations or multiple meeting slide packs at once. Manually uploading files one-by-one is tedious. Phase 06 introduces batch orchestration that enables multi-file uploads while strictly protecting server resources through concurrency throttling.

## Scope

### In Scope
- Batch submission endpoint: `POST /api/v1/batches` (accepting up to 10 files per request).
- Aggregate batch tracking entity:
  - Parent `batchId` tracking multiple child `jobId`s.
  - Overall batch status (`QUEUED`, `PROCESSING`, `PARTIALLY_COMPLETED`, `COMPLETED`, `FAILED`).
- Concurrency limiter / semaphore in `packages/conversion-core` (default max 2–3 parallel LibreOffice processes to prevent CPU exhaustion).
- Bundled archive generation (`archiver` zip stream) for single-click download of all converted PDFs.
- Frontend multi-file drag-and-drop dropzone, per-file status rows, aggregate progress bar, and "Download All as ZIP" action.

### Out of Scope
- Distributed workers or cloud queuing clusters.
- Batch scheduling or delayed email delivery.
- Unlimited file batching (hard ceiling of 10 files / 250 MB total enforced).

## Dependencies
- Phase 04 (Frontend MVP) and Phase 05 (Job Lifecycle).
- Zip archiving utility (e.g., `archiver`).

## Architecture Considerations
- **Concurrency Throttling**: Spawning 10 headless LibreOffice instances simultaneously can freeze a modest CPU or trigger out-of-memory (OOM) kernel kills. Batch processing must queue child conversions through a local semaphore (e.g., `p-limit` or custom worker pool) with a max concurrency of 2 or 3.
- **Partial Failure Tolerance**: If 8 files succeed and 2 fail (e.g., corrupted slides), the batch must complete with `PARTIALLY_COMPLETED` status, allowing the user to download the 8 converted PDFs.
- **Streaming Archive**: The `.zip` download should stream directly to the response rather than buffering the entire multi-megabyte zip in memory.

## Tasks

### TASK-06-01: Batch Concurrency Limiter
- **Task ID**: `TASK-06-01`
- **Task Title**: Implement conversion concurrency semaphore
- **Description**: Add an execution gatekeeper in `conversion-core` ensuring that regardless of batch size, no more than `MAX_CONCURRENT_CONVERSIONS` (configurable, default 2) execute at the same moment.
- **Expected Outcome**: Heavy batch requests queue gracefully without spiking CPU.
- **Testing Expectations**: Concurrency unit tests asserting peak running processes.
- **Documentation Expectations**: Document concurrency settings in `.env.example`.
- **Dependencies**: None.

### TASK-06-02: Batch API Endpoints & Aggregator
- **Task ID**: `TASK-06-02`
- **Task Title**: Implement batch submission and status polling endpoints
- **Description**: Implement `POST /api/v1/batches`, `GET /api/v1/batches/:batchId`, and `GET /api/v1/batches/:batchId/download` (zip streaming).
- **Expected Outcome**: Complete backend batch orchestration.
- **Testing Expectations**: Integration tests with 3+ files testing successful, mixed, and failed batch conversions.
- **Documentation Expectations**: Document batch routes in `docs/api/README.md`.
- **Dependencies**: TASK-06-01.

### TASK-06-03: Multi-File Frontend UI
- **Task ID**: `TASK-06-03`
- **Task Title**: Update React frontend with multi-file list and batch actions
- **Description**: Upgrade dropzone to accept multiple files. Render a list showing individual file progress, error badges for failed items, and a prominent "Download All (.zip)" button.
- **Expected Outcome**: Polished batch conversion experience in the web application.
- **Testing Expectations**: Component tests for file queueing and state updates.
- **Documentation Expectations**: Update user documentation in `docs/product/PRD.md`.
- **Dependencies**: TASK-06-02.

## Validation Checklist
- [ ] Users can upload up to 10 presentations simultaneously.
- [ ] System throttles execution to the configured concurrency limit without crashing.
- [ ] Partial failures allow successful files to be downloaded.
- [ ] "Download All as ZIP" streams a valid `.zip` file containing all converted PDFs.
- [ ] Total batch payload size exceeding limits is rejected before processing.

## Exit Criteria
1. Multi-file upload, throttled conversion, and `.zip` download verified end-to-end.
2. Peak system memory remains stable under a 10-file batch load.
3. Code reviewed and merged via GitHub Flow.

## Expected Git/GitHub Workflow
- Branch: `feature/batch-conversion-support`
- Commits: `feat(api): implement batch conversion and zip streaming`
- PR: Requires automated batch integration test pass.

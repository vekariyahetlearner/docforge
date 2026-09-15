# Phase 05 — Job Lifecycle & Storage Management

## Objective
Formalize and harden the asynchronous job lifecycle, TTL-based artifact expiration, automated storage garbage collection, and explicit job cancellation across `apps/api` and `packages/conversion-core`.

## Why This Phase Exists
In MVP testing, converted files and job records accumulate rapidly on the host filesystem. Without automated retention policies and background janitor routines, conversion servers quickly exhaust disk space or inode tables. Phase 05 ensures long-term operational health by introducing strict lifecycle governance for every job and artifact.

## Scope

### In Scope
- Formal Job State Machine transitions and invariants restricted strictly to approved states:
  - `QUEUED` &rarr; `PROCESSING` &rarr; `COMPLETED` &rarr; `EXPIRED`
  - `QUEUED` &rarr; `PROCESSING` &rarr; `FAILED` &rarr; `EXPIRED`
- Configurable Time-To-Live (TTL) for completed jobs and generated artifacts (initial proposed default target: 60 minutes).
- Background cleanup worker/service (`JanitorService`) running periodic cleanup sweeps.
- Immediate workspace teardown on job terminal state.
- Process abort capability allowing active LibreOffice child processes to be halted and transitioning the job to `FAILED` with a cancellation reason.
- Comprehensive state transition unit and integration tests.

### Out of Scope
- Distributed Redis-backed TTL caches (still modular monolith, in-memory state store).
- Multi-server shared NFS storage sync.
- User-specific history dashboards.

## Dependencies
- Phase 03 (Backend API and `JobService`).
- Phase 02 (Supervised process runner with abort signal capability).

## Architecture Considerations
- **Disk Safety First**: Artifact deletion must be idempotent and non-blocking. If a file fails to delete, the janitor logs the failure and retries on the next sweep rather than crashing.
- **Process Abort Signaling**: Process abortion must propagate an `AbortSignal` to the child process runner, triggering immediate `SIGTERM`/`SIGKILL` to reclaim CPU and memory, transitioning the job to `FAILED`.
- **Terminal State Immutability**: Once a job enters `COMPLETED`, `FAILED`, or `EXPIRED`, its state can never be modified again.

## Tasks

### TASK-05-01: Job State Machine Formalization
- **Task ID**: `TASK-05-01`
- **Task Title**: Formalize state machine transitions with invariant assertions
- **Description**: Refactor `JobService` to enforce strict state transition guards across the five approved states (`QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED`, `EXPIRED`). Disallow invalid transitions (e.g., `COMPLETED` &rarr; `PROCESSING`).
- **Expected Outcome**: Invariant errors thrown on invalid state modification attempts.
- **Testing Expectations**: Unit tests verifying all valid and invalid transition permutations.
- **Documentation Expectations**: Update state diagram in `specs/technical-specification.md`.
- **Dependencies**: None.

### TASK-05-02: Janitor Service & Storage Scrubber
- **Task ID**: `TASK-05-02`
- **Task Title**: Implement periodic JanitorService for TTL file pruning
- **Description**: Build an automated timer service that scans `outputs/` and `uploads/` directories, compares file modification times against configurable retention TTL, and securely deletes expired files.
- **Expected Outcome**: Background service that periodically frees disk space.
- **Testing Expectations**: Integration tests with simulated old files asserting deletion.
- **Documentation Expectations**: Document TTL configuration variables in `.env.example`.
- **Dependencies**: TASK-05-01.

### TASK-05-03: Process Abort & In-Flight Cleanup
- **Task ID**: `TASK-05-03`
- **Task Title**: Implement process abort propagation and workspace reclamation
- **Description**: Provide an abort mechanism (e.g., `POST /api/v1/conversions/:jobId/cancel` or internal cancellation hook) that wires `AbortController` through `ConversionContext`, terminates running LibreOffice instances, transitions the job state to `FAILED`, and purges the workspace.
- **Expected Outcome**: Active conversions can be aborted cleanly to reclaim resources without corrupting state.
- **Testing Expectations**: Integration tests verifying abort signal terminates running child processes.
- **Documentation Expectations**: Document abort handling in `docs/api/README.md`.
- **Dependencies**: TASK-05-01, Phase 02.

## Validation Checklist
- [ ] Converted files older than configured TTL (proposed default: 1 hour) are automatically deleted by the Janitor.
- [ ] Expired job records transition to `EXPIRED` status.
- [ ] Attempting to download an expired job returns `404 Not Found` with `JOB_NOT_FOUND` error.
- [ ] Aborting an active conversion immediately halts the LibreOffice process, marks the job `FAILED`, and removes the workspace.
- [ ] Janitor runs smoothly without blocking HTTP request processing.

## Exit Criteria
1. Automated tests verify file deletion after simulated TTL expiration.
2. Active child process kill verified upon abort signal.
3. Code reviewed and merged via GitHub Flow.

## Expected Git/GitHub Workflow
- Branch: `feature/job-lifecycle-management`
- Commits: `feat(api): implement janitor service and process abort handling`
- PR: Requires test pass on lifecycle transition and file cleanup logic.

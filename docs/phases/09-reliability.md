# Phase 09 — Operational Reliability & Resilience

## Objective
Harden DocForge against operational failures, process crashes, memory exhaustion, hanging subprocesses, and unexpected system restarts, establishing enterprise-grade reliability for local and server deployments.

## Why This Phase Exists
Headless LibreOffice and C-based conversion tools are prone to edge-case bugs: infinite loops on malformed fonts, segmentation faults on corrupt binary headers, memory bloat, and orphaned processes that survive server shutdowns. Phase 09 introduces deep system-level supervision, defensive resource bounds, and automated health reconciliation so DocForge remains continuously responsive.

## Scope

### In Scope
- Hardened process supervisor in `packages/conversion-core`:
  - Process group killing (`kill(-pid, 'SIGKILL')`) to terminate child process trees completely.
  - Zombie process detection and automated reaping.
- Configurable execution timeouts per format/file size.
- Resource bounding:
  - Enforcing maximum memory RSS thresholds for subprocesses.
  - Active disk space monitoring (refuse new jobs if free disk space < 1 GB).
- Graceful server shutdown handlers (`SIGTERM`, `SIGINT`):
  - Cease accepting new conversions.
  - Wait for active conversions up to a grace period (e.g., 15s).
  - Forcefully kill remaining subprocesses and clean ephemeral directories before exiting.
- Synthetic chaos and crash recovery tests.

### Out of Scope
- Multi-datacenter high-availability (HA) clustering.
- Distributed consensus (Raft/Paxos).
- Auto-scaling Kubernetes controllers (deferred).

## Dependencies
- Phase 02 (LibreOffice runner) and Phase 03 (Express API server).
- POSIX process management APIs on Linux/Unix hosts.

## Architecture Considerations
- **Process Group Termination**: Spawning LibreOffice can cause it to spawn helper binaries (e.g., `oosplash`, `soffice.bin`). Calling `kill(child.pid)` may kill the wrapper while leaving the heavy `.bin` process running as an orphan. The supervisor MUST spawn with `detached: true` and kill the entire process group `-child.pid`.
- **Pre-emptive Rejection**: If host free disk space drops below safety margins, the API must return `503 Service Unavailable` with a retry header rather than failing mid-conversion due to `ENOSPC`.

## Tasks

### TASK-09-01: Process Group Tree Termination
- **Task ID**: `TASK-09-01`
- **Task Title**: Implement process group spawning and forceful tree killing
- **Description**: Refactor child process invocation to use detached process groups. Implement two-stage termination: graceful `SIGTERM` followed by hard `SIGKILL` on timeout.
- **Expected Outcome**: Guaranteed zero orphaned LibreOffice or helper processes.
- **Testing Expectations**: Integration tests with intentionally hanging mock scripts asserting complete process cleanup.
- **Documentation Expectations**: Update architectural considerations in `specs/technical-specification.md`.
- **Dependencies**: None.

### TASK-09-02: Disk Space & System Health Watchdog
- **Task ID**: `TASK-09-02`
- **Task Title**: Implement DiskSpaceGuard and memory monitor
- **Description**: Add system check middleware that inspects host available disk space and Node.js process heap/RSS before admitting new conversion jobs.
- **Expected Outcome**: Graceful `503` rejection during resource exhaustion rather than sudden crashes.
- **Testing Expectations**: Unit tests with mocked disk space metrics.
- **Documentation Expectations**: Document health limits in `.env.example`.
- **Dependencies**: None.

### TASK-09-03: Graceful Shutdown Lifecycle
- **Task ID**: `TASK-09-03`
- **Task Title**: Implement graceful server shutdown for SIGTERM and SIGINT
- **Description**: Hook OS shutdown signals to stop accepting new requests, notify in-flight jobs, cleanly terminate child processes, flush logs, and exit cleanly.
- **Expected Outcome**: Clean container and process teardown during deployments.
- **Testing Expectations**: Automated process exit tests under simulated `SIGTERM`.
- **Documentation Expectations**: Document lifecycle in `docs/architecture/README.md`.
- **Dependencies**: TASK-09-01.

## Validation Checklist
- [ ] Hung LibreOffice processes are killed promptly upon timeout expiration (initial proposed target: immediate termination upon timeout).
- [ ] No zombie processes remain in the system process table across repeated automated execution testing.
- [ ] Graceful shutdown allows in-flight conversions to finish within grace period or terminates them safely.
- [ ] Low disk space conditions trigger informative `503` responses rather than partial write corruptions.

## Exit Criteria
1. Stress test running planned concurrent and sequential conversions completes with zero orphan processes.
2. Graceful shutdown tests pass without corrupting files.
3. Code reviewed and merged via GitHub Flow.

## Expected Git/GitHub Workflow
- Branch: `feature/reliability-hardening`
- Commits: `feat(core): implement process group supervision and graceful shutdown`
- PR: Requires automated stress test validation.

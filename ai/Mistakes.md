# DocForge — Engineering Lessons & Anti-Patterns Log

## Purpose of This Document

This document serves as an institutional memory ledger for the DocForge project. It records:
- **Failed Approaches**: Strategies, patterns, or tools that were attempted and later abandoned with concrete rationale.
- **Repeated Mistakes**: Gotchas or bugs that recurred and require explicit guardrails.
- **Incorrect Assumptions**: Misconceptions about dependencies, binary behavior, or performance that were disproven.
- **Important Lessons**: Actionable engineering insights derived from debugging or incident resolution.
- **Prevention Strategies**: Defensive techniques, automated lints, or test assertions designed to prevent repeat occurrences.

*Note: As this project is in Phase 00 (Foundation), historical production mistakes have not yet occurred. The entries below document foundational preventive rules derived directly from established architectural principles and known traps in document processing systems.*

---

## Known Lessons & Preventive Rules

### 1. Global User Profile Deadlocks in LibreOffice
- **Trap / Risk**: Invoking LibreOffice CLI concurrently without specifying a unique user profile causes instances to collide on `.lock` files in the default user profile directory (`~/.config/libreoffice`), resulting in silent conversion hangs and timeout failures.
- **Preventive Rule**: Every LibreOffice invocation MUST include an explicit, ephemeral profile flag:
  `-env:UserInstallation=file://<workspace_path>/user-profile`
- **Verification**: Concurrency tests in Phase 02 must execute simultaneous conversions without lock collisions.

### 2. Orphaned Subprocesses on Timeout or Disconnection
- **Trap / Risk**: Killing a parent process (`child.kill()`) when invoking shell scripts or binaries often leaves grandchild worker processes (`soffice.bin`) alive as orphaned zombies consuming memory and CPU indefinitely.
- **Preventive Rule**: Subprocesses must be spawned detached (`detached: true`) in their own process group, and terminated using negative PID targeting (`process.kill(-child.pid, 'SIGKILL')`) on timeout or cancellation.
- **Verification**: Reliability test suite in Phase 09 asserts zero surviving child processes in the OS process table after timeout.

### 3. Untrusted Filenames in Filesystem Operations
- **Trap / Risk**: Writing uploaded files directly to disk using the user-provided filename (`req.file.originalname`) opens severe path traversal vulnerabilities (`../../etc/cron.d/malicious`) and shell injection risks.
- **Preventive Rule**: Store uploaded and converted files strictly using server-generated cryptographically random UUIDs (`crypto.randomUUID()`). The client-supplied original filename is kept only as in-memory metadata for download header generation (`Content-Disposition`).
- **Verification**: Automated security tests in Phase 11 pass directory traversal strings and assert that files remain safely quarantined in temporary directories.

### 4. Direct Coupling of HTTP Handlers to Conversion Engines
- **Trap / Risk**: Importing child process runners directly into Express controller handlers makes the conversion logic untestable in isolation, blocks the event loop, and tightly couples the web layer to a specific external binary.
- **Preventive Rule**: Conversion logic must reside entirely within `packages/conversion-core` behind the `Converter` and `ConverterRegistry` abstractions. Express controllers interact only with `JobService` and `ConverterRegistry`.
- **Verification**: Core package must have zero dependencies on `express` or HTTP libraries.

### 5. Premature Infrastructure Complexity
- **Trap / Risk**: Introducing Redis, distributed message queues (BullMQ/Celery), microservices, or Kubernetes during early development introduces massive operational overhead, slow local iteration, and brittle setup without providing value for single-node workloads.
- **Preventive Rule**: Adhere strictly to the Modular Monolith. Use in-memory data structures and local file workspaces for MVP; only introduce external infrastructure when justified by concrete scale bottlenecks and approved via an ADR.
- **Verification**: Architecture reviews reject PRs introducing unapproved infrastructure dependencies.

---

## Incident & Mistake Entry Template (For Future Phases)

When an engineering incident, regression, or failed approach occurs in future phases, document it using this template:

```markdown
### [YYYY-MM-DD] Short Title of Incident or Mistake
- **Phase & Issue**: Phase XX, Issue #YY
- **What Happened**: Describe the symptom, failure, or erroneous approach.
- **Root Cause**: Explain the technical mechanism that caused the failure.
- **Why the Initial Assumption Was Wrong**: What did we assume that turned out to be false?
- **How It Was Fixed**: The solution implemented to resolve the problem.
- **Prevention Strategy**: What automated test, lint, or architectural rule will prevent recurrence?
```

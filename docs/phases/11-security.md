# Phase 11 — Security & Hardening

## Objective
Establish first-class security defenses across DocForge, mitigating document-based vulnerabilities, macro execution exploits, path traversal attacks, denial-of-service (DoS) vectors, and unauthorized file access.

## Why This Phase Exists
Document conversion engines are frequent targets for arbitrary code execution and data exfiltration. Parsing complex binary file formats (OLE2, OOXML, PDF) involves deep parsing logic where malformed headers, embedded macros, external XML entity (XXE) injection, or directory traversal attacks can compromise the host machine. Phase 11 hardens every stage of ingestion, sandboxing, and delivery.

## Scope

### In Scope
- Input sanitization and path traversal defense:
  - Cryptographic UUID generation for all internal file storage (`crypto.randomUUID()`).
  - Stripping path delimiters (`/`, `\`, `..`) from client-provided filenames.
- Macro execution suppression:
  - Permanent command-line flags preventing macro execution in LibreOffice (`--norestore`, `--nofirststartwizard`).
  - Disabling external link updates and DDE links during document load.
- File validation hardening:
  - Strict magic byte validation before invoking any parser.
  - Rejecting password-protected or encrypted presentations with clear error codes rather than hanging.
  - ZIP decompression bomb defense (limiting uncompressed file ratios).
- API rate limiting and DoS protection:
  - Configurable IP-based rate limiting on upload endpoints (proposed initial target: e.g., 30 requests/minute via `express-rate-limit`).
  - Strict HTTP body and multipart size limits enforced at the stream layer.
- Non-root execution policy and filesystem permission lockdowns (`chmod 700` on workspaces).
- Security audit test suite covering malicious payloads.

### Out of Scope
- User authentication and authorization tokens (deferred beyond MVP).
- Antivirus / ClamAV daemon integration (optional future plugin).
- Hardware security modules (HSM).

## Dependencies
- Phase 01, 02, and 03 (Core, Engine runner, and Express API).
- Node.js `crypto` module.

## Architecture Considerations
- **Defense in Depth**: Do not rely solely on file extensions or client headers. Ingestion must enforce: Extension Match &rarr; Magic Bytes Check &rarr; Decompression Ratio Guard &rarr; Sandboxed Parsing &rarr; Isolated Output Verification.
- **Zero Untrusted Filenames on Filesystem**: Client-provided filenames (`originalFilename`) are stored strictly as metadata in the `Job` object. The physical file on disk is ALWAYS named with a random UUID to render directory traversal attacks physically impossible.

## Tasks

### TASK-11-01: Path Traversal & Filename Sanitization
- **Task ID**: `TASK-11-01`
- **Task Title**: Implement secure filename sanitization and UUID disk mapping
- **Description**: Ensure all file operations map original filenames to UUIDs, sanitize original filenames using regex filtering before setting download headers, and verify no relative path components can escape storage roots.
- **Expected Outcome**: Absolute isolation against directory traversal vulnerabilities.
- **Testing Expectations**: Unit tests passing malicious path strings (`../../etc/passwd`, `C:\Windows\...`).
- **Documentation Expectations**: Update security architecture section in `specs/technical-specification.md`.
- **Dependencies**: None.

### TASK-11-02: Macro & External Entity Suppression
- **Task ID**: `TASK-11-02`
- **Task Title**: Configure strict engine flags against macro execution and XXE
- **Description**: Add engine configuration parameters and user profile policies ensuring LibreOffice runs with macro execution completely disabled, network access blocked, and external link resolution halted.
- **Expected Outcome**: Documents containing malicious VBA macros or external entity links fail safely without executing code.
- **Testing Expectations**: Integration tests with weaponized sample fixtures containing benign macro popups asserting no execution.
- **Documentation Expectations**: Document security flags in `docs/phases/11-security.md`.
- **Dependencies**: None.

### TASK-11-03: Rate Limiting & Payload Guards
- **Task ID**: `TASK-11-03`
- **Task Title**: Add Express rate limiting and zip-bomb stream inspection
- **Description**: Integrate rate-limiting middleware on conversion endpoints and add streaming size counter that terminates connections exceeding size thresholds immediately.
- **Expected Outcome**: API resists volumetric flood and decompression bomb attacks.
- **Testing Expectations**: Automated HTTP tests triggering rate limit 429 Too Many Requests responses.
- **Documentation Expectations**: Document rate limits in `.env.example` and `docs/api/README.md`.
- **Dependencies**: None.

### TASK-11-04: Security Regression & Penetration Test Suite
- **Task ID**: `TASK-11-04`
- **Task Title**: Implement automated security test suite
- **Description**: Create test cases in `tests/` verifying path traversal rejection, rate limiting enforcement, non-root workspace permissions, and rejection of password-locked documents.
- **Expected Outcome**: Automated security gate in test pipeline.
- **Testing Expectations**: All negative security test cases pass with expected error status codes.
- **Documentation Expectations**: Document security test suite in `docs/testing/README.md`.
- **Dependencies**: TASK-11-01, TASK-11-02, TASK-11-03.

## Validation Checklist
- [ ] Uploading `../../test.pptx` stores the file safely as a UUID without escaping the upload directory.
- [ ] Filenames containing control characters, null bytes, or script tags are stripped before download headers are generated.
- [ ] Presentations with embedded macros convert without executing macro code.
- [ ] High-frequency requests from a single IP trigger HTTP 429 Too Many Requests.
- [ ] Ephemeral workspaces are created with restricted file permissions (`0700`).

## Exit Criteria
1. Automated security test suite executes and passes 100% of test cases.
2. Code audit confirms no unsanitized user inputs reach child process execution or filesystem calls.
3. Code reviewed and merged via GitHub Flow.

## Expected Git/GitHub Workflow
- Branch: `feature/security-hardening`
- Commits: `feat(security): implement path sanitization, rate limiting, and macro suppression`
- PR: Requires automated security test pass.

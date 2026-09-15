# Phase 02 — PPT / PPTX &rarr; PDF Conversion Engine

## Objective
Implement the concrete `LibreOfficeConverter` implementing the `Converter` interface in `packages/conversion-core` to execute headless LibreOffice conversions of PowerPoint presentations (`.ppt`, `.pptx`) to PDF format with process supervision and sandbox isolation.

## Why This Phase Exists
This phase implements DocForge's core conversion capability. Executing LibreOffice directly is notoriously prone to concurrency locks, hanging processes, and resource leaks. By wrapping LibreOffice in an isolated, supervised execution harness with sandboxed user profiles and hard process timeouts, DocForge transforms a fragile CLI utility into a reliable, enterprise-grade conversion engine.

## Scope

### In Scope
- Concrete `LibreOfficeConverter` class implementing `Converter`.
- Detection and configuration of host LibreOffice binary (`libreoffice` / `soffice`).
- Process spawning using Node.js `child_process.spawn` with explicit argument isolation:
  - `--headless`
  - `--norestore`
  - `--nofirststartwizard`
  - `--nologo`
  - `--nodefault`
  - `--convert-to pdf`
  - `-env:UserInstallation=file://<isolated_workspace_profile>`
- Process timeout watchdog (default 60s) with `SIGTERM` followed by forceful `SIGKILL`.
- Integration test suite executing real conversions against sample `.ppt` and `.pptx` fixtures.
- Validating generated PDF output integrity using Phase 01 validators.

### Out of Scope
- HTTP endpoints or upload controllers (scheduled for Phase 03).
- Web frontend UI (scheduled for Phase 04).
- DOCX, XLSX, or PDF manipulation tools (scheduled for Phases 07 & 08).
- Multi-file batching (scheduled for Phase 06).

## Dependencies
- Phase 01 (`packages/conversion-core` interfaces and workspace manager).
- Local LibreOffice installation available on development/testing environment.
- Test fixtures in `tests/fixtures/` (`sample.ppt`, `sample.pptx`).

## Architecture Considerations
- **Sandboxed User Profiles**: LibreOffice uses a global user profile by default, which causes concurrency deadlocks when multiple instances run simultaneously. Every conversion invocation MUST supply an ephemeral `-env:UserInstallation` path within the job's workspace.
- **Process Supervision**: Detached or hung processes must never survive the execution boundary. A timer must monitor process execution and forcefully terminate the process tree on timeout.
- **Cross-Platform Binary Detection**: The engine must inspect environment variables (`LIBREOFFICE_PATH`) and standard OS paths (`/usr/bin/libreoffice`, `/Applications/LibreOffice.app/...`).

## Tasks

### TASK-02-01: LibreOffice Binary Resolver
- **Task ID**: `TASK-02-01`
- **Task Title**: Implement LibreOffice binary detection and version check
- **Description**: Implement a resolver that locates the LibreOffice executable from environment variables or standard OS paths and verifies it responds to `--version`.
- **Expected Outcome**: Reliable path resolution with clear diagnostic errors if LibreOffice is missing.
- **Testing Expectations**: Unit tests with mocked paths and environment variables.
- **Documentation Expectations**: Document configuration in `.env.example` and `README.md`.
- **Dependencies**: None.

### TASK-02-02: LibreOffice Process Runner & Sandbox
- **Task ID**: `TASK-02-02`
- **Task Title**: Build process executor with isolated user profiles and timeout supervision
- **Description**: Implement process spawning logic that builds CLI flags, creates the ephemeral `-env:UserInstallation` profile directory, captures stdout/stderr, and terminates hung processes.
- **Expected Outcome**: Headless execution that runs without lock-file collisions and terminates reliably on timeout.
- **Testing Expectations**: Integration tests verifying successful execution, error capture, and simulated timeout termination.
- **Documentation Expectations**: Document CLI flags in `specs/technical-specification.md`.
- **Dependencies**: TASK-02-01, Phase 01.

### TASK-02-03: LibreOfficeConverter Implementation
- **Task ID**: `TASK-02-03`
- **Task Title**: Implement Converter interface for PPT and PPTX formats
- **Description**: Wire `LibreOfficeConverter` to implement `canHandle` for `.ppt` and `.pptx` inputs and execute conversions using the supervised process runner.
- **Expected Outcome**: Fully functional converter registered in `ConverterRegistry`.
- **Testing Expectations**: End-to-end converter tests with valid and invalid `.ppt`/`.pptx` fixtures.
- **Documentation Expectations**: Inline TSDoc comments and usage example in package documentation.
- **Dependencies**: TASK-02-02.

### TASK-02-04: Test Fixtures & Compatibility Suite
- **Task ID**: `TASK-02-04`
- **Task Title**: Add test fixtures and conversion verification tests
- **Description**: Add minimal, valid test presentations (`tests/fixtures/minimal.pptx`, `tests/fixtures/minimal.ppt`) and automated test assertions verifying valid PDF output.
- **Expected Outcome**: Automated test verifying input-to-output pipeline.
- **Testing Expectations**: Converted files pass PDF magic byte and structure validation.
- **Documentation Expectations**: Document fixture licensing and origin in `tests/fixtures/README.md`.
- **Dependencies**: TASK-02-03.

## Validation Checklist
- [ ] LibreOffice binary is detected correctly or fails fast with an informative error message.
- [ ] `.pptx` converts to valid `.pdf` in an isolated workspace.
- [ ] `.ppt` converts to valid `.pdf` in an isolated workspace.
- [ ] Concurrent conversions execute without file lock errors due to separate user profiles.
- [ ] Hung processes are killed after timeout and do not leave zombie processes.
- [ ] Temporary user profile directories are completely removed upon completion.

## Exit Criteria
1. Integration tests convert sample `.ppt` and `.pptx` files to valid PDF files.
2. Zero leftover LibreOffice processes in the operating system process table after test runs.
3. Code reviewed and merged via GitHub Flow.

## Expected Git/GitHub Workflow
- Branch: `feature/libreoffice-ppt-converter`
- Commits: `feat(core): implement LibreOfficeConverter for PPT and PPTX`
- PR: Requires local LibreOffice integration test pass.

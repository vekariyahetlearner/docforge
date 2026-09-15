# Phase 01 — Conversion Core

## Objective
Implement the foundational conversion abstractions, converter interfaces, registry mechanism, temporary workspace manager, and validation utilities inside `packages/conversion-core` as an independent TypeScript package.

## Why This Phase Exists
A primary architectural failure in document conversion systems is tight coupling between HTTP handlers (e.g., Express routes) and external conversion binaries (e.g., LibreOffice). Phase 01 creates a completely decoupled, testable, and reusable core library that encapsulates format resolution, file validation, execution sandboxing, and error normalization without any knowledge of web frameworks or user interfaces.

## Scope

### In Scope
- Monorepo package setup for `packages/conversion-core` and `packages/shared`.
- TypeScript interface definitions:
  - `Converter` (`canHandle`, `convert`)
  - `ConversionInput`, `ConversionContext`, `ConversionResult`
  - `ConverterRegistry`
- In-memory `ConverterRegistry` implementation with registration and format resolution.
- Ephemeral workspace manager (`WorkspaceManager`) for creating, isolating, and tearing down per-job working directories.
- File integrity validators (magic byte inspection, size checks, PDF header verification).
- Domain error classes (`UnsupportedConversionError`, `CorruptInputError`, `ExecutionTimeoutError`).
- Unit test suite for registry, validators, and workspace isolation.

### Out of Scope
- Concrete LibreOffice execution or command-line invocation (scheduled for Phase 02).
- Express HTTP controllers, routes, or middleware (scheduled for Phase 03).
- Frontend components or browser UI (scheduled for Phase 04).
- Persistent database storage or Redis queue integration.

## Dependencies
- Phase 00 (Foundation documentation and directory structure).
- Node.js runtime and TypeScript compilation tooling.

## Architecture Considerations
- **Zero HTTP Dependency**: `packages/conversion-core` must have zero dependencies on Express, Multer, or web request/response objects.
- **Pluggable Engine Architecture**: Any future engine (e.g., `pdftoppm`, `pdfcpu`, `pandoc`) must implement the exact same `Converter` interface.
- **Strict Error Typing**: All failures must throw custom domain errors defined in `packages/shared` so callers can map them deterministically to status codes.

## Tasks

### TASK-01-01: Shared Domain Contracts
- **Task ID**: `TASK-01-01`
- **Task Title**: Define conversion domain contracts and error classes in packages/shared
- **Description**: Implement TypeScript types for `ConversionInput`, `ConversionContext`, `ConversionResult`, `JobStatus`, and standardized domain errors (`ConversionError`, `ValidationError`).
- **Expected Outcome**: Type-safe shared contracts consumable by both core and API.
- **Testing Expectations**: Type checking passing (`tsc --noEmit`).
- **Documentation Expectations**: Document types in `packages/shared/README.md`.
- **Dependencies**: None.

### TASK-01-02: Converter Interface & Registry
- **Task ID**: `TASK-01-02`
- **Task Title**: Implement Converter contract and ConverterRegistry
- **Description**: Create the `Converter` interface and an in-memory `ConverterRegistry` supporting converter registration, resolution by source/target format, and priority fallbacks.
- **Expected Outcome**: Functional registry that resolves converters or throws `UnsupportedConversionError`.
- **Testing Expectations**: Unit tests verifying single, multi, and unsupported format resolution scenarios.
- **Documentation Expectations**: Inline TSDoc comments for all public registry methods.
- **Dependencies**: TASK-01-01.

### TASK-01-03: Workspace Manager
- **Task ID**: `TASK-01-03`
- **Task Title**: Implement ephemeral WorkspaceManager
- **Description**: Create a utility to provision isolated directories (`temp/workspaces/<jobId>`), manage file copies, and guarantee complete recursive deletion upon completion or failure.
- **Expected Outcome**: Isolated directories created and securely cleaned up on command.
- **Testing Expectations**: Unit tests verifying creation, file isolation, permission safety, and recursive cleanup.
- **Documentation Expectations**: Document lifecycle guarantees in `specs/technical-specification.md`.
- **Dependencies**: TASK-01-01.

### TASK-01-04: File Validators
- **Task ID**: `TASK-01-04`
- **Task Title**: Implement magic-byte and PDF integrity validators
- **Description**: Implement file inspection logic to verify PPT/PPTX magic numbers (`PK..` and `0xD0CF11E0`) and PDF output markers (`%PDF-` and `%%EOF`).
- **Expected Outcome**: Fast, buffer-based inspection functions that detect spoofed file extensions.
- **Testing Expectations**: Unit tests using synthetic valid and corrupted byte buffers.
- **Documentation Expectations**: Document supported magic numbers in `specs/technical-specification.md`.
- **Dependencies**: TASK-01-01.

## Validation Checklist
- [ ] `packages/conversion-core` compiles cleanly with zero TypeScript errors.
- [ ] `ConverterRegistry` correctly resolves matching converters and rejects unsupported formats.
- [ ] `WorkspaceManager` creates isolated folders and cleans them up without leaving residual artifacts.
- [ ] Validators correctly detect MIME/magic byte mismatches.
- [ ] No Express, HTTP, or UI dependencies exist in `packages/conversion-core`.

## Exit Criteria
1. All unit tests in `packages/conversion-core` pass.
2. Core package exports `Converter`, `ConverterRegistry`, `WorkspaceManager`, and validators.
3. Code changes reviewed and merged via GitHub Flow.

## Expected Git/GitHub Workflow
- Branch: `feature/conversion-core-abstractions`
- Commits: `feat(core): implement converter registry and workspace manager`
- PR: Requires test pass and architectural review.

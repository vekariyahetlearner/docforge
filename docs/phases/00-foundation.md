# Phase 00 — Foundation

## Objective
Establish the repository structure, version control hygiene, comprehensive architectural and product documentation, project governance, and baseline engineering standards for DocForge before writing application code.

## Why This Phase Exists
Complex projects fail when development begins without clear architectural boundaries, consistent code standards, or shared agreements on what is being built. Phase 00 lays the ground rules, defines the source of truth, specifies the initial MVP (PPT/PPTX &rarr; PDF), and establishes strict non-goals so that all subsequent engineering work proceeds with clarity, speed, and precision.

## Scope

### In Scope
- Monorepo directory structure definition and `.gitkeep` placeholders.
- Baseline configuration files (`.gitignore`, `.env.example`, `LICENSE`, `README.md`).
- Authoring authoritative project documentation:
  - Product Requirements Document (`docs/product/PRD.md`)
  - Technical Specification (`specs/technical-specification.md`)
  - 16 Granular Phase Milestone roadmaps (`docs/phases/00-foundation.md` through `15-production.md`)
  - Architectural, API, Testing, and Decision READMEs (`docs/*/README.md`)
  - Engineering AI manuals (`ai/Agents.md`, `ai/Memory.md`, `ai/Mistakes.md`)
  - Architectural Decision Record (`docs/decisions/ADR-001-monorepo-workspace-tooling.md`)
- Setting up the Git workflow model (GitHub Flow with conventional commits).
- Monorepo workspace configuration via native npm workspaces (`apps/web`, `apps/api`, `packages/conversion-core`, `packages/shared`, `packages/config`).
- Strict TypeScript configuration with project references (`tsc -b`).
- Code quality tooling (ESLint, Prettier) and architectural boundary testing.

### Out of Scope
- Writing backend conversion endpoints, Express controllers, or upload logic (scheduled for Phase 03).
- Writing frontend conversion UI, drag-and-drop presentation dropzones, or API clients (scheduled for Phase 04).
- Implementing converter contracts, registries, or LibreOffice process runners (scheduled for Phase 01/02).
- Setting up databases, queues, Redis, or BullMQ (deferred).
- Docker containerization or orchestration (scheduled for Phase 13).
- CI/CD pipelines (scheduled for Phase 14).

## Dependencies
- Clean Git repository initialized.
- Node.js runtime (>=20.0.0) and npm (>=9.0.0).
- Approved DocForge architecture baseline.

## Architecture Considerations
- **Modular Monolith Layout**: Directories clearly demarcate `apps/` from `packages/` to enforce boundaries before code is written.
- **Documentation as Living State**: Documentation lives within the repository and is maintained alongside code changes.
- **Rule of No Premature Abstraction**: Only foundational scaffolding, boundary definitions, and tooling are introduced; zero speculative application logic.
- **Boundary Isolation**: `packages/conversion-core` must remain framework-independent (no Express or web dependencies); `apps/api` must not depend on `apps/web`; `packages/shared` has zero runtime dependencies.

## Tasks

### TASK-00-01: Repository Structure Initialization
- **Task ID**: `TASK-00-01`
- **Task Title**: Create standard monorepo folder layout and git placeholders
- **Description**: Create the top-level and package directories according to the modular monolith specification (`apps/web`, `apps/api`, `packages/conversion-core`, etc.) with `.gitkeep` files.
- **Expected Outcome**: Git tracks the directory layout; no empty directory is omitted.
- **Testing Expectations**: Verify folder structure with `tree` or `find`; ensure no extraneous files exist.
- **Documentation Expectations**: Document directory layout in `README.md`.
- **Dependencies**: None.

### TASK-00-02: Base Repository Configuration
- **Task ID**: `TASK-00-02`
- **Task Title**: Configure .gitignore, .env.example, LICENSE, and README.md
- **Description**: Add comprehensive `.gitignore` for Node/TypeScript/React/LibreOffice, non-secret `.env.example`, MIT `LICENSE`, and introductory `README.md`.
- **Expected Outcome**: Repository has professional baseline configuration without exposing secrets or tracking unwanted files.
- **Testing Expectations**: Verify that `.env` and `node_modules/` are ignored when created locally.
- **Documentation Expectations**: Update root `README.md`.
- **Dependencies**: TASK-00-01.

### TASK-00-03: Product Requirements & Technical Specification
- **Task ID**: `TASK-00-03`
- **Task Title**: Author PRD and Technical Specification
- **Description**: Create `docs/product/PRD.md` and `specs/technical-specification.md` defining product vision, linear MVP journey, converter interface (`canHandle`/`convert`), registry, and job lifecycle.
- **Expected Outcome**: Clear, unconflicted specifications available for all engineers.
- **Testing Expectations**: Markdown linting and cross-reference verification.
- **Documentation Expectations**: `docs/product/PRD.md` and `specs/technical-specification.md`.
- **Dependencies**: TASK-00-02.

### TASK-00-04: Phase Milestone Roadmap Documentation
- **Task ID**: `TASK-00-04`
- **Task Title**: Create phase specification documents 00 through 15
- **Description**: Author comprehensive specifications for each milestone phase in `docs/phases/` covering objectives, scope, tasks, verification checklists, and exit criteria.
- **Expected Outcome**: 16 complete phase documents defining the entire project journey.
- **Testing Expectations**: Verify that all 16 files exist and contain required headings and task IDs.
- **Documentation Expectations**: `docs/phases/*.md`.
- **Dependencies**: TASK-00-03.

### TASK-00-05: AI Engineering Guidelines & Operational Memory
- **Task ID**: `TASK-00-05`
- **Task Title**: Author Agents.md, Memory.md, and Mistakes.md
- **Description**: Create AI agent collaboration contract, architectural decision procedures, durable facts ledger, and preventive lessons log in `ai/`.
- **Expected Outcome**: Durable agent guidelines and memory preventing architectural drift and mistakes.
- **Testing Expectations**: Review guidelines against DocForge architectural principles.
- **Documentation Expectations**: `ai/Agents.md`, `ai/Memory.md`, `ai/Mistakes.md`.
- **Dependencies**: TASK-00-03.

### TASK-00-06: Monorepo Workspaces, TypeScript & Quality Tooling
- **Task ID**: `TASK-00-06`
- **Task Title**: Configure npm workspaces, TypeScript project references, and code quality tooling
- **Description**: Configure root `package.json` workspaces (`apps/*`, `packages/*`), create workspace packages (`@docforge/config`, `@docforge/shared`, `@docforge/conversion-core`, `@docforge/api`, `@docforge/web`), establish strict `tsconfig.base.json`, configure ESLint and Prettier, record ADR-001, and establish boundary test script.
- **Expected Outcome**: Fully functional monorepo foundation where `npm run build`, `npm run typecheck`, `npm run lint`, `npm run format:check`, and `npm test` execute cleanly.
- **Testing Expectations**: Clean dependency installation, build verification, and boundary assertions.
- **Documentation Expectations**: Update `README.md`, `docs/decisions/ADR-001-monorepo-workspace-tooling.md`, and `ai/Memory.md`.
- **Dependencies**: TASK-00-01 through TASK-00-05.

## Validation Checklist
- [x] Directory layout matches approved modular monolith architecture.
- [x] `.gitignore` excludes temporary, build, and secret files while tracking `package-lock.json`.
- [x] `.env.example` contains no real secrets or passwords.
- [x] `PRD.md` accurately describes the PPT/PPTX &rarr; PDF MVP.
- [x] `technical-specification.md` documents converter contract, job lifecycle, and orchestration.
- [x] All 16 phase documents exist in `docs/phases/`.
- [x] `Agents.md`, `Memory.md`, and `Mistakes.md` exist in `ai/`.
- [x] Monorepo npm workspaces configured and operational for all 5 packages.
- [x] TypeScript project references compile and typecheck with zero errors (`npm run build`, `npm run typecheck`).
- [x] ESLint runs cleanly across the repository (`npm run lint`).
- [x] Prettier format check passes (`npm run format:check`).
- [x] Architectural boundaries verified with automated test (`npm test`).
- [x] Zero vulnerabilities found in dependency audit (`npm audit`).
- [x] No application or conversion logic implemented prematurely.

## Exit Criteria
1. Complete documentation suite and monorepo tooling committed to the repository.
2. Architecture baseline and monorepo workspace structure fully operational.
3. Clean checkout installation, build, typecheck, lint, and tests verified.
4. The human developer has reviewed and merged the foundation branch into `main`.

## Expected Git/GitHub Workflow
- Branch: `chore/monorepo-foundation` (originating from `main`).
- Commits: Conventional commit format (e.g., `chore: establish monorepo foundation and tooling`).
- PR: Created against `main` for developer review.

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
- Setting up the Git workflow model (GitHub Flow with conventional commits).

### Out of Scope
- Installing application packages, frameworks, or dependencies (`npm install`, `pnpm`, etc.).
- Writing backend or frontend application code.
- Setting up databases, queues, or Redis.
- Configuring Docker containerization or GitHub Actions workflows (scheduled for later phases).

## Dependencies
- Clean Git repository initialized.
- Approved DocForge architecture baseline.

## Architecture Considerations
- **Modular Monolith Layout**: Directories must clearly demarcate `apps/` from `packages/` to enforce boundaries before code is written.
- **Documentation as Living State**: Documentation must live within the repository and be maintained alongside code changes.
- **Rule of No Premature Abstraction**: Only foundational scaffolding and documentation are introduced.

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

## Validation Checklist
- [ ] Directory layout matches approved modular monolith architecture.
- [ ] `.gitignore` excludes temporary, build, and secret files.
- [ ] `.env.example` contains no real secrets or passwords.
- [ ] `PRD.md` accurately describes the PPT/PPTX &rarr; PDF MVP.
- [ ] `technical-specification.md` documents converter contract, job lifecycle, and orchestration.
- [ ] All 16 phase documents exist in `docs/phases/`.
- [ ] `Agents.md`, `Memory.md`, and `Mistakes.md` exist in `ai/`.
- [ ] No application code, dependencies, or package managers have been installed.

## Exit Criteria
1. Complete documentation suite is committed to the repository.
2. Architecture baseline is fully articulated without internal contradictions.
3. The human developer has reviewed and merged the documentation branch into `main`.

## Expected Git/GitHub Workflow
- Branch: `docs/documentation-foundation` (originating from `main` or initialized repo).
- Commits: Conventional commit format (e.g., `docs: establish documentation foundation`).
- PR: Created against `main` for developer review.

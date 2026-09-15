# DocForge — Durable Project Memory

This document records authoritative, durable project facts, established architectural decisions, current scope boundaries, and open questions. It is updated as the project evolves through explicit consensus.

---

## 1. Project Identity

- **Name**: DocForge
- **Mission**: Open-source, self-hostable, extensible document conversion and manipulation platform.
- **Repository**: [github.com/vekariyahetlearner/docforge](https://github.com/vekariyahetlearner/docforge.git)
- **License**: MIT License

---

## 2. Architecture & Repository Structure

- **Pattern**: Modular Monolith organized as a monorepo.
- **Root Layout**:
  - `apps/web`: React SPA frontend.
  - `apps/api`: Node.js + Express backend service.
  - `packages/conversion-core`: Engine abstractions, converter registry, process sandbox.
  - `packages/shared`: Shared TypeScript types, error definitions, schemas.
  - `packages/config`: Common tooling, ESLint, Prettier, TypeScript configurations.
  - `tests/`: Fixtures, compatibility visual diff tests, end-to-end Playwright tests.
  - `infrastructure/`: Dockerfile, compose, font configs, GitHub Actions workflows.
  - `docs/`: Product PRD, 16 phase roadmaps, API/architecture/testing/ADR guides.
  - `specs/`: Technical specifications.
  - `ai/`: Agent operating contract, memory, mistakes ledger.

---

## 3. Technology Choices

### Established
- **Language**: TypeScript (strict mode enabled across all packages).
- **Frontend**: React (SPA) built with Vite.
- **Backend**: Node.js + Express REST API.
- **Styling**: Vanilla CSS with custom properties / design system tokens.
- **Primary Conversion Engine**: Headless LibreOffice (`--headless --norestore --convert-to pdf`).
- **Development Model**: GitHub Flow (short-lived feature branches, pull requests into `main`).
- **Commit Convention**: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, etc.).

### Planned
- **Testing**: Vitest for unit/integration tests, Supertest for API routes, Playwright for E2E.
- **Visual Regression**: Poppler utilities (`pdftoppm`) and `pixelmatch`.
- **Secondary Engines**: `pdf-lib` (PDF merge/split), `qpdf` or Ghostscript (compression), `poppler-utils` (PDF to PNG).
- **Containerization**: Multi-stage Debian-slim Docker packaging Node.js, headless LibreOffice, and open-source fonts.

---

## 4. Current Product Scope & Development Phase

- **Initial MVP Scope**: PowerPoint (`.ppt`, `.pptx`) &rarr; PDF (`.pdf`) single-file conversion.
- **Current Phase**: **Phase 00 — Foundation**
  - Subphase 00.1 (Repository Initialization): Completed.
  - Subphase 00.2 (Documentation Foundation): In progress.
- **Upcoming Phase**: Phase 01 — Conversion Core.

---

## 5. Important Durable Decisions

| Category | Status | Decision Summary |
| :--- | :--- | :--- |
| **Monolith vs. Services** | **Established** | Modular Monolith selected. All components live in one monorepo sharing memory and local execution; no microservices or distributed RPCs. |
| **Engine Decoupling** | **Established** | Conversion logic lives strictly in `packages/conversion-core`. Express and React have zero direct knowledge of LibreOffice CLI flags or subprocess logic. |
| **Converter Contract** | **Established** | All format converters implement `canHandle(input, target)` and `convert(input, context)`. |
| **Job Model** | **Established** | All conversions operate as tracked jobs (`QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED`, `EXPIRED`). |
| **Workspace Sandboxing** | **Established** | Every conversion runs in a dedicated ephemeral folder with an isolated `-env:UserInstallation` profile path to eliminate concurrency locks. |
| **File Storage Security** | **Established** | Physical files on disk are named with random UUIDs. Untrusted client filenames are never used as disk paths. |
| **Non-Goals for MVP** | **Established** | No user authentication, billing, payments, cloud S3 storage, Redis, or Celery in MVP. |

---

## 6. Important Conventions

- **Branch Naming**: `<type>/<kebab-case-description>` (e.g., `docs/documentation-foundation`, `feat/conversion-core`).
- **File Encoding**: UTF-8 without BOM; LF line endings (`\n`).
- **Imports**: Clean monorepo package imports (`@docforge/shared`, `@docforge/conversion-core`) once package workspaces are initialized.
- **Error Handling**: Throw domain errors inheriting from `DocForgeError` with structured machine-readable error codes.

---

## 7. Open Architectural Questions

| Question | Status | Context & Notes |
| :--- | :--- | :--- |
| **Job Store Persistence for Phase 05+** | **Open** | In-memory job storage is sufficient for MVP. For persistent multi-restart tracking, should we introduce lightweight SQLite or file-backed storage before considering Redis? |
| **LibreOffice Long-Running Daemon vs. Per-Job Spawn** | **Open** | Currently spawning fresh per-job processes for complete crash isolation. If latency becomes an issue in Phase 09, should we investigate LibreOffice UNO socket daemon with a pre-warmed pool? |
| **PDF Manipulation Library Selection** | **Open** | In Phase 08, evaluate `pdf-lib` (pure JS/TS, cross-platform) vs. `qpdf` CLI wrapper (faster C++ binary, requires system dependency). |

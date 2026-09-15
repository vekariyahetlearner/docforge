# DocForge

DocForge is an open-source, extensible document conversion and manipulation platform designed as a modular monolith. Built with TypeScript, React, Node.js, and an underlying conversion engine, DocForge provides reliable, self-hostable, and privacy-focused document transformations.

---

## Initial MVP: PPT / PPTX &rarr; PDF

The initial capability of DocForge is high-fidelity conversion of PowerPoint presentations (`.ppt`, `.pptx`) to PDF format using an automated headless LibreOffice conversion pipeline.

### Extensible Architecture & Future Roadmap

DocForge is architected from day one to scale beyond presentation conversion into a comprehensive document suite:

- **Document Conversions**:
  - `DOC` / `DOCX` &rarr; `PDF`
  - `XLS` / `XLSX` &rarr; `PDF`
  - `PDF` &rarr; `JPG` / `PNG` (Image extraction & page rendering)
- **PDF Operations**:
  - PDF Merge (combining multiple PDF documents)
  - PDF Split (extracting specific pages or ranges)
  - PDF Compress (optimizing document size)

---

## Documentation Index

Comprehensive documentation is maintained as living project state:

- **Product & Scope**:
  - [Product Requirements Document (PRD)](docs/product/PRD.md)
- **Technical Specifications**:
  - [Technical Specification](specs/technical-specification.md)
- **Phase Milestones & Roadmaps**:
  - [Phase Directory (00 through 15)](docs/phases/)
  - [Phase 00 — Foundation](docs/phases/00-foundation.md)
  - [Phase 01 — Conversion Core](docs/phases/01-conversion-core.md)
  - [Phase 02 — PPT/PPTX to PDF](docs/phases/02-ppt-pdf.md)
  - [Phase 03 — Backend API](docs/phases/03-backend-api.md)
  - [Phase 04 — Frontend MVP](docs/phases/04-frontend-mvp.md)
  - [Phase 05 — Job Lifecycle](docs/phases/05-job-lifecycle.md)
  - [Phase 06 — Batch Conversion](docs/phases/06-batch-conversion.md)
  - [Phase 07 — Office Document Support](docs/phases/07-office-document-support.md)
  - [Phase 08 — PDF Tools](docs/phases/08-pdf-tools.md)
  - [Phase 09 — Reliability](docs/phases/09-reliability.md)
  - [Phase 10 — Compatibility](docs/phases/10-compatibility.md)
  - [Phase 11 — Security](docs/phases/11-security.md)
  - [Phase 12 — Testing](docs/phases/12-testing.md)
  - [Phase 13 — Docker](docs/phases/13-docker.md)
  - [Phase 14 — CI/CD](docs/phases/14-ci-cd.md)
  - [Phase 15 — Production](docs/phases/15-production.md)
- **Supporting Documentation**:
  - [Architecture Overview](docs/architecture/README.md)
  - [API Contracts](docs/api/README.md)
  - [Testing Guidelines](docs/testing/README.md)
  - [Architectural Decision Records (ADRs)](docs/decisions/README.md)
- **AI Guidelines & Institutional Memory**:
  - [Engineering Agent Contract](ai/Agents.md)
  - [Durable Project Memory](ai/Memory.md)
  - [Engineering Lessons Log](ai/Mistakes.md)

---

## High-Level Architecture

DocForge follows a **Modular Monolith** pattern organized in a monorepo structure:

```
docforge/
├── apps/
│   ├── web/                     # React frontend application
│   └── api/                     # Node.js + Express backend API
│
├── packages/
│   ├── conversion-core/         # Core conversion engine & LibreOffice adapter
│   ├── shared/                  # Common domain types, contracts & schemas
│   └── config/                  # Shared linting, formatting & build configurations
│
├── tests/
│   ├── fixtures/                # Test documents (.pptx, .docx, etc.)
│   ├── compatibility/           # Cross-version & edge-case rendering tests
│   └── e2e/                     # End-to-end integration workflows
│
├── infrastructure/
│   ├── docker/                  # Containerization & LibreOffice runtime
│   └── github/                  # Workflows & CI/CD automation
│
├── scripts/                     # Developer tooling & operational scripts
├── docs/                        # Specifications, architecture, and ADRs
│   ├── product/                 # Product requirements & roadmap
│   ├── phases/                  # Phased execution milestones
│   ├── architecture/            # Architecture specifications & diagrams
│   ├── api/                     # API contracts & schemas
│   ├── testing/                 # Test strategies & QA protocols
│   └── decisions/               # Architecture Decision Records (ADRs)
├── specs/                       # Functional specifications
├── ai/                          # Agent guidelines, prompts, and context
│
├── .env.example                 # Non-sensitive configuration template
├── .gitignore                   # Version control ignore rules
├── README.md                    # Project documentation
└── LICENSE                      # MIT License
```

### Core Tenets
- **Separation of Concerns**: User-facing interfaces (`apps/web`), HTTP routing/validation (`apps/api`), and conversion logic (`packages/conversion-core`) are strictly isolated.
- **Engine Isolation**: The conversion engine runs as an isolated execution unit within `conversion-core`, ensuring backend services remain resilient against unexpected conversion engine crashes or high-memory tasks.
- **Contract-Driven**: Shared TypeScript types and validation schemas in `packages/shared` establish single-source-of-truth contracts across the stack.

---

## Development Philosophy

- **Incremental Phase Delivery**: Development proceeds sequentially in clearly defined phases without skipped stages or speculative code.
- **GitHub Flow**: Branches branch off `main`, undergo automated verification, and merge via pull requests.
- **Zero Speculative Abstractions**: Solve concrete requirements first (PPT/PPTX to PDF) with clean interfaces that naturally permit future extensions.
- **Learning & Rigor**: Clean git history, clear documentation, strict linting, and explicit architectural boundaries.

---

## Developer Getting Started

### Prerequisites
- **Node.js**: `>= 20.0.0` (tested on Node `v22.22.1`)
- **npm**: `>= 9.0.0` (native npm workspaces)

### Installation
Clone the repository and install dependencies from the root:
```bash
git clone https://github.com/vekariyahetlearner/docforge.git
cd docforge
npm install
```

### Workspace Structure & Boundaries
DocForge uses native npm workspaces with strict TypeScript project references:
- **`apps/web`** (`@docforge/web`): React frontend single-page application.
- **`apps/api`** (`@docforge/api`): Node.js + Express backend service.
- **`packages/conversion-core`** (`@docforge/conversion-core`): Framework-independent conversion engine.
- **`packages/shared`** (`@docforge/shared`): Common types, contracts, and constants.
- **`packages/config`** (`@docforge/config`): Shared configuration constants and compiler presets.

*Boundary Rules*: `packages/conversion-core` remains framework-independent (no Express or web dependencies); `apps/api` does not depend on `apps/web`; `packages/shared` has zero runtime dependencies.

### Monorepo Validation Commands

| Command | Action |
| :--- | :--- |
| `npm run typecheck` | Typecheck all packages and apps via TypeScript project references (`tsc -b`) |
| `npm run build` | Build compiled output and declarations into `dist/` (`tsc -b`) |
| `npm run lint` | Run ESLint across all TypeScript source files (`eslint .`) |
| `npm run format` | Format code using Prettier (`prettier --write .`) |
| `npm run format:check` | Verify code formatting without modifying files (`prettier --check .`) |
| `npm test` | Run architectural boundary tests via Node test runner (`scripts/test-boundaries.mjs`) |

---

## Current Project Status

- **Current Phase**: **Phase 00 — Foundation**
  - Repository structure, governance & `.gitignore` established.
  - Complete documentation foundation merged into `main` (`PRD.md`, `technical-specification.md`, 16 Phase specs, ADRs).
  - Monorepo tooling operational: npm workspaces, strict TypeScript references, ESLint, Prettier, and boundary tests.
- **Next Phase**: **Phase 01 — Conversion Core** (Converter interface, registry, and workspace manager).

---

## License

This project is licensed under the [MIT License](LICENSE).

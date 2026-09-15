# DocForge

DocForge is an open-source, extensible document conversion and manipulation platform designed as a modular monolith. Built with TypeScript, React, Node.js, and an underlying conversion engine, DocForge provides reliable and privacy-focused document transformations.

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

## Current Project Status

- **Phase 00.1 — Repository Initialization**: **COMPLETED**
  - Standard monorepo directory hierarchy established.
  - Baseline `.gitignore`, `.env.example`, `LICENSE`, and `README.md` configured.
  - No application code or dependencies installed yet (deferred to subsequent phases).

---

## License

This project is licensed under the [MIT License](LICENSE).

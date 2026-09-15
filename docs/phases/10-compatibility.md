# Phase 10 — Compatibility & Visual Fidelity

## Objective
Establish a rigorous document compatibility and visual fidelity verification framework in `tests/compatibility/`, validating that converted PDFs accurately preserve slide typography, layouts, tables, vector shapes, embedded images, and formatting across presentation versions.

## Why This Phase Exists
A conversion tool is only as good as the visual fidelity of its output. PowerPoint presentations frequently use complex styling, custom font pairings, embedded charts, and multi-column layouts that can degrade or render with overlapping text when converted via headless open-source engines. Phase 10 builds a repeatable compatibility suite and fixture benchmark to guarantee rendering quality.

## Scope

### In Scope
- Curating a comprehensive presentation fixture library in `tests/fixtures/`:
  - `fonts.pptx`: Standard and non-standard typography, fallback metrics.
  - `shapes-and-graphics.pptx`: Vector shapes, gradient fills, opacity, borders.
  - `tables-and-charts.pptx`: Embedded Excel charts, complex data tables.
  - `legacy-binary.ppt`: Real-world PowerPoint 97-2003 binary presentation.
  - `large-deck.pptx`: Multi-slide (50+ slides) presentation with high-res photos.
- Visual regression testing framework:
  - Rendering reference PDF pages and converted PDF pages to PNG (using `pdftoppm`).
  - Pixel-by-pixel perceptual image diffing (using `pixelmatch`).
  - Automated threshold reporting (proposed initial tolerance: flagging perceptual diffs exceeding a configurable threshold, e.g., >2%).
- Font packaging and fallback configuration guidelines.
- Automated compatibility test script (`scripts/run-compatibility-tests.sh`).

### Out of Scope
- Proprietary licensed Microsoft font bundling (system relies on open-source metric-compatible fonts like Liberation, Carlito, Caladea).
- Dynamic video/audio playback preservation in PDF (PDF format limitation).
- Interactive slide transitions.

## Dependencies
- Phase 02 (LibreOffice conversion engine).
- Phase 08 (PDF page to PNG rendering utility).
- Poppler utilities (`pdftoppm`) and `pixelmatch` diff library.

## Architecture Considerations
- **Metric-Compatible Font Substitutions**: Headless Linux environments often lack proprietary fonts (Calibri, Cambria, Arial). Without appropriate substitutions, text reflows awkwardly and clips off-screen. The environment must configure `fontconfig` mappings to open-source metrics-compatible equivalents (e.g., Carlito for Calibri, Caladea for Cambria, Liberation Sans for Arial).
- **Automated Regression Gates**: Any change to LibreOffice export flags or conversion pipelines must run through the compatibility benchmark to prevent visual regressions.

## Tasks

### TASK-10-01: Compatibility Fixture Library
- **Task ID**: `TASK-10-01`
- **Task Title**: Assemble curated test presentation fixtures
- **Description**: Populate `tests/fixtures/` with test files exercising fonts, complex shapes, tables, embedded raster images, and legacy `.ppt` binaries with documented expected layouts.
- **Expected Outcome**: Standardized fixture library covering all major presentation features.
- **Testing Expectations**: File size, licensing verification, and metadata checks.
- **Documentation Expectations**: Document fixture descriptions in `tests/fixtures/README.md`.
- **Dependencies**: None.

### TASK-10-02: Visual Regression Diff Runner
- **Task ID**: `TASK-10-02`
- **Task Title**: Implement pixelmatch visual regression pipeline
- **Description**: Create an automated runner in `tests/compatibility/` that converts each fixture, renders output pages to PNG, compares against golden reference images, and outputs visual diff artifacts.
- **Expected Outcome**: Automated script reporting percentage match per slide page.
- **Testing Expectations**: Regression tests asserting visual fidelity within defined tolerance thresholds (proposed initial target: <2% visual drift against golden references).
- **Documentation Expectations**: Document test execution in `docs/testing/README.md`.
- **Dependencies**: TASK-10-01, Phase 08.

### TASK-10-03: Font Substitution & Fontconfig Rules
- **Task ID**: `TASK-10-03`
- **Task Title**: Create system font configuration for metric compatibility
- **Description**: Provide `infrastructure/docker/fonts.conf` mapping standard MS Office fonts to open-source alternatives to eliminate text reflow defects.
- **Expected Outcome**: Consistent font rendering across different host operating systems.
- **Testing Expectations**: Comparison tests on `fonts.pptx` with and without fontconfig rules.
- **Documentation Expectations**: Document font mappings in `docs/architecture/README.md`.
- **Dependencies**: TASK-10-02.

## Validation Checklist
- [ ] Golden reference images exist for all standard fixtures.
- [ ] Compatibility suite runs automatically and generates diff images for mismatches.
- [ ] Text reflow does not cause text clipping or overlapping in sample presentations.
- [ ] Legacy `.ppt` files render with parity to `.pptx` counterparts.
- [ ] Font substitutions maintain identical slide line-wrapping.

## Exit Criteria
1. Compatibility suite executes and passes against all curated fixtures with zero critical rendering failures.
2. Visual diff reports generated and reviewed.
3. Code reviewed and merged via GitHub Flow.

## Expected Git/GitHub Workflow
- Branch: `feature/compatibility-test-suite`
- Commits: `test(compatibility): introduce visual regression suite and fixtures`
- PR: Requires visual test report attached.

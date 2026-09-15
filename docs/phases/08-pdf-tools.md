# Phase 08 — PDF Tools (Merge, Split, Compress & Image Extraction)

## Objective
Implement specialized PDF manipulation capabilities within DocForge, including PDF Merge (combining files), PDF Split (page extraction), PDF Compress (file size optimization), and PDF &rarr; PNG image rendering.

## Why This Phase Exists
A full-featured document platform must do more than unidirectional document-to-PDF conversion. Users frequently need to manipulate the generated PDFs: merging multiple slide decks into a master presentation, extracting a specific slide, compressing heavy PDFs for email attachments, or generating slide thumbnails for web previews.

## Scope

### In Scope
- PDF to Image extraction (`PDF` &rarr; `PNG` / `JPEG`):
  - Rendering individual pages or all pages as high-resolution images (using `pdftoppm` or `pdf2pic`).
- PDF Merge:
  - Ingesting an ordered array of PDF files and outputting a single unified PDF (using `pdf-lib` or `qpdf`).
- PDF Split:
  - Extracting page ranges (e.g., `1-3, 5, 8-10`) into separate or individual PDF documents.
- PDF Compress:
  - Downsampling raster images and stripping redundant metadata to reduce file size (using Ghostscript or `qpdf`).
- Extending `Converter` contract or creating a sibling `PdfToolService` in `packages/conversion-core`.
- API endpoints:
  - `POST /api/v1/tools/pdf-to-image`
  - `POST /api/v1/tools/pdf-merge`
  - `POST /api/v1/tools/pdf-split`
  - `POST /api/v1/tools/pdf-compress`
- Dedicated frontend tabs/views for each tool.

### Out of Scope
- Interactive in-browser PDF form filling or digital signing.
- Proprietary OCR engines.
- Password cracking or removing encrypted locks without authorization.

## Dependencies
- Phase 01 & 03 (Core abstractions and Backend API).
- Native utilities or lightweight libraries (`pdftoppm` from `poppler-utils`, `pdf-lib`, or `qpdf`).

## Architecture Considerations
- **Non-LibreOffice Engines**: LibreOffice is not optimal for PDF splitting, merging, or rasterizing. Phase 08 demonstrates engine diversity in the modular monolith by introducing specialized utilities (`pdftoppm`, `pdf-lib`, `qpdf`) while preserving the same workspace isolation and job lifecycle contracts.
- **Resource Constraints during Compression**: PDF compression (e.g., via Ghostscript) is memory-intensive. Strict timeouts and concurrency limits must apply identically to PDF tools.

## Tasks

### TASK-08-01: PDF Image Extractor Converter
- **Task ID**: `TASK-08-01`
- **Task Title**: Implement PDF to PNG converter using pdftoppm / pdf2pic
- **Description**: Implement a converter that renders PDF pages to PNG image files and bundles them into a zip or multi-page array.
- **Expected Outcome**: High-fidelity page image extraction from any standard PDF.
- **Testing Expectations**: Integration tests asserting valid PNG headers for converted slides.
- **Documentation Expectations**: Update format matrix in `specs/technical-specification.md`.
- **Dependencies**: None.

### TASK-08-02: PDF Merge & Split Utilities
- **Task ID**: `TASK-08-02`
- **Task Title**: Implement PDF Merge and Split operations using pdf-lib
- **Description**: Create pure TypeScript/Node manipulation functions to combine multiple PDFs into one document and split pages according to user-defined page ranges.
- **Expected Outcome**: Fast in-memory/disk merging and splitting without external C binary dependencies where possible.
- **Testing Expectations**: Unit tests verifying correct page counts after merge and split operations.
- **Documentation Expectations**: Document parameter schema in `docs/api/README.md`.
- **Dependencies**: None.

### TASK-08-03: PDF Compression Engine
- **Task ID**: `TASK-08-03`
- **Task Title**: Implement PDF Compress tool with quality presets
- **Description**: Implement compression utility offering presets (`screen`, `ebook`, `printer`) that reduces PDF byte size while preserving readability.
- **Expected Outcome**: Observable byte size reduction on image-heavy PDF documents.
- **Testing Expectations**: Integration tests asserting output size is less than input size for sample test fixtures.
- **Documentation Expectations**: Document compression presets in `docs/api/README.md`.
- **Dependencies**: TASK-08-02.

### TASK-08-04: PDF Tools Frontend Interface
- **Task ID**: `TASK-08-04`
- **Task Title**: Build PDF Tools interface in React web app
- **Description**: Add dedicated UI views for Merge (drag-to-reorder files), Split (page range input), Compress (preset slider), and PDF to PNG.
- **Expected Outcome**: Intuitive, dedicated manipulation workflows for users.
- **Testing Expectations**: UI component tests and manual workflow verification.
- **Documentation Expectations**: Update PRD with PDF manipulation features.
- **Dependencies**: TASK-08-01, TASK-08-02, TASK-08-03.

## Validation Checklist
- [ ] Multiple PDF files merge into a single PDF with correct page sequence.
- [ ] Specifying page range `1-2` extracts only the first two pages of a multi-page PDF.
- [ ] PDF compression yields a smaller file size without corrupting fonts or vector shapes.
- [ ] PDF to PNG exports high-resolution slide thumbnails.
- [ ] All operations execute in isolated workspaces with guaranteed cleanup.

## Exit Criteria
1. Automated tests for merge, split, compress, and image rendering pass.
2. Zero memory leaks observed across continuous PDF tool operations.
3. Code reviewed and merged via GitHub Flow.

## Expected Git/GitHub Workflow
- Branch: `feature/pdf-manipulation-tools`
- Commits: `feat(core): implement pdf merge, split, and compression tools`
- PR: Requires automated test pass for all PDF manipulation capabilities.

# Phase 07 — Office Document Support (DOCX & XLSX)

## Objective
Expand DocForge's conversion capabilities beyond presentations by adding support for Microsoft Word (`.doc`, `.docx`) and Microsoft Excel (`.xls`, `.xlsx`) documents converting to PDF using the pluggable `Converter` architecture.

## Why This Phase Exists
A core promise of the approved DocForge architecture is that the converter abstraction cleanly supports new document formats without redesigning the HTTP layer, job management, or frontend interface. Phase 07 validates this architectural extensibility by introducing text and spreadsheet document conversions.

## Scope

### In Scope
- Registering support in `packages/conversion-core`:
  - `DOCX` / `DOC` &rarr; `PDF` (Word processing documents)
  - `XLSX` / `XLS` &rarr; `PDF` (Spreadsheets)
- Magic byte and format integrity validators for OLE2 and OOXML Word/Excel formats:
  - DOCX: Zip archive checking for `word/document.xml`
  - XLSX: Zip archive checking for `xl/workbook.xml`
- Format-specific LibreOffice configuration flags (e.g., spreadsheet page scaling and landscape orientation hints).
- Test fixtures in `tests/fixtures/` (`sample.docx`, `sample.doc`, `sample.xlsx`, `sample.xls`).
- Frontend file-picker update to allow Word and Excel MIME types.

### Out of Scope
- Custom cell range selection or formula recalculation engines.
- PDF to Word reverse conversion (out of scope).
- Google Docs / Sheets API integrations.

## Dependencies
- Phase 01 (`Converter` and `ConverterRegistry`).
- Phase 02 (LibreOffice process sandbox).
- Phase 03 & 04 (API and Frontend workflows).

## Architecture Considerations
- **Extensible Registry Reuse**: The existing `LibreOfficeConverter` can handle multiple document types or delegate to dedicated sub-converters (`WordDocumentConverter`, `SpreadsheetConverter`) registered in `ConverterRegistry`.
- **Spreadsheet Print-Area Challenges**: Excel spreadsheets converted via headless LibreOffice can slice tables awkwardly across pages. The converter should apply sensible default PDF export options (`SinglePageSheets` or landscape orientation flags where appropriate).
- **Format Routing**: The API's request validation must seamlessly resolve the correct converter from `ConverterRegistry` based on the uploaded file's verified magic bytes.

## Tasks

### TASK-07-01: Word & Spreadsheet Format Validators
- **Task ID**: `TASK-07-01`
- **Task Title**: Add DOCX, DOC, XLSX, and XLS inspection and magic byte validators
- **Description**: Extend `packages/conversion-core` file inspection functions to distinguish Word and Excel documents and verify internal XML package markers.
- **Expected Outcome**: Accurate classification of Word and Excel documents; rejection of corrupt files.
- **Testing Expectations**: Unit tests with valid and corrupt `.docx` and `.xlsx` buffers.
- **Documentation Expectations**: Update supported format table in `specs/technical-specification.md`.
- **Dependencies**: None.

### TASK-07-02: Office Converters Implementation
- **Task ID**: `TASK-07-02`
- **Task Title**: Enable Word and Spreadsheet conversions in LibreOfficeConverter
- **Description**: Add format registration for `.doc`, `.docx`, `.xls`, and `.xlsx` to the converter registry with appropriate output filter configurations (`writer_pdf_Export`, `calc_pdf_Export`).
- **Expected Outcome**: Word and Excel documents convert to valid PDF output.
- **Testing Expectations**: Integration tests verifying conversion of `.docx`, `.doc`, `.xlsx`, `.xls` fixtures.
- **Documentation Expectations**: Inline documentation in `packages/conversion-core`.
- **Dependencies**: TASK-07-01.

### TASK-07-03: UI & API Format Expansion
- **Task ID**: `TASK-07-03`
- **Task Title**: Update API validation and frontend dropzone accepted formats
- **Description**: Update frontend dropzone accepted MIME types (`.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`) and update client-side validation badges.
- **Expected Outcome**: Users can drag and drop Word, Excel, and PowerPoint documents interchangeably.
- **Testing Expectations**: Manual verification of multi-format uploads via browser.
- **Documentation Expectations**: Update PRD and user documentation in `docs/product/PRD.md`.
- **Dependencies**: TASK-07-02.

## Validation Checklist
- [ ] `.docx` and `.doc` files convert to readable PDF with text formatting preserved.
- [ ] `.xlsx` and `.xls` files convert to PDF with readable sheet layouts.
- [ ] Uploading an unsupported file format (e.g., `.mp4`) is rejected with clear error.
- [ ] Frontend dropzone clearly communicates all supported formats.
- [ ] Integration tests pass for all four new document formats.

## Exit Criteria
1. Test suite successfully converts sample Word and Excel files.
2. Zero regressions in existing PPT/PPTX conversion pipeline.
3. Code reviewed and merged via GitHub Flow.

## Expected Git/GitHub Workflow
- Branch: `feature/office-document-converters`
- Commits: `feat(core): add DOCX and XLSX conversion support`
- PR: Requires automated multi-format test pass.

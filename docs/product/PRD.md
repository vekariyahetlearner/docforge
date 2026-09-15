# DocForge — Product Requirements Document (PRD)

## 1. Product Vision

DocForge is an open-source, reliable, self-hostable document conversion and manipulation platform designed as a modular monolith. Its mission is to provide privacy-first, developer-friendly, and high-fidelity file conversions without relying on proprietary cloud APIs or sacrificing document confidentiality.

DocForge delivers an intuitive web interface for non-technical users and an extensible, job-oriented API for automated workflows.

---

## 2. Problem Statement

Organizations, developers, and everyday users frequently need to convert presentations and documents into universal, immutable formats like PDF. Existing solutions suffer from significant shortcomings:

- **Third-Party Privacy Risks**: Public conversion websites often store, inspect, or retain confidential presentation decks and financial documents on untrusted servers.
- **Expensive SaaS Lock-in**: Commercial document processing APIs charge steep per-conversion fees and introduce external uptime dependencies.
- **Unreliable Open-Source Ad-hoc Scripts**: Local command-line conversions using LibreOffice or unmanaged scripts frequently fail silently, hang indefinitely, leak zombie processes, or produce poorly formatted output with missing fonts.

DocForge solves this by providing a self-hostable, containerized, and robust document conversion engine that treats process isolation, document fidelity, and resource cleanup as first-class guarantees.

---

## 3. Target User & Context

- **Privacy-Conscious Teams**: Organizations handling sensitive corporate slides, internal roadmaps, or confidential proposals that cannot be uploaded to public third-party services.
- **Software Developers**: Engineers requiring a clean, predictable HTTP API to integrate PPT/PPTX to PDF conversion into their internal tools and automated pipelines.
- **Everyday Users**: Individuals who need a quick, no-nonsense drag-and-drop web tool to transform `.ppt` and `.pptx` files into clean, readable PDFs without signing up or dealing with dark patterns.

---

## 4. Product Goals

1. **High Fidelity**: Deliver near-pixel-perfect conversion of Microsoft PowerPoint presentations (`.ppt`, `.pptx`) to standard PDF.
2. **Predictable Performance**: Complete typical conversions (<25 MB, <50 slides) within seconds under local or containerized execution.
3. **Operational Stability**: Never crash the host server due to bad input or hung conversion processes; enforce strict process timeouts and workspace isolation.
4. **Clean Extensibility**: Provide a modular architecture where additional format converters (DOCX, XLSX, images, PDF manipulation) can be plugged in without refactoring core routing or job management.

---

## 5. Non-Goals (Strictly Excluded from MVP)

To maintain disciplined focus, the following are explicitly **out of scope** for the initial MVP:

- User authentication, user accounts, and multi-tenant authorization.
- Billing, subscriptions, credits, and payment processing.
- Third-party cloud storage integrations (AWS S3, Google Cloud Storage, Dropbox).
- Distributed message brokers or external queue systems (e.g., Celery, RabbitMQ, Redis BullMQ).
- Real-time collaborative document editing or in-browser slide manipulation.
- Optical Character Recognition (OCR) or AI summarization.
- Public web analytics, tracking pixels, or telemetry beacons.

---

## 6. Initial MVP Scope

The DocForge MVP focuses exclusively on single-file presentation conversion:

### Supported Input Formats
- Microsoft PowerPoint Presentation (`.pptx` — Office Open XML)
- Microsoft PowerPoint 97-2003 Presentation (`.ppt` — Binary format)

### Output Format
- Portable Document Format (`.pdf` — ISO 32000 compliant)

### MVP User Journey

The MVP user journey is strictly linear and unburdened by extraneous steps:

```
[ PPT / PPTX File ]
         │
         ▼
┌──────────────────┐
│   Upload File    │   Drag & drop or file picker via React Web UI (or direct POST to API)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Validate Input  │   Inspect MIME type, magic bytes, file extension, and size limits (max 50 MB)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│     Convert      │   Isolated conversion workspace executed by LibreOffice in headless mode
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Validate Output │   Verify generated PDF existence, non-zero size, and valid %PDF header
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Download PDF   │   Stream converted PDF back to user with immediate access
└──────────────────┘
```

---

## 7. Future Expansion Roadmap

Following successful stabilization of the PPT/PPTX &rarr; PDF MVP, the platform will expand incrementally across subsequent phases:

1. **Office Document Conversions**:
   - `DOC` / `DOCX` &rarr; `PDF` (Word processing documents)
   - `XLS` / `XLSX` &rarr; `PDF` (Spreadsheets with print-area and sheet-scaling options)
2. **PDF Extraction & Visual Rendering**:
   - `PDF` &rarr; `PNG` / `JPG` (Slide thumbnail generation and page image extraction)
3. **PDF Manipulation Tools**:
   - `PDF Merge` (Combining multiple PDF documents in user-specified order)
   - `PDF Split` (Extracting individual pages or ranges)
   - `PDF Compress` (Optimizing PDF file size and downsampling embedded raster assets)
4. **Batch Conversions**:
   - Multi-file uploads with concurrent conversion and aggregated `.zip` archive download.

---

## 8. Functional Requirements

| ID | Requirement | Description |
| :--- | :--- | :--- |
| **FR-01** | **File Upload** | The system must accept `.ppt` and `.pptx` files up to a configurable maximum size (default 50 MB). |
| **FR-02** | **Strict Validation** | Files must be validated using magic-number inspection and filename verification prior to ingestion. |
| **FR-03** | **Job-Oriented Processing** | Each conversion must be tracked by a unique UUID `jobId` with distinct status states (`QUEUED`, `PROCESSING`, `COMPLETED`, `FAILED`, `EXPIRED`). |
| **FR-04** | **Conversion Engine** | Conversions must be executed via headless LibreOffice running in dedicated temporary workspaces with user profile isolation (`-env:UserInstallation`). |
| **FR-05** | **Execution Timeout** | Every conversion execution must be bounded by a strict hard timeout (default 60 seconds) with guaranteed child-process termination on timeout. |
| **FR-06** | **Output Verification** | Converted artifacts must be validated for existence, minimum size, and valid `%PDF-` signature before marking a job as `COMPLETED`. |
| **FR-07** | **Download Endpoint** | Converted files must be downloadable via a secure, unique job artifact endpoint with appropriate HTTP headers (`application/pdf`). |
| **FR-08** | **Lifecycle Cleanup** | Temporary workspaces, uploaded source files, and converted outputs must be automatically scrubbed upon download or expiration. |
| **FR-09** | **User Feedback** | The UI must display real-time progress indicators (uploading, converting, ready, failed) with clear, actionable error messages. |

---

## 9. Reliability Expectations

- **Process Containment**: A crash, memory leak, or hang in the underlying LibreOffice engine must never crash the Node.js API server.
- **Zombie Process Elimination**: Any detached LibreOffice processes spawned during execution or aborted due to client disconnection must be forcefully killed (`SIGKILL` after timeout).
- **Workspace Isolation**: Every job must execute inside its own ephemeral directory (`temp/workspaces/<jobId>`) with a clean user profile to prevent lock-file collisions across concurrent conversions.
- **Disk Protection**: Stale files older than a configurable retention period (proposed initial target: 1 hour) must be pruned by an automated garbage collection routine.

---

## 10. Security Expectations

- **Safe Parser Execution**: Conversions must run with macro execution permanently disabled (`--norestore`, `--nofirststartwizard`, `--nologo`).
- **Path Traversal Defense**: Filenames must be sanitized; input files must be saved with randomized UUID filenames inside isolated workspace directories.
- **MIME Sniffing & Magic Bytes**: The backend must verify actual file headers rather than trusting user-supplied `Content-Type` headers or file extensions alone.
- **Memory & Resource Caps**: File size limits must be enforced at both the HTTP server and stream levels before buffering full files in memory.
- **Zero Data Leakage**: Converted documents must only be accessible via their random, unguessable UUID job identifier.

---

## 11. Product Success Criteria

The following targets represent initial proposed engineering goals to be validated through testing:

1. **Conversion Accuracy (Target)**: Aim for 95%+ of standard PPT/PPTX test fixtures converting without visual distortions, overlapping text, or missing standard fonts.
2. **Performance Baseline (Target)**: Typical presentations (e.g., ~20 slides) targeted to convert to PDF within seconds under standard execution without unconstrained processing lag.
3. **Resilience (Target)**: Zero zombie LibreOffice processes remaining on disk or in the process table across repeated stress testing (e.g., planned multi-cycle sequential and concurrent test runs).
4. **Developer Experience**: A new developer can clone the repository, inspect the architecture documentation, and understand the system boundaries without ambiguity.

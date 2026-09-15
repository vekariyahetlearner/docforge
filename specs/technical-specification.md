# DocForge — Technical Specification

## 1. System Scope

This technical specification details the internal contracts, architectural abstractions, and behavioral requirements for DocForge. It serves as the authoritative implementation guide for engineering teams implementing the modular monolith document conversion platform.

DocForge provides document conversion capabilities through a decoupled architecture consisting of:
- **`apps/api`**: HTTP interface, request validation, job tracking, and file streaming.
- **`packages/conversion-core`**: Pluggable engine abstraction, converter registry, process isolation, and workspace orchestration.
- **`packages/shared`**: Shared TypeScript types, error codes, and validation schemas.

---

## 2. Supported Formats Matrix

### MVP Ingestion & Output

| Ingestion Format | MIME Type | Magic Bytes / Signature | Target Format | Engine |
| :--- | :--- | :--- | :--- | :--- |
| **PPTX** (OOXML) | `application/vnd.openxmlformats-officedocument.presentationml.presentation` | `50 4B 03 04` (ZIP archive containing `[Content_Types].xml` & `ppt/`) | `PDF` (`application/pdf`) | LibreOffice Headless |
| **PPT** (Binary) | `application/vnd.ms-powerpoint` | `D0 CF 11 E0 A1 B1 1A E1` (OLE2 Compound Document) | `PDF` (`application/pdf`) | LibreOffice Headless |

### Future Format Extensions (Architecture Prepared)
- `DOCX` / `DOC` &rarr; `PDF`
- `XLSX` / `XLS` &rarr; `PDF`
- `PDF` &rarr; `PNG` / `JPEG`
- `PDF` (Multi) &rarr; `PDF` (Merged)

---

## 3. Converter Abstraction

All format converters in DocForge must implement the standard `Converter` contract defined in `packages/conversion-core`.

```typescript
export interface ConversionInput {
  filePath: string;
  originalFilename: string;
  sourceFormat: string;       // e.g., 'pptx', 'ppt'
  targetFormat: string;       // e.g., 'pdf'
  mimeType: string;
  fileSizeBytes: number;
}

export interface ConversionContext {
  jobId: string;
  workspaceDir: string;
  timeoutMs: number;
  logger: Logger;
}

export interface ConversionResult {
  outputFilePath: string;
  outputFormat: string;
  mimeType: string;
  fileSizeBytes: number;
  durationMs: number;
}

export interface Converter {
  readonly name: string;
  readonly supportedSourceFormats: readonly string[];
  readonly supportedTargetFormats: readonly string[];

  canHandle(input: ConversionInput, targetFormat: string): boolean;
  convert(input: ConversionInput, context: ConversionContext): Promise<ConversionResult>;
}
```

### Behavioral Guarantees for Converters
1. **Purity of State**: Converters must be stateless. They receive all runtime dependencies and directory paths via `ConversionContext`.
2. **Workspace Encapsulation**: A converter may only read from and write to the designated `context.workspaceDir`.
3. **Process Supervision**: Any external sub-process (e.g., LibreOffice CLI) must be spawned with an explicit execution timeout, redirected I/O streams, and isolated environment variables.

---

## 4. Converter Registry

The `ConverterRegistry` is a centralized, in-memory catalog that manages converter registrations and resolves the appropriate engine for a given conversion request.

```typescript
export interface ConverterRegistry {
  register(converter: Converter): void;
  resolve(input: ConversionInput, targetFormat: string): Converter;
  listSupportedConversions(): Array<{ source: string; target: string; converterName: string }>;
}
```

### Resolution Rules
1. When a conversion request arrives, the registry queries registered converters in order of priority using `converter.canHandle(input, targetFormat)`.
2. If exactly one matching converter is found, it is returned.
3. If no matching converter can handle the requested combination, the registry raises a structured `UnsupportedConversionError`.
4. If multiple converters match, resolution proceeds based on explicit priority registration (e.g., native converter preferred over fallback converter).

---

## 5. Conversion Orchestration Pipeline

Conversion execution is orchestrated sequentially through a deterministic pipeline:

```
┌─────────────────────────┐
│ 1. Resolve Converter    │ Query ConverterRegistry with input metadata and target format
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 2. Validate Input       │ Magic byte check, size validation, format matching
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 3. Create Job           │ Initialize Job record with status 'QUEUED' and generate UUID
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 4. Create Workspace     │ Create dedicated ephemeral folder: /tmp/workspaces/<jobId>
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 5. Execute Converter    │ Update state to 'PROCESSING'; spawn conversion process
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 6. Validate Output      │ Verify output file exists, non-empty, and valid header (%PDF-)
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 7. Register Result      │ Transition job to 'COMPLETED'; record output path & metadata
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 8. Return Result        │ Respond to client with job completion / download metadata
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 9. Cleanup              │ Remove ephemeral workspace; schedule output pruning
└─────────────────────────┘
```

---

## 6. Job Lifecycle & States

Every conversion request is tracked as an asynchronous or synchronous job via a strict finite state machine:

```
                  ┌────────────┐
                  │   QUEUED   │
                  └─────┬──────┘
                        │ (Processor picks up job)
                        ▼
                  ┌────────────┐
       ┌──────────┤ PROCESSING ├──────────┐
       │          └─────┬──────┘          │
       │ (Error /       │ (Success)       │ (Timeout /
       │  Validation)   ▼                 │  Crash)
       │          ┌───────────┐           │
       │          │ COMPLETED │           │
       │          └─────┬─────┘           │
       │                │                 │
       ▼                ▼                 ▼
 ┌───────────┐    ┌───────────┐     ┌───────────┐
 │  FAILED   │    │  EXPIRED  │     │  FAILED   │
 └───────────┘    └───────────┘     └───────────┘
```

### State Definitions
- **`QUEUED`**: The file has been uploaded and accepted; waiting for execution capacity.
- **`PROCESSING`**: The converter is currently executing in its isolated workspace.
- **`COMPLETED`**: The conversion succeeded, and output verification passed. The artifact is ready for download.
- **`FAILED`**: Conversion halted due to validation failure, process crash, timeout, or invalid output. A structured error payload is retained.
- **`EXPIRED`**: The retention TTL (default 1 hour) elapsed, and artifacts have been scrubbed from disk.

---

## 7. File Lifecycle & Storage Architecture

### Directory Hierarchy
All runtime file storage is organized in decoupled locations governed by configuration:

```
<project_root>/
├── uploads/               # Temporary landing zone for incoming multipart uploads
│   └── <uploadId>.<ext>
├── outputs/               # Verified converted artifacts ready for client download
│   └── <jobId>.pdf
└── temp/
    └── workspaces/        # Ephemeral per-job execution folders
        └── <jobId>/
            ├── user-profile/  # Isolated LibreOffice profile (-env:UserInstallation)
            ├── input.<ext>    # Sanitized input file
            └── output.pdf     # Raw output generated by engine
```

### Storage Retention & Cleanup Rules
1. **Immediate Workspace Teardown**: The ephemeral `temp/workspaces/<jobId>` folder must be purged immediately after output validation, regardless of whether the conversion succeeded or failed.
2. **Download-and-Purge (Optional)**: Upon successful client download, artifacts can be marked for immediate deletion or scheduled for TTL cleanup.
3. **Automated Janitor Service**: An internal periodic timer scans `uploads/` and `outputs/` at configurable intervals (proposed initial target: periodic sweeps against a configurable default 1-hour retention TTL), removing expired files.

---

## 8. Validation Standards

### Input Validation
- **Extension Matching**: File extension must match allowed extensions (`.ppt`, `.pptx`).
- **Magic Number Inspection**:
  - `PPTX`: Must begin with standard PK Zip header `50 4B 03 04`.
  - `PPT`: Must begin with Microsoft Compound File Binary format header `D0 CF 11 E0 A1 B1 1A E1`.
- **File Size**: Stream rejected with HTTP `413 Payload Too Large` if exceeding `MAX_FILE_SIZE_MB` (default 50 MB).
- **Zero-Byte Check**: Empty files are rejected immediately with HTTP `400 Bad Request`.

### Output Validation
- **Existence**: Destination file must exist on disk after process exits.
- **Non-Empty**: Output size must be greater than 100 bytes.
- **Header Check**: First 4 bytes must be `%PDF` (`25 50 44 46`).
- **EOF Marker Check**: Last 1024 bytes must contain `%%EOF`.

---

## 9. Error Taxonomy

DocForge uses categorized, machine-readable errors across all layers:

| Error Code | HTTP Status | Description |
| :--- | :--- | :--- |
| `INVALID_INPUT_FORMAT` | 400 | File extension is not supported by any registered converter. |
| `MAGIC_BYTES_MISMATCH` | 400 | File contents do not match expected format magic numbers. |
| `FILE_SIZE_EXCEEDED` | 413 | Uploaded file exceeds maximum allowed threshold. |
| `CONVERSION_TIMEOUT` | 504 | Engine execution exceeded allotted time limit. |
| `CONVERTER_CRASH` | 500 | Engine process exited unexpectedly with a non-zero exit code. |
| `OUTPUT_VALIDATION_FAILED` | 500 | Converted output is corrupted or missing PDF markers. |
| `JOB_NOT_FOUND` | 404 | Requested job ID does not exist or has already expired. |
| `JOB_STILL_PROCESSING` | 409 | Attempted to download result before conversion completion. |

---

## 10. Conceptual API Endpoints

The API is job-oriented and supports asynchronous polling:

### `POST /api/v1/conversions`
- **Description**: Upload presentation file and initialize conversion job.
- **Request**: Multipart form-data containing `file` and optional `targetFormat` (defaults to `pdf`).
- **Response**: `202 Accepted`
  ```json
  {
    "jobId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "status": "QUEUED",
    "sourceFormat": "pptx",
    "targetFormat": "pdf",
    "createdAt": "2026-09-15T18:00:00.000Z"
  }
  ```

### `GET /api/v1/conversions/:jobId`
- **Description**: Poll conversion status and retrieve completion metadata.
- **Response**: `200 OK`
  ```json
  {
    "jobId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "status": "COMPLETED",
    "sourceFormat": "pptx",
    "targetFormat": "pdf",
    "fileSizeBytes": 1048576,
    "durationMs": 1420,
    "downloadUrl": "/api/v1/conversions/f47ac10b-58cc-4372-a567-0e02b2c3d479/download"
  }
  ```

### `GET /api/v1/conversions/:jobId/download`
- **Description**: Stream the converted PDF binary file.
- **Response**: `200 OK` with `Content-Type: application/pdf` and `Content-Disposition: attachment; filename="presentation.pdf"`.

---

## 11. Security & Process Isolation

1. **User Profile Sandboxing**: Every LibreOffice instance runs with a dedicated user profile directory specified via:
   `-env:UserInstallation=file:///tmp/workspaces/<jobId>/user-profile`
   This isolates cache, configuration, and crash recovery state across concurrent executions.
2. **Safe Execution Flags**: Headless conversion invokes LibreOffice with:
   `--headless --norestore --nofirststartwizard --nologo --nodefault --convert-to pdf`
3. **No Network Access**: The conversion sub-process must not have outbound socket permissions where containerization or OS restrictions permit.
4. **Filename Sanitization**: Uploaded files are stripped of special characters and assigned a cryptographically random UUID during internal processing to defeat directory traversal attacks.

---

## 12. Testing Expectations

- **Unit Tests**: Converter contract validation, input validation logic, registry resolution, and error serialization.
- **Integration Tests**: End-to-end execution of LibreOffice CLI within an isolated workspace using real `.ppt` and `.pptx` fixtures.
- **Negative Tests**: Corrupted files, renamed binary files (e.g., an executable renamed to `.pptx`), zero-byte files, and simulated process timeouts.
- **Cleanup Verification Tests**: Asserting that zero temporary files or zombie processes persist after successful, failed, or timed-out conversions.

# DocForge — API Documentation

This directory contains endpoint contracts, request/response schemas, error code definitions, and integration guides for the DocForge HTTP REST API (`apps/api`).

---

## Purpose & Scope

The API documentation serves as the contract reference for frontend engineers, external client integrators, and API developers.

### What Belongs Here
- Detailed endpoint specifications (`POST /api/v1/conversions`, `GET /api/v1/conversions/:jobId`, etc.).
- Request headers, query parameters, and multipart payload guidelines.
- Standard JSON envelope definitions for responses and errors.
- Status polling protocols and streaming download behavior.
- OpenAPI / Swagger schema specifications.

### What Belongs Elsewhere
- Product goals and business context &rarr; [`docs/product/PRD.md`](../product/PRD.md)
- Low-level converter abstractions and internal interfaces &rarr; [`specs/technical-specification.md`](../../specs/technical-specification.md)
- Internal system architecture and workspace management &rarr; [`docs/architecture/README.md`](../architecture/README.md)

---

## API Design Conventions

### Base URL
All API routes are prefixed by version:
```
http://localhost:3001/api/v1
```

### Standard Response Envelopes

#### Success Envelope (Job Creation)
```json
{
  "jobId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "QUEUED",
  "sourceFormat": "pptx",
  "targetFormat": "pdf",
  "createdAt": "2026-09-15T18:00:00.000Z"
}
```

#### Status Envelope (Completed Job)
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

#### Error Envelope
All error responses return a standardized, machine-readable JSON object:
```json
{
  "error": {
    "code": "INVALID_INPUT_FORMAT",
    "message": "The uploaded file format is not supported. Only .ppt and .pptx are accepted.",
    "details": {
      "detectedExtension": "exe",
      "detectedMimeType": "application/x-msdownload"
    },
    "timestamp": "2026-09-15T18:00:00.000Z"
  }
}
```

---

## Endpoint Index (MVP & Planned Operations)

| Method | Path | Description | Expected Status |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/conversions` | Upload presentation file and start conversion job (MVP) | `202 Accepted` |
| `GET` | `/api/v1/conversions/:jobId` | Poll conversion status and retrieve download link (MVP) | `200 OK` |
| `GET` | `/api/v1/conversions/:jobId/download` | Stream converted PDF file (MVP) | `200 OK` (`application/pdf`) |
| `POST` | `/api/v1/conversions/:jobId/cancel` | Abort in-flight conversion (planned future operation; marks job `FAILED`) | `200 OK` |
| `GET` | `/health` | Server liveness and basic health check (MVP) | `200 OK` |

---

## Documentation Lifecycle
When an endpoint is added, modified, deprecated, or removed, this file and [`specs/technical-specification.md`](../../specs/technical-specification.md) MUST be updated simultaneously.

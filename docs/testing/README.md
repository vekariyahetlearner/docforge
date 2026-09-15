# DocForge — Testing Strategy & Guidelines

This directory documents the comprehensive testing strategy, quality standards, test tooling, and test data management policies for DocForge.

---

## Testing Philosophy & Pyramid

DocForge implements a multi-tiered testing strategy ensuring that every layer of the modular monolith is independently verified with the fastest possible feedback loop.

```
       / \
      / E2E \         Playwright (Browser user journey: Upload -> Convert -> Download)
     /-------\
    / Visual  \       Pixelmatch & pdftoppm (Fidelity comparison against reference PDFs)
   /-----------\
  / Integration \     Supertest & LibreOffice CLI (HTTP routes, process sandboxes)
 /---------------\
/   Unit Tests    \   Vitest (Fast logic, validators, registry resolution, error codes)
-------------------
```

---

## What Belongs Here
- Test execution commands and environment prerequisites.
- Test category definitions (Unit, Integration, Compatibility, E2E).
- Code coverage thresholds and quality gate configurations.
- Guidelines for managing and adding presentation fixtures in `tests/fixtures/`.
- Instructions for running visual regression and perceptual diff tests.

---

## Test Categories

### 1. Unit Tests (`*.spec.ts`)
- **Location**: Co-located with source code across `packages/` and `apps/`.
- **Purpose**: Verify pure algorithms, format inspection logic, magic byte detection, registry registration/resolution, and error mapping.
- **Execution Speed**: Milliseconds; runs completely hermetic without external processes.

### 2. Integration Tests (`tests/integration/`)
- **Location**: `tests/` and package-level test suites.
- **Purpose**: Exercise real subprocess execution of LibreOffice in ephemeral sandboxes, API routes via Supertest, and file streaming.
- **Prerequisites**: Local LibreOffice installation or Docker container runtime.

### 3. Compatibility & Visual Diff Tests (`tests/compatibility/`)
- **Location**: `tests/compatibility/`.
- **Purpose**: Verify visual fidelity by rendering converted PDFs to PNGs and performing pixel-by-pixel comparisons against golden reference images.
- **Threshold**: Flags if visual drift exceeds agreed tolerance thresholds (proposed initial target: >2% perceptual drift).

### 4. End-to-End Tests (`tests/e2e/`)
- **Location**: `tests/e2e/`.
- **Purpose**: Validate complete browser user journeys using headless Playwright: launching frontend, uploading a presentation, observing the progress state, and asserting valid PDF download.

---

## Standard Test Commands (Once Tooling is Configured)

| Command | Purpose | Target |
| :--- | :--- | :--- |
| `npm run test:unit` | Fast unit test suite | All packages |
| `npm run test:integration` | LibreOffice & API integration tests | `conversion-core`, `apps/api` |
| `npm run test:compatibility` | Visual regression test suite | `tests/compatibility` |
| `npm run test:e2e` | Playwright browser journey | `tests/e2e` |
| `npm run test:coverage` | Consolidated code coverage report | All packages |

---

## Code Coverage Standards
- Initial proposed quality target: Minimum **85% statement coverage** on `packages/conversion-core` and `packages/shared`.
- Pull requests failing the agreed coverage gate must not be merged.

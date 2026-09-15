# Phase 04 — Frontend MVP

## Objective
Build the client-side single-page React application in `apps/web` providing an intuitive, polished, and responsive user experience for uploading PPT/PPTX presentations, tracking conversion progress, and downloading the resulting PDF.

## Why This Phase Exists
A document conversion tool must be accessible to non-technical users. Phase 04 implements the complete end-to-end user journey defined in the PRD, connecting the browser directly to the Express backend API with rich visual feedback, clear error states, and zero friction.

## Scope

### In Scope
- React application scaffolding in `apps/web` using Vite and TypeScript.
- Clean design system with CSS custom properties (tokens for colors, typography, spacing, elevations).
- Drag-and-drop file dropzone supporting `.ppt` and `.pptx` selection.
- Client-side pre-upload validation (file extension, MIME type, max file size check).
- Upload progress bar and conversion status polling hook (`useConversionJob`).
- Visual states:
  - Idle (Drag and drop presentation file)
  - Uploading (Byte upload progress)
  - Converting (Server-side conversion in progress)
  - Completed (Success confirmation, file size summary, download button)
  - Failed (User-friendly error message, retry button)
- Direct PDF download trigger on button click.
- Responsive layout supporting desktop, tablet, and mobile browsers.

### Out of Scope
- User authentication, login screens, or profile dashboards.
- Multi-file batch queue management in UI (scheduled for Phase 06).
- In-browser PDF preview/rendering canvas (deferred).
- Dark/light mode theme toggles or complex theme customization.

## Dependencies
- Phase 03 (Backend API running and accessible at `FRONTEND_URL` / `VITE_API_URL`).
- Node.js runtime and Vite build tool.

## Architecture Considerations
- **Vanilla CSS / Design System**: Use clean, modern CSS with custom variables for full styling flexibility without heavy third-party CSS framework lock-in.
- **Resilient Polling**: Polling logic in `useConversionJob` must back off gracefully, stop upon terminal states (`COMPLETED`, `FAILED`, `EXPIRED`), and handle transient network interruptions.
- **Clear State Demarcation**: The UI must unambiguously communicate what stage the request is in (uploading bytes vs. converting on server vs. ready to download).

## Tasks

### TASK-04-01: React App Scaffolding & Design Tokens
- **Task ID**: `TASK-04-01`
- **Task Title**: Scaffold apps/web with Vite, TypeScript, and CSS Design System
- **Description**: Set up Vite React project in `apps/web`, configure TypeScript, and establish base `index.css` defining semantic color tokens, typography, and layout utilities.
- **Expected Outcome**: Clean, fast development server running with baseline styling.
- **Testing Expectations**: Build check (`vite build`) and lint pass.
- **Documentation Expectations**: Document styling tokens in `apps/web/README.md`.
- **Dependencies**: None.

### TASK-04-02: File Dropzone Component
- **Task ID**: `TASK-04-02`
- **Task Title**: Create drag-and-drop upload zone with client validation
- **Description**: Build an accessible dropzone supporting file drag-and-drop and standard file picker. Validate `.ppt` and `.pptx` extension and size (< 50 MB) before firing upload.
- **Expected Outcome**: Dropzone with active drag states and client validation feedback.
- **Testing Expectations**: Component tests verifying file acceptance and rejection of invalid file types.
- **Documentation Expectations**: Component docstrings and prop types.
- **Dependencies**: TASK-04-01.

### TASK-04-03: Conversion API Client & Polling Hook
- **Task ID**: `TASK-04-03`
- **Task Title**: Implement API client and useConversionJob hook
- **Description**: Create typed API client service for calling `POST /api/v1/conversions` and `GET /api/v1/conversions/:jobId`. Implement React hook managing polling loop with timeout guards.
- **Expected Outcome**: React hook returning current status, progress, error, and download URL.
- **Testing Expectations**: Unit tests with mocked API responses for all job states.
- **Documentation Expectations**: Document hook API in `apps/web/README.md`.
- **Dependencies**: TASK-04-01, Phase 03.

### TASK-04-04: Status Display & Download Action
- **Task ID**: `TASK-04-04`
- **Task Title**: Build ConversionStatusCard and DownloadButton components
- **Description**: Implement UI card displaying active state (uploading, converting, completed, failed), error details with retry option, and one-click PDF download button.
- **Expected Outcome**: Complete end-to-end user workflow operational in browser.
- **Testing Expectations**: Manual verification and integration test of full UI workflow.
- **Documentation Expectations**: Screenshots or workflow diagram in `docs/phases/04-frontend-mvp.md`.
- **Dependencies**: TASK-04-02, TASK-04-03.

## Validation Checklist
- [ ] User can drag-and-drop a `.pptx` or `.ppt` file onto the upload zone.
- [ ] Non-presentation files (e.g., `.png`, `.exe`) are rejected before uploading.
- [ ] Files larger than 50 MB are flagged with a clear error before uploading.
- [ ] UI displays distinct visual states for uploading, converting, and completed.
- [ ] Clicking "Download PDF" retrieves the converted file with the original presentation name (`presentation.pdf`).
- [ ] Failed conversions display a meaningful error message with a "Try Again" action.

## Exit Criteria
1. End-to-end manual verification of PPT &rarr; PDF conversion from the browser succeeds.
2. Frontend builds cleanly with zero TypeScript or lint errors.
3. Code reviewed and merged via GitHub Flow.

## Expected Git/GitHub Workflow
- Branch: `feature/frontend-react-mvp`
- Commits: `feat(web): implement presentation dropzone and conversion status card`
- PR: Requires visual review and API integration confirmation.

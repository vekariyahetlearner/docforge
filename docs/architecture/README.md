# DocForge — Architecture Documentation

This directory contains system-level architecture specifications, architectural diagrams, component boundaries, and operational runbooks for DocForge.

---

## Purpose & Scope

The architecture documentation serves as the high-level technical blueprint of DocForge. It describes how the decoupled components of our **Modular Monolith** communicate, how runtime storage is managed, and how system resilience is maintained across process boundaries.

### What Belongs Here
- System-level architecture overviews and data flow diagrams.
- Component interface definitions and package dependency graphs.
- Subsystem deep-dives (e.g., LibreOffice sandboxing, font metric substitution, workspace management).
- Operational runbooks (`RUNBOOK.md`) and deployment guides.
- System-wide non-functional requirements (security boundaries, performance targets).

### What Belongs Elsewhere
- Product goals, user journeys, and feature prioritization &rarr; [`docs/product/PRD.md`](../product/PRD.md)
- Low-level code interfaces, types, and error codes &rarr; [`specs/technical-specification.md`](../../specs/technical-specification.md)
- HTTP endpoint contracts and request/response payloads &rarr; [`docs/api/README.md`](../api/README.md)
- Architectural Decision Records &rarr; [`docs/decisions/README.md`](../decisions/README.md)

---

## Architectural Principles

1. **Modular Monolith**: All code resides in a unified monorepo organized into independent packages and applications. We prioritize shared memory and local process execution over distributed microservices.
2. **Strict Engine Isolation**: Conversion logic (`packages/conversion-core`) has zero awareness of HTTP request lifecycles (`apps/api`) or user interfaces (`apps/web`).
3. **Pluggable Converters**: Engines are swappable through the unified `Converter` interface (`canHandle`, `convert`).
4. **Hermetic Ephemeral Workspaces**: Every file conversion executes inside a dedicated, isolated temporary workspace directory that is completely destroyed on job completion.

---

## Documentation Lifecycle & Living State

Documentation in DocForge is treated as **living project state**. It must be kept strictly synchronized with code changes. Whenever the system evolves, update the authoritative document according to this lifecycle matrix:

| Trigger Event | Target Document to Update |
| :--- | :--- |
| Product requirement or feature scope changes | [`docs/product/PRD.md`](../product/PRD.md) |
| Milestone roadmap or phase boundaries change | [`docs/phases/`](../phases/) |
| Specific phase tasks, acceptance criteria, or scope change | Target phase document (e.g., [`docs/phases/02-ppt-pdf.md`](../phases/02-ppt-pdf.md)) |
| Low-level technical behavior, types, or lifecycle change | [`specs/technical-specification.md`](../../specs/technical-specification.md) |
| System architecture, boundaries, or runtime patterns change | [`docs/architecture/README.md`](./README.md) |
| HTTP endpoints, query parameters, or API contracts change | [`docs/api/README.md`](../api/README.md) |
| Testing strategy, runners, or quality gates change | [`docs/testing/README.md`](../testing/README.md) |
| Visual fidelity or compatibility test results change | [`docs/phases/10-compatibility.md`](../phases/10-compatibility.md) |
| Durable technical decision or convention established | [`ai/Memory.md`](../../ai/Memory.md) |
| Architecturally significant decision made between options | [`docs/decisions/ADR-XXX.md`](../decisions/README.md) |
| Bug, failure mode, or anti-pattern discovered | [`ai/Mistakes.md`](../../ai/Mistakes.md) |

> [!IMPORTANT]
> Documentation must be updated because project state changed, not merely to generate activity. Never update code without synchronizing its corresponding documentation.

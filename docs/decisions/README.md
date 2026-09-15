# DocForge — Architectural Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for DocForge.

---

## Purpose & Scope

An Architectural Decision Record (ADR) captures a significant architectural decision along with its context, considered options, trade-offs, and consequences. ADRs document *why* the architecture is shaped the way it is and preserve institutional memory across time and engineering contributors.

### When to Write an ADR
Write an ADR whenever a technical decision:
- Alters the fundamental system architecture (e.g., changing from in-memory jobs to SQLite or Redis).
- Introduces or swaps a core conversion engine (e.g., adding `qpdf` or Poppler alongside LibreOffice).
- Establishes a major architectural pattern or convention across multiple packages.
- Is difficult to reverse and carries substantial performance, security, or maintenance trade-offs.

*Do not write ADRs for routine bug fixes, cosmetic UI tweaks, or minor refactorings.*

---

## ADR Template & Structure

All ADRs must be numbered sequentially (`ADR-001-<kebab-title>.md`) and adhere to this structure:

```markdown
# ADR-XXX: Title of the Architectural Decision

## Status
[ Proposed | Accepted | Deprecated | Superseded by ADR-YYY ]

## Date
YYYY-MM-DD

## Context & Problem Statement
Describe the context, user need, or technical constraint that necessitates a decision. What problem are we trying to solve? Why can it not be resolved with existing patterns?

## Options Considered
Detail 2–3 viable alternatives that were evaluated:
- **Option 1**: Description, pros, and cons.
- **Option 2**: Description, pros, and cons.
- **Option 3**: Description, pros, and cons.

## Decision
State the chosen option clearly and unambiguously.

## Reasoning
Explain why this option was selected over the alternatives. Address:
- How it aligns with DocForge principles (Modular Monolith, privacy, simplicity).
- Impact on performance, developer velocity, and maintainability.
- Why the trade-offs of the chosen solution are acceptable.

## Consequences
Detail the consequences of this decision, both positive and negative:
- **Positive**: Capabilities unlocked, performance improvements, simplified logic.
- **Negative / Risks**: Added operational burden, constraints imposed, migration effort.
- **Mitigations**: How we plan to manage the risks or drawbacks.
```

---

## Current Status

*No custom ADRs have been created yet.* The foundational architecture decisions (Modular Monolith, React + Node.js/Express + TypeScript, LibreOffice, GitHub Flow) are documented in [`ai/Memory.md`](../../ai/Memory.md) and [`specs/technical-specification.md`](../../specs/technical-specification.md).

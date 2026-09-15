# ADR-001: Monorepo Workspace Tooling & Package Management

## Status
Accepted

## Date
2026-09-15

## Context & Problem Statement
DocForge is architected as a modular monolith containing decoupled applications (`apps/web`, `apps/api`) and reusable domain packages (`packages/conversion-core`, `packages/shared`, `packages/config`). To enable local development, consistent dependency resolution, and strict architectural boundaries without premature complexity, we require a lightweight, reliable monorepo workspace management mechanism.

## Options Considered

### Option 1: Native npm Workspaces
- **Description**: Standard workspace support built directly into npm (v9+ / Node.js 20+).
- **Pros**: Zero external dependencies; no requirement to install global CLIs; seamless compatibility across developer machines and GitHub Actions environments; minimal maintenance overhead.
- **Cons**: Lacks advanced remote caching or distributed task graphs (neither of which is needed for our modular monolith scale).

### Option 2: pnpm Workspaces
- **Description**: Fast, disk-efficient package manager using hard links and isolated `node_modules`.
- **Pros**: Strict dependency hoisting; very fast installs.
- **Cons**: Requires installing pnpm globally; introduces potential friction in environments where only Node.js and npm are pre-installed.

### Option 3: Turborepo / Nx
- **Description**: Specialized monorepo build orchestration frameworks with task caching.
- **Pros**: Parallel task execution, dependency-graph hashing, and build caching.
- **Cons**: High conceptual overhead, speculative complexity for an initial project phase, configuration sprawl, and violation of the "Rule against premature abstraction".

## Decision
Adopt **Option 1: Native npm Workspaces** in combination with **TypeScript Project References (`tsc -b`)**.

## Reasoning
1. **Simplicity & Minimum Tooling**: Node.js v22 and npm v9 are natively available in the development and CI environments. npm workspaces provide all required capabilities (workspace linking, scoped packages `@docforge/*`, and atomic lockfile generation) with zero additional tools.
2. **Alignment with Modular Monolith**: Our architecture does not require microservice build matrices or distributed computation. A simple, predictable workspace structure allows rapid local iteration.
3. **TypeScript Project References**: Using `composite: true` and project references in `tsconfig.json` gives us dependency-ordered incremental builds and strict typechecking without needing external build systems.

## Consequences
- **Positive**:
  - Developers can clone the repository and run `npm install` immediately without installing third-party package managers or global CLIs.
  - Clear architectural boundaries enforced by package manifests (`@docforge/shared`, `@docforge/conversion-core`, etc.).
  - Single, authoritative `package-lock.json` at repository root.
- **Negative / Risks**:
  - npm does not provide remote build artifact caching out of the box.
- **Mitigations**:
  - If monorepo build times ever become a bottleneck in later phases (e.g., Phase 14 CI/CD), lightweight build caching can be evaluated without changing the underlying package structure.

# Tavily CLI Reliability Sprint

## What This Is

This project evolves the existing unofficial Tavily CLI into a reliability-first tool for production use. The current CLI already covers core Tavily operations (search, extract, crawl, map, research, setup/auth), and this milestone focuses on diagnosis, robustness, and architecture refactoring so releases are safer and easier to maintain.

## Core Value

Running Tavily workflows from the terminal must be dependable, debuggable, and release-safe.

## Requirements

### Validated

- ✓ Users can run Tavily `search` from CLI — existing command set
- ✓ Users can run Tavily `extract` from CLI — existing command set
- ✓ Users can run Tavily `crawl` and `map` from CLI — existing command set
- ✓ Users can run Tavily `research` and fetch research status — existing command set
- ✓ Users can authenticate/login/logout and check status — existing command set
- ✓ Users can bootstrap skills and MCP setup — existing `init` and `setup` flows
- ✓ Users can run `tavily doctor` with deterministic JSON/text diagnostics and exit semantics — shipped in v1.0
- ✓ Users can run `tavily doctor --fix` with safe allowlisted local remediations and dry-run preview — shipped in v1.0
- ✓ Release pipeline enforces `type-check`, `test`, `build`, and `smoke` before publish — shipped in v1.0
- ✓ Release operators have migration and release checklist runbooks — shipped in v1.0

### Active

- [ ] Design and scope v1.1 automation workflows (`batch`, orchestration contracts, resumability).
- [ ] Define reliability guardrails for long-running automation jobs (retry/backoff, partial failure handling).
- [ ] Add milestone-level retrospective metrics for execution quality and cycle-time tracking.

### Out of Scope

- Full backward compatibility with all previous CLI flags/behavior — not required for this milestone.
- Workflow automation features (`batch`, multi-step YAML pipelines) — now active for v1.1 planning.
- GUI/TUI experience — terminal CLI only.

## Context

The repository is a TypeScript CLI package (`@syxs/tavily-cli`) with modular command registration, shared runtime command utilities, typed Tavily request adapters, and Vitest-based regression coverage. v1.0 shipped end-to-end diagnosis (`doctor`), safe remediation (`doctor --fix`), release smoke validation (`pnpm run smoke`), and release operator docs (`docs/migration.md`, `docs/release-checklist.md`).

## Constraints

- **Timeline**: 1 week to release — prioritize high-leverage reliability work.
- **Compatibility**: Breaking changes are acceptable if end-to-end functionality is improved.
- **Stack**: Keep Node.js + TypeScript + Commander foundation; no full rewrite.
- **Scope Discipline**: v1 focuses on diagnosis/confiabilidade/refactor; automation moved to v1.1.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Do not rewrite the CLI from scratch | Current base is functional and can be improved faster with focused refactor | ✓ Validated in v1.0 |
| Prioritize diagnosis + reliability in v1 | Directly reduces support burden and release risk | ✓ Validated in v1.0 |
| Defer automation workflows to v1.1 | Keeps 1-week milestone realistic and focused | ✓ Validated in v1.0 |
| Allow breaking changes where necessary | Functionality and maintainability matter more than strict backward compatibility now | ✓ Validated in v1.0 |

## Current State

- **Shipped milestone:** v1.0
- **Release status:** complete and verified (4 phases, 12 plans)
- **Operational gates:** `pnpm run type-check`, `pnpm run test`, `pnpm run build`, `pnpm run smoke`
- **Diagnostic baseline:** stable doctor checks + safe fix path with deterministic reporting

## Next Milestone Goals

- Define v1.1 automation requirements (`AUTO-01` .. `AUTO-04`) and roadmap phases.
- Preserve v1.0 reliability contracts while introducing automation execution surfaces.
- Maintain release gate discipline (type-check/test/build/smoke) as non-negotiable baseline.

---
*Last updated: 2026-02-27 after v1.0 milestone completion*

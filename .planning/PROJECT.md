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

### Active

- [ ] Add diagnostics command(s) for environment and integration health.
- [ ] Refactor command architecture to reduce fragility and improve maintainability.
- [ ] Improve type safety and error handling to reduce runtime surprises.
- [ ] Harden release pipeline and smoke validation for 1-week release confidence.

### Out of Scope

- Full backward compatibility with all previous CLI flags/behavior — not required for this milestone.
- Workflow automation features (`batch`, multi-step YAML pipelines) — deferred to v1.1.
- GUI/TUI experience — terminal CLI only.

## Context

The repository is a TypeScript CLI package (`@syxs/tavily-cli`) with Commander-based routing in `src/index.ts`, command handlers under `src/commands/`, shared utilities in `src/utils/`, and Vitest-based tests under `src/__tests__/`. The codebase map was generated in `.planning/codebase/` and identifies current strengths (clear command separation, CI publishing) and risks (large `index.ts`, `as any` usage, process-exit coupling).

## Constraints

- **Timeline**: 1 week to release — prioritize high-leverage reliability work.
- **Compatibility**: Breaking changes are acceptable if end-to-end functionality is improved.
- **Stack**: Keep Node.js + TypeScript + Commander foundation; no full rewrite.
- **Scope Discipline**: v1 focuses on diagnosis/confiabilidade/refactor; automation moved to v1.1.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Do not rewrite the CLI from scratch | Current base is functional and can be improved faster with focused refactor | — Pending |
| Prioritize diagnosis + reliability in v1 | Directly reduces support burden and release risk | — Pending |
| Defer automation workflows to v1.1 | Keeps 1-week milestone realistic and focused | — Pending |
| Allow breaking changes where necessary | Functionality and maintainability matter more than strict backward compatibility now | — Pending |

---
*Last updated: 2026-02-27 after initialization*

# Roadmap: Tavily CLI Reliability Sprint

## Overview

This roadmap upgrades the existing Tavily CLI from a functional command set into a reliability-first CLI product in a 1-week sprint. Work starts with architecture stabilization, then adds diagnostic capabilities, hardens runtime behavior and typing, and finishes with release safety and remediation tooling.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Architecture Baseline Refactor** - Reduce fragility in command composition and error boundaries. (completed 2026-02-27)
- [x] **Phase 2: Diagnostics Command Foundation** - Deliver `tavily doctor` core checks and JSON diagnostics. (completed 2026-02-27)
- [ ] **Phase 3: Reliability and Type-Safe Contracts** - Standardize failures and remove unsafe command payload typing.
- [ ] **Phase 4: Release Hardening and Auto-Remediation** - Add smoke gates, migration docs, and `doctor --fix`.

## Phase Details

### Phase 1: Architecture Baseline Refactor
**Goal**: Refactor command wiring and runtime boundaries so the CLI is maintainable and predictable before adding new behavior.
**Depends on**: Nothing (first phase)
**Requirements**: [ARCH-01, ARCH-03, RELI-03]
**Success Criteria** (what must be TRUE):
  1. Command registration is modularized and no longer concentrated in one oversized entry module.
  2. Exit behavior is centralized at CLI boundaries with no deep-module forced termination paths.
  3. Shared command context/utilities eliminate duplicated configuration/client/output wiring patterns.
**Plans**: 3 plans

Plans:
- [x] 01-01: Extract and modularize command registrars by domain
- [x] 01-02: Introduce command runtime context and shared execution helpers
- [x] 01-03: Centralize error-to-exit translation at CLI boundary

### Phase 2: Diagnostics Command Foundation
**Goal**: Introduce `tavily doctor` as the primary diagnosis entrypoint for environment and integration health.
**Depends on**: Phase 1
**Requirements**: [DIAG-01, DIAG-02, DIAG-03]
**Success Criteria** (what must be TRUE):
  1. Users can run `tavily doctor` and receive clear pass/fail checks for auth, endpoint trust, and local setup dependencies.
  2. Users can see setup readiness for skill and MCP installation paths.
  3. Users can output diagnostic results in JSON with stable structure for CI/automation consumption.
**Plans**: 3 plans

Plans:
- [x] 02-01: Implement doctor command scaffolding and check framework
- [x] 02-02: Add environment/dependency/setup checks with actionable guidance
- [x] 02-03: Implement JSON reporting and deterministic exit code strategy

### Phase 3: Reliability and Type-Safe Contracts
**Goal**: Make runtime behavior robust and typed by eliminating unsafe command payload adaptation and normalizing failures.
**Depends on**: Phase 2
**Requirements**: [RELI-01, RELI-02, ARCH-02, ARCH-04]
**Success Criteria** (what must be TRUE):
  1. All commands emit standardized error format with clear remediation guidance.
  2. API/network failures are classified consistently and map to stable exit semantics.
  3. `as any` command payload casts are removed in favor of typed request/response adapters.
  4. Integration tests cover routing and key parser/dispatch behaviors after refactor.
**Plans**: 3 plans

Plans:
- [ ] 03-01: Define shared error model and apply across command handlers
- [ ] 03-02: Replace unsafe payload casts with typed adapters
- [ ] 03-03: Expand integration regression tests for command routing and parsing

### Phase 4: Release Hardening and Auto-Remediation
**Goal**: Guarantee releasability with quality gates, migration guidance, and practical remediation paths.
**Depends on**: Phase 3
**Requirements**: [DIAG-04, RELI-04, REL-01, REL-02, REL-03]
**Success Criteria** (what must be TRUE):
  1. `tavily doctor --fix` can safely remediate selected common local setup issues.
  2. Publish flow cannot proceed when type-check, tests, build, or smoke validation fail.
  3. Release docs include migration/breaking-change guidance and a repeatable release checklist.
  4. Reliability smoke checks run as part of release validation.
**Plans**: 3 plans

Plans:
- [ ] 04-01: Implement doctor fix-actions with safety guards
- [ ] 04-02: Add smoke/release quality gates to CI/publish flow
- [ ] 04-03: Publish migration notes and release checklist artifacts

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Architecture Baseline Refactor | 3/3 | Complete    | 2026-02-27 |
| 2. Diagnostics Command Foundation | 3/3 | Complete    | 2026-02-27 |
| 3. Reliability and Type-Safe Contracts | 0/3 | Not started | - |
| 4. Release Hardening and Auto-Remediation | 0/3 | Not started | - |

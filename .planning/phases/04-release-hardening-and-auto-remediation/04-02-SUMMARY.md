---
phase: 04-release-hardening-and-auto-remediation
plan: "02"
subsystem: release
tags: [smoke-gates, ci, publish, reliability-regressions]
requires:
  - phase: 04-release-hardening-and-auto-remediation
    provides: safe doctor fix contract and deterministic fix-aware doctor output
provides:
  - Canonical `pnpm run smoke` release validation command
  - CI and publish workflows gated by type-check, tests, build, and smoke
  - Smoke-aligned routing/error-boundary regressions for doctor and unknown-command paths
affects: [phase-04-03, release-operations, publish-quality]
tech-stack:
  added: []
  patterns: [single-smoke-entrypoint, fail-fast-release-gates, smoke-aligned-regressions]
key-files:
  created:
    - scripts/release/smoke.mjs
  modified:
    - package.json
    - .github/workflows/test.yml
    - .github/workflows/publish.yml
    - src/__tests__/integration/cli-routing-regression.test.ts
key-decisions:
  - "Smoke checks run against built artifacts and accept doctor status 0/1 while validating output contracts."
  - "Publish gate ordering remains explicit and fail-fast so `npm publish` is unreachable after any quality gate failure."
patterns-established:
  - "Release-facing reliability checks are centralized in `pnpm run smoke` and reused by local and CI workflows."
  - "Smoke script must assert both route-level invariants and deterministic runtime boundary output."
requirements-completed: [RELI-04, REL-01]
duration: 6 min
completed: 2026-02-27
---

# Phase 04 Plan 02 Summary

**Release quality gates now include a canonical smoke contract, and publish is blocked unless type-check, tests, build, and smoke are all green.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-27T17:31:00Z
- **Completed:** 2026-02-27T17:37:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Added `scripts/release/smoke.mjs` and package script entrypoint `pnpm run smoke` as the single release smoke contract.
- Enforced smoke gate execution in both `test.yml` and `publish.yml` after type-check/test/build gates.
- Expanded routing regressions and smoke assertions to include doctor fix dry-run routing and deterministic unknown-command runtime boundary output.

## Task Commits

1. **Task 1: Create release smoke command and package script entrypoint** - `a4f6b3a` (feat)
2. **Task 2: Enforce smoke and existing quality gates in CI and publish workflows** - `aa68aa7` (feat)
3. **Task 3: Expand reliability regression assertions aligned with smoke contract** - `a49ddd8` (test)

## Files Created/Modified

- `scripts/release/smoke.mjs` - Release smoke runner over routing tests and built CLI runtime contract checks.
- `package.json` - Adds canonical `smoke` script.
- `.github/workflows/test.yml` - CI gate chain includes smoke stage.
- `.github/workflows/publish.yml` - Publish workflow blocks release when smoke fails.
- `src/__tests__/integration/cli-routing-regression.test.ts` - Smoke-aligned doctor routing and deterministic boundary regressions.

## Decisions Made

- Smoke contract intentionally validates deterministic command output contracts (schema/error shape), not network-side success, to remain stable and non-flaky in release pipelines.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase `04-03` can now bind migration docs and release checklist steps directly to an enforced, executable gate chain.
- No blockers identified.

## Self-Check: PASSED

- SUMMARY created and references existing files.
- Task commit hashes resolve in git history.

---
*Phase: 04-release-hardening-and-auto-remediation*
*Completed: 2026-02-27*

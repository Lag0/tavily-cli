---
phase: 04-release-hardening-and-auto-remediation
plan: "01"
subsystem: diagnostics
tags: [doctor-fix, remediation, safety-guards, deterministic-reporting]
requires:
  - phase: 02-diagnostics-command-foundation
    provides: stable doctor check IDs, report schema, and deterministic diagnostics exit semantics
provides:
  - Safe `doctor --fix` option surface with scoped check targeting and dry-run preview mode
  - Allowlisted fix dispatch keyed by `DoctorCheckId` with local-only remediation handlers
  - Fix outcome reporting in text and JSON doctor outputs with deterministic post-fix exit behavior
affects: [phase-04-02, phase-04-03, release-reliability]
tech-stack:
  added: []
  patterns: [allowlisted-fix-dispatch, fix-report-contract, deterministic-post-fix-exit]
key-files:
  created:
    - src/commands/doctor/fixes.ts
  modified:
    - src/commands/doctor.ts
    - src/commands/doctor/checks.ts
    - src/commands/doctor/report.ts
    - src/commands/registrars/register-tooling-commands.ts
    - src/__tests__/commands/doctor.test.ts
    - src/__tests__/integration/cli.test.ts
key-decisions:
  - "Fix execution is constrained to explicit allowlisted local remediations; unsupported or unsafe cases are reported as skipped."
  - "`--fix-check` values are validated against canonical doctor check IDs to avoid ambiguous or hidden fix routing."
patterns-established:
  - "All doctor fix logic lives in a dedicated fixes module keyed by `DoctorCheckId`, not in ad-hoc conditionals inside `doctor.ts`."
  - "Doctor reports include fix run metadata/results whenever fix mode is active."
requirements-completed: [DIAG-04]
duration: 8 min
completed: 2026-02-27
---

# Phase 04 Plan 01 Summary

**`tavily doctor --fix` now performs safe local remediations through an allowlisted dispatcher and reports deterministic fix outcomes in both text and JSON modes.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-27T17:22:00Z
- **Completed:** 2026-02-27T17:30:00Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Added fix-mode CLI options (`--fix`, `--fix-check`, `--fix-dry-run`) and routed them through tooling registrar into doctor command handling.
- Implemented allowlisted fix handlers for credentials permission repair, malformed credentials recovery with backup, and stored API URL trust reset.
- Extended doctor report contracts to include fix execution summaries/results and locked deterministic post-fix exit semantics in tests.

## Task Commits

1. **Task 1: Define fix-option contracts and fix dispatch scaffolding for doctor** - `0eccd15` (feat)
2. **Task 2: Implement allowlisted safe fix actions for selected failing checks** - `eeb37c0` (feat)
3. **Task 3: Extend doctor reporting to include fix outcomes and deterministic exit behavior** - `54cdd57` (feat)

## Files Created/Modified

- `src/commands/doctor/fixes.ts` - Typed fix dispatcher and allowlisted remediation handlers.
- `src/commands/doctor.ts` - Fix option validation/execution and post-fix report generation.
- `src/commands/doctor/checks.ts` - Canonical check ID list and runtime guard for fix-check validation.
- `src/commands/doctor/report.ts` - Fix result reporting in doctor text and JSON contracts.
- `src/commands/registrars/register-tooling-commands.ts` - Doctor fix option plumbing from CLI parser.
- `src/__tests__/commands/doctor.test.ts` - Safe remediation, dry-run, and post-fix exit behavior regressions.
- `src/__tests__/integration/cli.test.ts` - CLI routing coverage for doctor fix options.

## Decisions Made

- API URL auto-remediation is intentionally limited to values sourced from stored credentials; env/flag values are treated as user-owned runtime inputs and are never mutated automatically.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase `04-02` can add smoke/release gates on top of the now-stable diagnostics remediation contract.
- No blockers identified.

## Self-Check: PASSED

- SUMMARY created and references existing files.
- Task commit hashes resolve in git history.

---
*Phase: 04-release-hardening-and-auto-remediation*
*Completed: 2026-02-27*

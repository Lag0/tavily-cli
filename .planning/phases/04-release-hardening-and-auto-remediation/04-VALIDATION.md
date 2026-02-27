---
phase: 04
slug: release-hardening-and-auto-remediation
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-02-27
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `vitest.config.mjs` |
| **Quick run command** | `pnpm vitest run src/__tests__/commands/doctor.test.ts src/__tests__/integration/cli.test.ts src/__tests__/integration/cli-routing-regression.test.ts` |
| **Full suite command** | `pnpm test && pnpm run type-check && pnpm run build && pnpm run smoke` |
| **Estimated runtime** | ~180 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm vitest run src/__tests__/commands/doctor.test.ts src/__tests__/integration/cli.test.ts`
- **After every plan wave:** Run `pnpm run type-check && pnpm run build && pnpm run smoke`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 180 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | DIAG-04 | unit/integration | `pnpm vitest run src/__tests__/commands/doctor.test.ts src/__tests__/integration/cli.test.ts` | ✅ | ⬜ pending |
| 04-01-02 | 01 | 1 | DIAG-04 | unit | `pnpm vitest run src/__tests__/commands/doctor.test.ts` | ✅ | ⬜ pending |
| 04-01-03 | 01 | 1 | DIAG-04 | integration | `pnpm vitest run src/__tests__/integration/cli.test.ts` | ✅ | ⬜ pending |
| 04-02-01 | 02 | 2 | RELI-04 | smoke | `pnpm run smoke` | ✅ | ⬜ pending |
| 04-02-02 | 02 | 2 | REL-01 | ci/workflow | `pnpm run smoke && pnpm run type-check && pnpm run build` | ✅ | ⬜ pending |
| 04-02-03 | 02 | 2 | RELI-04 | integration/smoke | `pnpm vitest run src/__tests__/integration/cli.test.ts src/__tests__/integration/cli-routing-regression.test.ts && pnpm run smoke` | ✅ | ⬜ pending |
| 04-03-01 | 03 | 3 | REL-02 | docs/contract | `pnpm run format:check` | ✅ | ⬜ pending |
| 04-03-02 | 03 | 3 | REL-03 | full | `pnpm test && pnpm run type-check && pnpm run build && pnpm run smoke` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠ flaky*

---

## Wave 0 Requirements

- Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

- All phase behaviors have automated verification.

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 180s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

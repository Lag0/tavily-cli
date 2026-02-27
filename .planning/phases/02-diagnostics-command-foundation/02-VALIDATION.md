---
phase: 02
slug: diagnostics-command-foundation
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-02-27
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `vitest.config.mjs` |
| **Quick run command** | `pnpm vitest run src/__tests__/commands/doctor.test.ts src/__tests__/integration/cli.test.ts` |
| **Full suite command** | `pnpm test && pnpm run type-check && pnpm run build` |
| **Estimated runtime** | ~90 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm vitest run src/__tests__/commands/doctor.test.ts src/__tests__/integration/cli.test.ts`
- **After every plan wave:** Run `pnpm test`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | DIAG-01 | unit/type | `pnpm run type-check` | ✅ | ⬜ pending |
| 02-01-02 | 01 | 1 | DIAG-01 | integration | `pnpm vitest run src/__tests__/integration/cli.test.ts` | ✅ | ⬜ pending |
| 02-02-01 | 02 | 2 | DIAG-01 | unit | `pnpm vitest run src/__tests__/commands/doctor.test.ts` | ✅ | ⬜ pending |
| 02-02-02 | 02 | 2 | DIAG-02 | unit/integration | `pnpm vitest run src/__tests__/commands/doctor.test.ts src/__tests__/integration/cli.test.ts` | ✅ | ⬜ pending |
| 02-03-01 | 03 | 3 | DIAG-03 | contract | `pnpm vitest run src/__tests__/commands/doctor.test.ts` | ✅ | ⬜ pending |
| 02-03-02 | 03 | 3 | DIAG-03 | integration | `pnpm vitest run src/__tests__/integration/cli.test.ts` | ✅ | ⬜ pending |
| 02-03-03 | 03 | 3 | DIAG-03 | full | `pnpm test && pnpm run type-check && pnpm run build` | ✅ | ⬜ pending |

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
- [x] Feedback latency < 120s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

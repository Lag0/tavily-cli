---
phase: 01
slug: architecture-baseline-refactor
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-02-27
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `vitest.config.mjs` |
| **Quick run command** | `pnpm vitest run src/__tests__/integration/cli.test.ts` |
| **Full suite command** | `pnpm test && pnpm run type-check && pnpm run build` |
| **Estimated runtime** | ~70 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm vitest run src/__tests__/integration/cli.test.ts`
- **After every plan wave:** Run `pnpm test`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | ARCH-01 | integration | `pnpm vitest run src/__tests__/integration/cli.test.ts` | ✅ | ⬜ pending |
| 01-01-02 | 01 | 1 | ARCH-01 | unit/integration | `pnpm vitest run src/__tests__/commands/*.test.ts src/__tests__/integration/cli.test.ts` | ✅ | ⬜ pending |
| 01-02-01 | 02 | 2 | ARCH-03 | unit | `pnpm vitest run src/__tests__/commands/search.test.ts src/__tests__/commands/extract.test.ts` | ✅ | ⬜ pending |
| 01-02-02 | 02 | 2 | ARCH-03 | integration | `pnpm vitest run src/__tests__/integration/cli.test.ts` | ✅ | ⬜ pending |
| 01-03-01 | 03 | 3 | RELI-03 | unit/integration | `pnpm vitest run src/__tests__/commands/login.test.ts src/__tests__/integration/cli.test.ts` | ✅ | ⬜ pending |
| 01-03-02 | 03 | 3 | RELI-03 | full | `pnpm test && pnpm run type-check && pnpm run build` | ✅ | ⬜ pending |

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
- [x] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

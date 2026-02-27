---
phase: 03
slug: reliability-and-type-safe-contracts
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-02-27
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `vitest.config.mjs` |
| **Quick run command** | `pnpm vitest run src/__tests__/integration/cli.test.ts src/__tests__/commands/search.test.ts src/__tests__/commands/extract.test.ts` |
| **Full suite command** | `pnpm test && pnpm run type-check && pnpm run build` |
| **Estimated runtime** | ~120 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm vitest run src/__tests__/integration/cli.test.ts src/__tests__/commands/search.test.ts src/__tests__/commands/extract.test.ts`
- **After every plan wave:** Run `pnpm test`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 150 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | RELI-01 | integration | `pnpm vitest run src/__tests__/integration/cli.test.ts` | ✅ | ⬜ pending |
| 03-01-02 | 01 | 1 | RELI-02 | unit/integration | `pnpm vitest run src/__tests__/commands/runtime/with-command-handler.test.ts src/__tests__/integration/cli.test.ts` | ✅ | ⬜ pending |
| 03-02-01 | 02 | 2 | ARCH-02 | type | `pnpm run type-check` | ✅ | ⬜ pending |
| 03-02-02 | 02 | 2 | ARCH-02 | unit | `pnpm vitest run src/__tests__/commands/search.test.ts src/__tests__/commands/extract.test.ts src/__tests__/commands/research.test.ts` | ✅ | ⬜ pending |
| 03-02-03 | 02 | 2 | ARCH-02 | unit/type | `pnpm vitest run src/__tests__/commands/search.test.ts src/__tests__/commands/extract.test.ts src/__tests__/commands/research.test.ts && pnpm run type-check` | ✅ | ⬜ pending |
| 03-03-01 | 03 | 3 | ARCH-04 | integration | `pnpm vitest run src/__tests__/integration/cli.test.ts src/__tests__/integration/cli-routing-regression.test.ts` | ✅ | ⬜ pending |
| 03-03-02 | 03 | 3 | RELI-01 | integration/unit | `pnpm vitest run src/__tests__/integration/cli.test.ts src/__tests__/utils/options.test.ts` | ✅ | ⬜ pending |
| 03-03-03 | 03 | 3 | ARCH-04 | full | `pnpm test && pnpm run type-check && pnpm run build` | ✅ | ⬜ pending |

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
- [x] Feedback latency < 150s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

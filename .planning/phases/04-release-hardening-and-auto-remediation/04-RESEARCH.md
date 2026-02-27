# Phase 4: Release Hardening and Auto-Remediation - Research

**Researched:** 2026-02-27
**Domain:** Safe `doctor --fix`, release quality gates, and release/migration documentation
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

No phase-specific CONTEXT.md exists for phase 4.
Planning should strictly follow roadmap scope and existing project conventions.
</user_constraints>

<research_summary>
## Summary

Phase 4 should finish the reliability milestone by adding guarded remediation to `tavily doctor`, enforcing smoke-aware release gates, and publishing repeatable release docs.

Current baseline already provides:
1. Stable diagnostics IDs and report schema (`src/commands/doctor/checks.ts`, `src/commands/doctor/report.ts`).
2. Deterministic doctor exit behavior and CLI routing coverage (`src/commands/doctor.ts`, integration tests).
3. CI release workflow with type-check/test/build gates (`.github/workflows/publish.yml`) but no explicit smoke stage.

Recommended implementation sequence:
1. Add a fix-action framework tied to existing doctor check IDs, with safe-by-default remediation guardrails (`--fix`, optional `--fix-check <id>` scope, optional dry-run path).
2. Add smoke validation command(s) and wire them into both test/publish workflows so publish is blocked unless smoke passes.
3. Add release docs artifacts (migration notes + release checklist) and align README/workflow references.

**Primary recommendation:** keep phase decomposition aligned with roadmap plans:
- 04-01 = doctor remediation engine and safety guards.
- 04-02 = smoke/release gate hardening.
- 04-03 = migration + release checklist artifacts.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `typescript` | existing project version | CLI command/fix contracts and guardrails | Existing strict typing strategy in phase 3 |
| `vitest` | existing project version | Contract/integration verification for doctor and routing | Current test framework and CI defaults |
| GitHub Actions | existing workflows | Release gate enforcement (`test.yml`, `publish.yml`) | Existing CI/CD delivery path |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| `pnpm` scripts | existing | Single source of quality/smoke commands | Reuse in local + CI + release pipeline |
| `@tavily/core` | existing | Runtime API boundary exercised by smoke checks | Ensure CLI integration surface remains stable |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| In-process fix action registry | ad-hoc fix logic inside each check | Faster short term, but hard to keep safe/auditable |
| Dedicated smoke script + CI step | only full `pnpm test` | Misses quick release-oriented runtime sanity checks |
| Docs in `README` only | separate release docs artifacts | README-only flow is less reusable for release operators |
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure

```text
src/
  commands/
    doctor/
      checks.ts
      report.ts
      (new) fixes.ts
    doctor.ts
  __tests__/
    commands/doctor.test.ts
    integration/cli.test.ts
    integration/cli-routing-regression.test.ts
scripts/
  release/
    (new) smoke.mjs or smoke.sh
.github/workflows/
  test.yml
  publish.yml
docs/
  (new) migration.md
  (new) release-checklist.md
```

### Pattern 1: Check-ID Bound Fix Registry
**What:** map fixable doctor check IDs to dedicated fix handlers with typed outcomes (`applied`, `skipped`, `failed`, `unsafe`).
**When to use:** `doctor --fix` execution after checks run.
**Example in this phase:** `auth.credentials_file` remediation can repair permissions / recover malformed file via backup and rewrite rules.

### Pattern 2: Safety-First Remediation Guardrails
**What:** require explicit user intent for mutations, scope fixes to known-safe operations, and emit machine-readable fix results.
**When to use:** every fix action that changes local files/config.
**Example in this phase:** avoid mutating shell env or performing package installs; only local reversible remediations with backups.

### Pattern 3: Release Gate Reuse via Scripted Smoke Contract
**What:** define one smoke command reused by local pre-release checks and CI publish flow.
**When to use:** release/publish workflows and preflight checks.
**Example in this phase:** run targeted integration/doctor smoke assertions plus built CLI invocation checks.

### Pattern 4: Operator-Facing Release Artifacts
**What:** maintain dedicated migration notes and checklist docs that link to quality/smoke commands.
**When to use:** every release cut and breaking-change iteration.
**Example in this phase:** docs include explicit gate commands and rollback notes.

### Anti-Patterns to Avoid
- Broad auto-fix behavior that mutates external tools or hidden global shell state.
- `--fix` that runs without clear per-check eligibility and audit output.
- Release gates duplicated in multiple workflows with drift.
- Migration notes embedded only in ad-hoc PR text (not in versioned docs).
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Fix orchestration | giant `if/else` in `doctor.ts` | isolated fix registry module keyed by check ID | Keeps remediation explicit and testable |
| Smoke gating | bespoke CI-only shell snippets | `pnpm` smoke script referenced by workflows | Prevents local/CI divergence |
| Release process docs | inline comments in workflow files | versioned docs checklist + migration guide | Makes release execution repeatable |
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Unsafe fix scope creep
**What goes wrong:** `doctor --fix` starts modifying unrelated user state (global installs, env mutation) and becomes risky.
**How to avoid:** restrict to local reversible remediations with explicit allowlist of check IDs.

### Pitfall 2: Fix actions not tied to diagnostics IDs
**What goes wrong:** fixes cannot be traced to check outcomes and behavior drifts across releases.
**How to avoid:** make fix eligibility/dispatch depend directly on canonical `DoctorCheckId` values.

### Pitfall 3: Smoke checks too broad or flaky
**What goes wrong:** release pipeline becomes unstable or too slow.
**How to avoid:** keep smoke suite narrow, deterministic, and focused on critical command paths + release contract checks.

### Pitfall 4: Docs become stale from workflow drift
**What goes wrong:** release checklist no longer matches CI script names.
**How to avoid:** docs should reference canonical `pnpm` scripts and workflow job names changed in the same PR.
</common_pitfalls>

## Validation Architecture

Phase 4 validation should enforce fast feedback plus release-gate confidence:

- **Doctor remediation loop (fast):**
  - `pnpm vitest run src/__tests__/commands/doctor.test.ts src/__tests__/integration/cli.test.ts`
- **Routing/reliability smoke loop (fast):**
  - `pnpm vitest run src/__tests__/integration/cli-routing-regression.test.ts src/__tests__/integration/cli.test.ts`
- **Static/build gate:**
  - `pnpm run type-check && pnpm run build`
- **Release smoke gate (new script target):**
  - `pnpm run smoke`
- **Phase completion gate:**
  - `pnpm test && pnpm run type-check && pnpm run build && pnpm run smoke`

Nyquist objective: every phase-4 task has executable `<automated>` verification with no manual-only critical checks.

<sources>
## Sources

### Primary (HIGH confidence)
- Local roadmap/requirements/state: `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `.planning/STATE.md`
- Prior phase outputs: `.planning/phases/02-diagnostics-command-foundation/*`, `.planning/phases/03-reliability-and-type-safe-contracts/*`
- Doctor command baseline: `src/commands/doctor.ts`, `src/commands/doctor/checks.ts`, `src/commands/doctor/report.ts`
- Tooling command registration: `src/commands/registrars/register-tooling-commands.ts`
- Runtime process/output helpers: `src/utils/process.ts`, `src/utils/output.ts`, `src/utils/credentials.ts`
- Existing test suite + CLI integration coverage: `src/__tests__/commands/doctor.test.ts`, `src/__tests__/integration/cli.test.ts`, `src/__tests__/integration/cli-routing-regression.test.ts`
- CI/publish workflows: `.github/workflows/test.yml`, `.github/workflows/publish.yml`
</sources>

<metadata>
## Metadata

**Research scope:**
- Safe `doctor --fix` architecture and guardrails
- Release/publish quality gate hardening
- Reliability smoke coverage strategy for release validation
- Migration/checklist documentation strategy

**Confidence breakdown:**
- Requirement mapping: HIGH
- Doctor remediation feasibility: HIGH
- CI/publish gate hardening feasibility: HIGH
- Release documentation coverage feasibility: HIGH

**Research date:** 2026-02-27
**Valid until:** 2026-03-29
</metadata>

---
*Phase: 04-release-hardening-and-auto-remediation*
*Research completed: 2026-02-27*
*Ready for planning: yes*

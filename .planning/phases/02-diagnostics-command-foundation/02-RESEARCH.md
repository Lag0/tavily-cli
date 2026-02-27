# Phase 2: Diagnostics Command Foundation - Research

**Researched:** 2026-02-27
**Domain:** TypeScript CLI diagnostics command design (`tavily doctor`)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

No phase-specific user constraints captured. Planning should prioritize roadmap requirements and existing CLI conventions.
</user_constraints>

<research_summary>
## Summary

Phase 2 should introduce `tavily doctor` as a deterministic diagnostics entrypoint that checks authentication readiness, API URL trust posture, and local setup prerequisites used by existing install flows. The CLI already has the core primitives needed for diagnostics: credential/config resolution (`utils/config.ts`, `utils/credentials.ts`), subprocess execution patterns (`utils/process.ts`), and consistent output handling (`utils/output.ts`, runtime helper patterns).

The most robust approach is to model diagnostics as a typed check framework (`check definition -> check result -> aggregate report`) and keep command wiring lightweight. This allows Phase 4 (`doctor --fix`) to reuse check IDs and failure categories without redesigning output contracts.

**Primary recommendation:** create a dedicated `doctor` command module with composable checks and a stable JSON report schema, then enforce deterministic exit semantics based on aggregate check status.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `commander` | existing project version | Register `doctor` command and options | Existing command routing architecture already standardized around Commander |
| `typescript` | existing project version | Typed check contracts and report schema | Needed for stable machine-readable diagnostics output |
| `vitest` | existing project version | Unit + integration verification for diagnostics behavior | Existing testing stack and CI gates already use Vitest |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Node `child_process` (`spawnSync`) | built-in | Probe dependency executables (`node`, `npm`, `npx`) | Used inside diagnostics checks, but wrapped for testability |
| Node `fs` / `path` | built-in | Verify local setup readiness markers and credentials file state | Used for non-network readiness checks |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Internal check framework | Inline monolithic command logic | Faster initially but harder to extend for `--fix` and stable JSON contracts |
| New dependency for environment probing | Keep built-ins only | Built-ins avoid dependency risk and fit current CLI footprint |
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
    doctor.ts
  commands/registrars/
    register-tooling-commands.ts
  __tests__/
    commands/doctor.test.ts
    integration/cli.test.ts
```

### Pattern 1: Check Contract + Registry
**What:** Define each diagnostic as a typed check descriptor with `id`, `category`, `run()` and remediation guidance metadata.
**When to use:** Any diagnostic surface with multiple independent validations and future auto-remediation paths.
**Example in this phase:** `auth.api_key_present`, `auth.credentials_state`, `api_url.trust_status`, `deps.node`, `deps.npm`, `deps.npx`, `setup.skills_readiness`, `setup.mcp_readiness`.

### Pattern 2: Deterministic Aggregation Layer
**What:** Aggregate all checks into a single report model including summary counts and normalized statuses.
**When to use:** Commands that must support both human-readable and machine-readable outputs.
**Example in this phase:** `doctor --json` returns a stable object with `summary`, `checks`, and `generatedAt` fields; non-JSON output renders concise pass/fail lines.

### Pattern 3: Exit Code by Aggregate Health
**What:** Map final report status to stable exit code(s) at command boundary.
**When to use:** CI/automation consumers rely on consistent shell semantics.
**Example in this phase:** success when all checks pass; non-zero when any required readiness check fails.

### Anti-Patterns to Avoid
- **Hidden side effects:** checks mutating config/credentials during diagnostics (reserved for Phase 4 `--fix`).
- **Unstable JSON shape:** conditional key naming that breaks automation consumers.
- **Network-coupled diagnostics:** requiring live Tavily API call for local readiness checks in this phase.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON output mode branching | custom ad-hoc serializers per check | existing `writeObjectOutput` conventions | Preserves current CLI JSON/file behavior |
| command routing | new special-case router | existing tooling registrar | Keeps command registration consistent with Phase 1 architecture |
| executable probing | shell script wrappers | small TypeScript probe utility using `spawnSync` | Easier to mock and test with Vitest |
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Flaky dependency checks due to PATH assumptions
**What goes wrong:** diagnostics fail on otherwise healthy environments because command lookup behavior differs by shell/platform.
**How to avoid:** normalize executable resolution in one helper and report actionable remediation text per missing executable.

### Pitfall 2: Coupling JSON and text rendering paths to different data models
**What goes wrong:** `--json` output diverges from text output status calculations.
**How to avoid:** compute one canonical report object, then render text from the same object.

### Pitfall 3: Hard-to-extend check IDs before `doctor --fix`
**What goes wrong:** later remediation cannot target checks reliably because IDs/messages are unstable.
**How to avoid:** define explicit, version-stable check identifiers now and keep remediation hints alongside check metadata.
</common_pitfalls>

## Validation Architecture

Phase 2 validation should lock behavior at three levels:

- **Check-level loop (fast):**
  - `pnpm vitest run src/__tests__/commands/doctor.test.ts`
- **Routing/output loop (integration):**
  - `pnpm vitest run src/__tests__/integration/cli.test.ts`
- **Phase gate:**
  - `pnpm test && pnpm run type-check && pnpm run build`

Nyquist objective for this phase: every planned task includes automated verification, and JSON schema checks run in the same loop as status/exit-code checks.

<sources>
## Sources

### Primary (HIGH confidence)
- Local roadmap/requirements/state: `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `.planning/STATE.md`
- Local architecture/testing references: `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/CONCERNS.md`, `.planning/codebase/TESTING.md`
- Current command/runtime implementation: `src/index.ts`, `src/commands/setup.ts`, `src/commands/init.ts`, `src/utils/config.ts`, `src/utils/credentials.ts`, `src/utils/output.ts`, `src/utils/process.ts`
</sources>

<metadata>
## Metadata

**Research scope:**
- Diagnostics command architecture and output contracts
- Dependency/auth/setup readiness check feasibility
- Verification strategy for deterministic JSON + exit semantics

**Confidence breakdown:**
- Requirement mapping: HIGH
- Check framework design: HIGH
- JSON/exit semantics feasibility: HIGH

**Research date:** 2026-02-27
**Valid until:** 2026-03-29
</metadata>

---
*Phase: 02-diagnostics-command-foundation*
*Research completed: 2026-02-27*
*Ready for planning: yes*

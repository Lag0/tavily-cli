# Phase 1: Architecture Baseline Refactor - Research

**Researched:** 2026-02-27
**Domain:** TypeScript CLI architecture refactor (Commander-based dispatch)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

No user constraints - all decisions at Claude's discretion.
</user_constraints>

<research_summary>
## Summary

Phase 1 should stabilize the command architecture before new behavior is added. The current `src/index.ts` is a dense, single-point registrar and multiple command modules call `process.exit(...)` directly, which spreads exit semantics across the codebase. A focused refactor should separate command registration by domain, move repeated runtime concerns into shared helpers, and route all command failures to a single CLI-boundary exit mapping.

The current code already has useful seams: `createProgram()` and `runCli()` are exported, command handlers are separated per file, and `utils/client.ts`/`utils/output.ts` centralize key dependencies. This enables an incremental architecture change without rewriting command behavior.

**Primary recommendation:** Introduce a small runtime abstraction (`CommandRuntimeError` + wrapper helpers), split registration into registrar modules, and enforce boundary-only exits from `runCli`/entrypoint.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `commander` | existing project version | CLI parsing and command registration | Already integrated and stable for modular command registration |
| `vitest` | existing project version | command + integration validation | Existing suite already mocks command boundaries and process exits |
| `typescript` | existing project version | compile-time contracts for runtime helpers | Needed to replace implicit/duplicated runtime flows with explicit interfaces |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@tavily/core` | existing project version | Tavily API client | Existing client factory should remain the only API creation path |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Commander modular registrars | Full rewrite around another CLI framework | High migration cost with no Phase 1 requirement benefit |
| Shared runtime error contract | Continue direct `process.exit` in handlers | Fast now, but keeps RELI-03 and ARCH-03 unresolved |
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure

```text
src/
  commands/
    registrars/
      web.ts
      auth.ts
      tooling.ts
      register-all.ts
    runtime/
      command-runtime.ts
      command-errors.ts
  index.ts
```

### Pattern 1: Modular Registrar Composition
**What:** Build command groups in dedicated registrar files and compose them from one aggregator.
**When to use:** Any CLI with >5 commands or mixed command domains.
**Example in this phase:** move `search/extract/crawl/map/research*` registration to a web registrar, auth/status to an auth registrar, init/setup/env to tooling registrar.

### Pattern 2: Boundary Error Translation
**What:** Command handlers throw typed errors; entrypoint maps those errors to exit codes once.
**When to use:** CLIs where commands must be testable without killing process during unit tests.
**Example in this phase:** replace `process.exit(...)` calls in handlers with `throw new CommandRuntimeError(...)`; map to `process.exitCode` in `runCli` main boundary.

### Pattern 3: Shared Command Runtime Helpers
**What:** Shared helper for command action wrappers (option normalization, output mode, error wrapping).
**When to use:** Multiple commands repeating `try/catch + output strategy + client/config wiring`.
**Example in this phase:** new helper that executes command body and normalizes known failures while preserving command-specific formatting.

### Anti-Patterns to Avoid
- **Partial modularization:** splitting files while leaving hidden cross-dependencies in `index.ts`.
- **Mixed error strategy:** some commands throw, others still exit deep in handlers.
- **Over-generalized runtime context:** generic abstraction that hides command-specific option contracts.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Command router growth | custom parser DSL | Commander registrars + typed action adapters | Current parser and tests already align with Commander |
| Exit handling | per-command ad hoc status mapping | shared `CommandRuntimeError` contract | Keeps RELI-03 enforceable and testable |
| Output dispatch branching | per-command bespoke file/stdout handling | existing `writeObjectOutput` + runtime helper | Avoids drift in JSON/text behavior |
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Hidden Coupling Between Registrars and Global Hook
**What goes wrong:** commands appear modular, but preAction and global options still assume inline command wiring.
**How to avoid:** preserve one top-level `preAction` hook and keep registrars pure (`program => void`) without side effects.

### Pitfall 2: Regression in CLI Routing While Moving Commands
**What goes wrong:** command names/options drift during extraction from `index.ts`.
**How to avoid:** lock with integration assertions in `src/__tests__/integration/cli.test.ts` and add command inventory checks.

### Pitfall 3: Error Refactor Breaks Existing User-Facing Messages
**What goes wrong:** centralized mapper alters wording/exit behavior unexpectedly.
**How to avoid:** codify error shape (`code`, `message`, `suggestion`, `exitCode`) and verify exact status behavior in tests.
</common_pitfalls>

## Validation Architecture

Phase 1 validation should run quick feedback on every task and broader checks at plan boundaries:

- **Quick loop (per task commit):**
  - `pnpm vitest run src/__tests__/integration/cli.test.ts`
  - `pnpm vitest run src/__tests__/commands/search.test.ts src/__tests__/commands/extract.test.ts src/__tests__/commands/init.test.ts`
- **Wave/phase loop:**
  - `pnpm test`
  - `pnpm run type-check`
  - `pnpm run build`

Nyquist objective for this phase: every task includes an automated verification command with no three-task streak lacking automated checks.

<sources>
## Sources

### Primary (HIGH confidence)
- Local codebase: `src/index.ts`, `src/commands/*.ts`, `src/utils/*.ts`
- Local planning artifacts: `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `.planning/codebase/*.md`
</sources>

<metadata>
## Metadata

**Research scope:**
- Command registration topology and coupling points
- Runtime context/helper reuse opportunities
- Exit/error handling boundaries for RELI-03

**Confidence breakdown:**
- Architecture patterns: HIGH (grounded in current source layout)
- Requirement mapping: HIGH (explicit roadmap requirement IDs)
- Validation strategy: HIGH (existing test/build scripts available)

**Research date:** 2026-02-27
**Valid until:** 2026-03-29
</metadata>

---
*Phase: 01-architecture-baseline-refactor*
*Research completed: 2026-02-27*
*Ready for planning: yes*

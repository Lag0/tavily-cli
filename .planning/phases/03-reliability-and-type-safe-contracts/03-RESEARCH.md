# Phase 3: Reliability and Type-Safe Contracts - Research

**Researched:** 2026-02-27
**Domain:** CLI runtime error normalization and typed Tavily request adapters
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

No phase-specific user constraints captured. Planning should prioritize roadmap requirements and current CLI architecture conventions.
</user_constraints>

<research_summary>
## Summary

Phase 3 should harden reliability by introducing one canonical runtime error format for all command failures and replacing command-level `as any` payload casts with explicit typed request adapters. The current runtime already has a central boundary (`withCommandHandler` -> `handleCliError`) but error rendering/classification is still inconsistent and payload typing at the Tavily boundary is unsafe in `search`, `extract`, `crawl`, `map`, and `research`.

The robust implementation path is:
1. Expand runtime error contract (`code`, `message`, `suggestion`, `cause`, optional `details`) and centralize CLI rendering in one formatter.
2. Add an API/network error classifier in runtime boundary logic so Tavily/client transport failures map to deterministic command errors with remediation guidance.
3. Introduce typed request adapter helpers for each web command request shape and route command handlers through these adapters instead of inline object literals cast as `any`.
4. Lock behavior with integration regression tests for routing/parsing plus command-level tests for option mapping and error semantics.

**Primary recommendation:** complete reliability contract hardening first (plan 03-01), then typed adapter migration (03-02), then regression matrix expansion (03-03).
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `typescript` | existing project version | Strict runtime and adapter typing | Required to eliminate unsafe payload casts and enforce request contracts |
| `commander` | existing project version | CLI parse/dispatch behavior | Existing integration tests already assert command routing and parser guards |
| `vitest` | existing project version | Unit + integration verification | Current test stack and CI gates are already Vitest-based |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@tavily/core` | existing project version | Tavily client request/response API | Keep SDK usage behind typed local adapter functions |
| Node error primitives | built-in | Classify network/system failures | Use in runtime classifier to map low-level errors into stable CLI semantics |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Local adapter layer | Keep direct inline payloads | Faster short-term but continues `as any` regression risk |
| Runtime classifier | Per-command ad hoc try/catch mapping | Duplicated logic and drift in user-facing error semantics |
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure

```text
src/
  commands/
    runtime/
      command-error.ts
      with-command-handler.ts
      (new) classify-command-error.ts
      (new) render-cli-error.ts
    search.ts
    extract.ts
    crawl.ts
    map.ts
    research.ts
  types/
    search.ts
    extract.ts
    crawl.ts
    map.ts
    research.ts
    (new) tavily-request-adapters.ts
  __tests__/
    integration/cli.test.ts
    commands/search.test.ts
    commands/extract.test.ts
    commands/crawl.test.ts
    commands/map.test.ts
    commands/research.test.ts
```

### Pattern 1: Runtime Error Contract + Single Renderer
**What:** Maintain one normalized runtime error model and one CLI print path with consistent `code`, `message`, `cause`, and remediation hint output.
**When to use:** Any command failure (input, auth, network, SDK, unexpected runtime).
**Example in this phase:** `handleCliError` prints standardized lines and sets deterministic exit codes for classified runtime failures.

### Pattern 2: Boundary Error Classification
**What:** Convert unknown thrown values from SDK/network/process into deterministic `CommandRuntimeError` categories.
**When to use:** `withCommandHandler` catch path and other command runtime wrappers.
**Example in this phase:** map transport failures to a stable error code with retry/remediation guidance (`RELI-02`).

### Pattern 3: Typed Request Adapter Functions
**What:** Build per-command adapter functions that map CLI options to SDK request payload types.
**When to use:** Every Tavily SDK call currently using inline payload object + `as any` cast.
**Example in this phase:** `buildSearchRequest(options): SearchRequest` used by both `executeSearch` and `handleSearchCommand`.

### Anti-Patterns to Avoid
- Command-specific custom error print formats bypassing the CLI boundary formatter.
- Mixing partial typed adapters with leftover inline `as any` request payload casts.
- Integration tests that only assert handler invocation but not parser/error boundary behavior.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Error contract formatting | per-command console templates | shared runtime renderer + `CommandRuntimeError` | Keeps user-facing output stable across all commands |
| Payload typing | manual inlined SDK objects in each handler | reusable typed request adapter functions | Prevents repeated drift and copy/paste casting |
| Parser regression checks | one-off local scripts | existing `src/__tests__/integration/cli.test.ts` matrix | Fits current project test conventions |
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Classifier overfitting to one SDK error shape
**What goes wrong:** classifier only handles one error signature; real API/network failures still collapse to generic unknown error.
**How to avoid:** support fallback classification layers (runtime error instance -> known network/system codes -> generic fallback) and lock behavior with tests.

### Pitfall 2: Adapter layer not shared between `execute*` and `handle*`
**What goes wrong:** one path becomes typed while the other keeps `as any` and drifts.
**How to avoid:** place adapter functions in shared module and call from both direct execute and handler flows.

### Pitfall 3: Integration tests assert dispatch only, not parser failure semantics
**What goes wrong:** routing seems healthy but invalid options or error propagation regress.
**How to avoid:** add assertions for parser rejections, exit code behavior, and standardized runtime error output paths.
</common_pitfalls>

## Validation Architecture

Phase 3 validation should use fast command-level loops plus phase gate checks:

- **Runtime error contract loop (fast):**
  - `pnpm vitest run src/__tests__/integration/cli.test.ts`
- **Typed adapter loop (fast):**
  - `pnpm vitest run src/__tests__/commands/search.test.ts src/__tests__/commands/extract.test.ts src/__tests__/commands/crawl.test.ts src/__tests__/commands/map.test.ts src/__tests__/commands/research.test.ts`
- **Type safety loop:**
  - `pnpm run type-check`
- **Phase gate:**
  - `pnpm test && pnpm run type-check && pnpm run build`

Nyquist objective for this phase: every task includes executable automated verification, with no manual-only critical checks.

<sources>
## Sources

### Primary (HIGH confidence)
- Local roadmap/requirements/state: `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `.planning/STATE.md`
- Local architecture/testing references: `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/CONCERNS.md`, `.planning/codebase/TESTING.md`
- Runtime boundary and error handling: `src/index.ts`, `src/commands/runtime/command-error.ts`, `src/commands/runtime/with-command-handler.ts`
- Web command payload boundaries: `src/commands/search.ts`, `src/commands/extract.ts`, `src/commands/crawl.ts`, `src/commands/map.ts`, `src/commands/research.ts`
- Existing tests and parser coverage: `src/__tests__/integration/cli.test.ts`, `src/__tests__/commands/*.test.ts`
</sources>

<metadata>
## Metadata

**Research scope:**
- Runtime error normalization strategy for CLI boundaries
- Tavily API/network failure classification strategy
- Typed request adapter migration strategy for web commands
- Integration regression strategy for routing/parser contracts

**Confidence breakdown:**
- Requirement mapping: HIGH
- Error model hardening feasibility: HIGH
- Typed adapter migration feasibility: HIGH
- Regression test expansion feasibility: HIGH

**Research date:** 2026-02-27
**Valid until:** 2026-03-29
</metadata>

---
*Phase: 03-reliability-and-type-safe-contracts*
*Research completed: 2026-02-27*
*Ready for planning: yes*

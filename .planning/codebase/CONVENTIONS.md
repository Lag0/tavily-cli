# Coding Conventions

**Analysis Date:** 2026-02-27

## Naming Patterns

**Files:**
- Lowercase TypeScript module names in `src/commands`, `src/utils`, `src/types`.
- Tests follow `*.test.ts` under `src/__tests__/...`.
- Single `index.ts` acts as CLI composition root.

**Functions:**
- camelCase naming (`handleSearchCommand`, `executeResearchStatus`, `writeObjectOutput`).
- `handle*Command` pattern for public command entry methods.
- `execute*` helpers isolate API call logic where applicable.

**Variables:**
- camelCase locals and params.
- UPPER_SNAKE_CASE constants for config literals (`DEFAULT_API_URL`).

**Types:**
- PascalCase interfaces/types (`SearchOptions`, `ResearchModel`).
- String union types for bounded flags in `src/types/*.ts`.

## Code Style

**Formatting:**
- Prettier configured via `.prettierrc.json`.
- Double quotes disabled (`"semi": true` and default Prettier wrapping).
- Semicolons required.
- 2-space indentation.

**Linting:**
- No ESLint config currently.
- Style enforced primarily via Prettier and TypeScript strict mode.

## Import Organization

**Observed order:**
1. External packages (e.g., `commander`, `@tavily/core`, Node built-ins)
2. Internal relative imports
3. Type imports inline where needed (`import type {...}`)

**Grouping:**
- Usually one blank line between external and internal groups.
- No path alias system (`@/` etc.) in current config.

## Error Handling

**Patterns:**
- Command handlers use try/catch and print concise user errors.
- Fatal command paths call `process.exit(1)`.
- Shared subprocess wrapper `runCommandOrExit` normalizes non-zero exits.

**Validation style:**
- Argument validation done early in `src/index.ts` using custom parsers.
- Config validation centralized in `src/utils/config.ts`.

## Logging

**Framework:**
- `console.log` and `console.error` only.

**Patterns:**
- Human-friendly success lines in interactive commands.
- Error lines start with `Error:` where user action is needed.

## Comments

**Usage pattern:**
- Sparse comments; code favors self-explanatory naming.
- Security caveats and platform notes added where behavior differs.

**TODO style:**
- No strong in-code TODO convention observed.

## Function Design

**Patterns:**
- Small-to-medium functions per command concern.
- Option mapping to SDK calls is explicit (pass-through shape).
- Reusable helpers extracted for normalization/parsing.

## Module Design

**Exports:**
- Named exports are standard across modules.
- No barrel exports; direct file imports preferred.

**Separation:**
- Clear separation: command routing vs command execution vs utilities vs types.

---
*Convention analysis: 2026-02-27*
*Update when patterns change*

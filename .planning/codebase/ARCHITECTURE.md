# Architecture

**Analysis Date:** 2026-02-27

## Pattern Overview

**Overall:** Monolithic Node.js CLI with command-handler modules.

**Key Characteristics:**
- Single executable entrypoint (`src/index.ts`)
- Command-oriented handlers in `src/commands/`
- Shared utilities for config, auth, client creation, and output
- Stateless per invocation, with local credential persistence

## Layers

**CLI Layer:**
- Purpose: Define commands/options and route execution.
- Contains: Commander setup, option parsers, pre-action hooks.
- Depends on: Command handler modules and config utilities.
- Used by: End users invoking `tavily ...`.

**Command Layer:**
- Purpose: Execute feature-specific logic for each subcommand.
- Contains: `search.ts`, `extract.ts`, `crawl.ts`, `map.ts`, `research.ts`, `init.ts`, `setup.ts`, etc.
- Depends on: Utility layer + Tavily client wrapper.
- Used by: CLI layer actions.

**Utility Layer:**
- Purpose: Shared concerns (configuration, credentials, IO, process execution).
- Contains: `src/utils/*.ts`.
- Depends on: Node built-ins + `@tavily/core`.
- Used by: Command layer and CLI layer hooks.

**Types Layer:**
- Purpose: Stable option contracts for commands.
- Contains: `src/types/*.ts` interfaces and unions.
- Depends on: TypeScript type system only.
- Used by: Command implementations.

## Data Flow

**CLI Command Execution:**
1. User runs `tavily <command> [options]`.
2. Commander parses options and arguments in `src/index.ts`.
3. `preAction` hook merges API credentials/url into global config.
4. Auth-required commands call `validateConfig(...)`.
5. Command handler executes and calls `getClient(...)` when needed.
6. Tavily SDK performs external API request.
7. Result is formatted and written to stdout/file.
8. Errors are surfaced and process exits non-zero.

**State Management:**
- Runtime state: in-memory `globalConfig` and cached SDK client instance.
- Persistent state: credentials JSON file under user config directory.

## Key Abstractions

**Command Handler:**
- Purpose: Isolated behavior per CLI command.
- Examples: `handleSearchCommand`, `handleInitCommand`, `handleSetupCommand`.
- Pattern: Async function + try/catch + process exit on failure.

**Client Factory:**
- Purpose: Centralized Tavily client creation + validation.
- Example: `getClient()` in `src/utils/client.ts`.
- Pattern: Lazy singleton with reset capability.

**Output Adapter:**
- Purpose: Unified output strategy for JSON/text and file writes.
- Example: `writeObjectOutput()` in `src/utils/output.ts`.
- Pattern: Format-aware adapter + optional pretty printing.

## Entry Points

**Main CLI Entry:**
- Location: `src/index.ts`
- Triggers: `tavily` binary mapped from `dist/index.js`
- Responsibilities: command registration, parsing, routing.

**Publish/CI Entry:**
- Location: `.github/workflows/test.yml`, `.github/workflows/publish.yml`
- Triggers: push/PR/release/workflow_dispatch events
- Responsibilities: quality gates and npm publish automation.

## Error Handling

**Strategy:**
- Local try/catch in each command handler for user-facing errors.
- Validation errors from commander and config checks fail fast.
- Failure paths call `process.exit(1)` or propagated exit status.

**Patterns:**
- Stringified `Error.message` for concise CLI output.
- `runCommandOrExit` wrapper for subprocess failures.

## Cross-Cutting Concerns

**Validation:**
- Numeric and URL validation in `src/index.ts` + `src/utils/config.ts`.

**Security:**
- Trusted host enforcement for API URL in `src/utils/config.ts`.
- Local credential file permission hardening in `src/utils/credentials.ts`.

**Formatting/Serialization:**
- Centralized in `src/utils/output.ts`.
- Human-readable + JSON mode supported across commands.

---
*Architecture analysis: 2026-02-27*
*Update when major patterns change*

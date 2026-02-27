# Codebase Structure

**Analysis Date:** 2026-02-27

## Directory Layout

```
tavily-cli/
├── .github/workflows/      # CI test/publish workflows
├── dist/                   # Compiled JS + d.ts output (generated)
├── skills/                 # Tavily skill artifacts/docs
├── src/
│   ├── commands/           # Command handlers
│   ├── types/              # Command option types
│   ├── utils/              # Shared utilities (config, creds, client, IO)
│   ├── __tests__/          # Unit + integration tests
│   └── index.ts            # CLI entrypoint and command wiring
├── package.json            # Scripts, deps, engine, npm metadata
├── pnpm-lock.yaml          # Dependency lockfile
├── tsconfig.json           # Base TypeScript config
├── tsconfig.build.json     # Build-time TS overrides
├── vitest.config.mjs       # Test runner config
└── README.md               # User-facing docs
```

## Directory Purposes

**`src/commands/`:**
- Purpose: One module per command or grouped feature path.
- Contains: request execution + result formatting + error handling.
- Key files: `search.ts`, `extract.ts`, `research.ts`, `init.ts`, `setup.ts`.
- Subdirectories: none (flat command layout).

**`src/utils/`:**
- Purpose: Reusable runtime helpers and shared abstractions.
- Contains: Tavily client factory, config resolution, output writing, process wrappers.
- Key files: `client.ts`, `config.ts`, `credentials.ts`, `output.ts`, `process.ts`.

**`src/__tests__/`:**
- Purpose: Test coverage for commands, utilities, and integration routing.
- Contains: `commands/`, `utils/`, `integration/` test groups.
- Key files: `integration/cli.test.ts`, `commands/init.test.ts`, `utils/config.test.ts`.

## Key File Locations

**Entry Points:**
- `src/index.ts`: registers and dispatches all CLI commands.
- `dist/index.js`: compiled executable target referenced by `bin.tavily`.

**Configuration:**
- `package.json`: scripts, versions, dependencies, engine requirements.
- `.github/workflows/test.yml`: CI quality checks.
- `.github/workflows/publish.yml`: npm publish automation.

**Core Logic:**
- `src/commands/*.ts`: command implementations.
- `src/utils/*.ts`: cross-command runtime concerns.
- `src/types/*.ts`: command contracts.

**Testing:**
- `src/__tests__/commands/*.test.ts`
- `src/__tests__/utils/*.test.ts`
- `src/__tests__/integration/cli.test.ts`

## Naming Conventions

**Files:**
- Lowercase kebab-like names for modules (`search.ts`, `research.ts`).
- `*.test.ts` for tests.
- `index.ts` as command registration root.

**Directories:**
- Lowercase names (`commands`, `utils`, `types`, `__tests__`).
- Nested test categories by concern.

**Special Patterns:**
- Build output to `dist/` (ignored in git, included in npm files).
- `.github/workflows/*.yml` for automation.

## Where to Add New Code

**New CLI command:**
- Definition/wiring: `src/index.ts`
- Implementation: `src/commands/<name>.ts`
- Options type: `src/types/<name>.ts` (if complex)
- Tests: `src/__tests__/commands/<name>.test.ts`

**New shared utility:**
- Implementation: `src/utils/<name>.ts`
- Tests: `src/__tests__/utils/<name>.test.ts`

**New integration behavior:**
- Client/config updates: `src/utils/client.ts` and `src/utils/config.ts`
- End-to-end routing checks: `src/__tests__/integration/cli.test.ts`

## Special Directories

**`dist/`:**
- Purpose: Generated build artifacts (`.js`, `.d.ts`).
- Source: `pnpm run build` (TypeScript compiler).
- Committed: No (gitignored), but published in npm package.

**`skills/`:**
- Purpose: Skill documentation and install/security guidance.
- Source: Maintained in-repo.
- Committed: Yes.

---
*Structure analysis: 2026-02-27*
*Update when directory structure changes*

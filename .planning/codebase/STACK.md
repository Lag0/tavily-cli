# Technology Stack

**Analysis Date:** 2026-02-27

## Languages

**Primary:**
- TypeScript 5.8.x - All source code in `src/`.

**Secondary:**
- JavaScript (Node runtime) - Executed output in `dist/`.
- YAML - CI workflows in `.github/workflows/`.

## Runtime

**Environment:**
- Node.js >=18.0.0 (from `package.json` engines)
- CI currently runs Node.js 22 (`.github/workflows/*.yml`)

**Package Manager:**
- pnpm 10.29.3 (`packageManager` in `package.json`)
- Lockfile: `pnpm-lock.yaml`

## Frameworks

**Core:**
- Commander 14.x - CLI command parsing and routing (`src/index.ts`)
- @tavily/core 0.7.x - API client for search/extract/crawl/map/research (`src/utils/client.ts`)

**Testing:**
- Vitest 4.x - Unit/integration tests in `src/__tests__/`

**Build/Dev:**
- TypeScript compiler 5.8.x - Build to CommonJS (`tsconfig.build.json`)
- Prettier 3.x - Formatting checks (`format`, `format:check` scripts)

## Key Dependencies

**Critical:**
- `@tavily/core` - Core external API integration.
- `commander` - Command system and option validation.

**Infrastructure:**
- `typescript` - Compilation and declaration output.
- `vitest` - Automated tests.
- `@types/node` - Node typings for strict TypeScript.
- `prettier` - Consistent formatting in CI.

## Configuration

**Environment:**
- `TAVILY_API_KEY` - Required for authenticated commands.
- `TAVILY_API_URL` - Optional API endpoint override.
- `TAVILY_ALLOW_UNTRUSTED_API_URL=1` - Explicit override for non-`.tavily.com` hosts.

**Build:**
- `tsconfig.json` - Strict TypeScript + declaration output.
- `tsconfig.build.json` - Excludes tests from build.
- `vitest.config.mjs` - Test include pattern and node environment.

## Platform Requirements

**Development:**
- macOS/Linux/Windows with Node.js >=18 and pnpm.
- No required local database or container stack.

**Production:**
- Distributed as npm package `@syxs/tavily-cli`.
- Published from GitHub Actions with npm OIDC (`.github/workflows/publish.yml`).
- Runtime is terminal-based Node process.

---
*Stack analysis: 2026-02-27*
*Update after major dependency/runtime changes*

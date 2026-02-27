# Testing Patterns

**Analysis Date:** 2026-02-27

## Test Framework

**Runner:**
- Vitest 4.x (`vitest.config.mjs`)
- Environment: Node

**Assertion Library:**
- Built-in Vitest `expect` matchers.

**Run Commands:**
```bash
pnpm test                              # Run full suite
pnpm vitest run src/__tests__/...      # Run targeted files
pnpm test:watch                        # Watch mode
pnpm run type-check                    # Static type safety gate
```

## Test File Organization

**Location:**
- All tests under `src/__tests__/`.
- Grouped by concern: `commands/`, `utils/`, `integration/`.

**Naming:**
- `*.test.ts` suffix.
- Integration entry test in `src/__tests__/integration/cli.test.ts`.

**Structure Pattern:**
- `describe` blocks per module/feature.
- `beforeEach` resets mocks and env state.
- Assertions verify option mapping and control-flow decisions.

## Test Structure

**Suite organization pattern:**
- Unit tests focus on one command/helper at a time.
- Integration tests mock command modules and assert routing behavior from `runCli`.

**Setup/teardown:**
- `vi.resetAllMocks()` and `vi.restoreAllMocks()` used heavily.
- `process.exit` is mocked where failure paths are expected.

## Mocking

**Framework:**
- Vitest mocking (`vi.mock`, `vi.fn`, `vi.spyOn`, `vi.mocked`).

**What is mocked:**
- External Tavily client (`getClient`) in command tests.
- Process/system functions (`process.exit`, console methods).
- Command modules and config utilities in integration tests.

**What is typically not mocked:**
- Pure utility logic (`parseList`, URL helpers) in direct unit tests.

## Fixtures and Factories

**Current approach:**
- Inline object literals as fixtures.
- Minimal factory abstraction due to small payload shapes.

**Location:**
- Fixtures live directly inside test files.

## Coverage

**Current posture:**
- No explicit numeric coverage threshold configured.
- CI enforces passing tests + type-check + build.

**Gaps to watch:**
- Limited full e2e tests against live Tavily API.
- Some command branches are validated by behavior but not snapshot/contract tests.

## Test Types

**Unit Tests:**
- Command option mapping (`search`, `extract`, `setup`, `init`).
- Utility behavior (`config`, `options`, `output`, `url`).

**Integration Tests:**
- CLI router behavior in `integration/cli.test.ts`.
- Validates command dispatch and option parsing safeguards.

**E2E Tests:**
- Not present in repository (no live network integration suite).

## Common Patterns

**Async testing:**
- `async/await` used for command handlers.
- Promise rejection assertions with `.rejects.toThrow(...)`.

**Error testing:**
- Exit paths tested by stubbing `process.exit` to throw.
- Error logs asserted via `console.error` spies.

---
*Testing analysis: 2026-02-27*
*Update when test patterns change*

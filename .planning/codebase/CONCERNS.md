# Codebase Concerns

**Analysis Date:** 2026-02-27

## Tech Debt

**Dynamic typing at Tavily API boundary:**
- Issue: Command modules cast SDK option payloads with `as any`.
- Why: Rapid compatibility with SDK option surface.
- Impact: Type-level regressions can slip through compile-time checks.
- Fix approach: Introduce stricter local request/response type adapters per command.

**Tight coupling to process exits:**
- Issue: Many handlers call `process.exit(...)` directly.
- Why: Simple CLI-first error handling model.
- Impact: Harder reuse as library and more brittle composition in advanced flows.
- Fix approach: Return typed errors up to a centralized exit handler in `src/index.ts`.

## Known Bugs

**No confirmed active product bugs in current tests:**
- Symptoms: N/A from existing automated suite.
- Trigger: N/A
- Workaround: N/A
- Root cause: N/A
- Blocked by: Live API regression tests are not automated.

## Security Considerations

**Credential storage is file-based, not keychain-backed:**
- Risk: Local credential exposure if host file permissions are compromised.
- Current mitigation: Restricted file/directory permissions (`0600`/`0700`) when possible.
- Recommendations: Optional OS keychain backend for macOS/Windows/Linux secret stores.

**Untrusted API URL override can disable host protections:**
- Risk: Misuse of `TAVILY_ALLOW_UNTRUSTED_API_URL=1` could send keys to untrusted hosts.
- Current mitigation: Default host allowlist in `src/utils/config.ts`.
- Recommendations: Warn prominently when override is enabled; consider interactive confirmation.

## Performance Bottlenecks

**Synchronous filesystem/process calls in hot paths:**
- Problem: `fs.*Sync` and `spawnSync` are blocking.
- Measurement: No benchmark present; impact increases with heavy automation usage.
- Cause: Simplicity and deterministic command behavior.
- Improvement path: Move expensive flows to async variants where UX allows.

## Fragile Areas

**Global mutable config + client singleton:**
- Why fragile: Shared mutable state (`globalConfig`, `clientInstance`) can leak across flows/tests.
- Common failures: Unexpected cross-command behavior if reused in long-lived process contexts.
- Safe modification: Prefer explicit dependency injection per command execution.
- Test coverage: Unit tests exist but no long-lived process stress tests.

**CLI command surface in `src/index.ts`:**
- Why fragile: High-density option parsing and dispatch logic in one file.
- Common failures: Accidental option conflicts or parser drift across commands.
- Safe modification: Keep parser helpers centralized and add integration tests per new command.
- Test coverage: Basic integration coverage present; command matrix not exhaustive.

## Scaling Limits

**Project scope scaling:**
- Current capacity: Well-suited for small/medium CLI command set.
- Limit: As commands/options grow, `src/index.ts` becomes harder to maintain.
- Symptoms at limit: Higher regression risk in option parsing and hook behavior.
- Scaling path: Split command registration into modular registrars.

## Dependencies at Risk

**Third-party installer endpoints:**
- Risk: `skills` / `add-mcp` package or remote refs can change behavior.
- Impact: Setup/install commands may fail despite core CLI working.
- Migration plan: Pin tested versions (already done) and keep fallback guidance in command errors.

## Missing Critical Features

**No dedicated smoke/e2e release validation against live Tavily API:**
- Problem: CI validates types/unit/integration mocks but not live service compatibility.
- Current workaround: Manual verification before release.
- Blocks: Early detection of upstream API behavior changes.
- Implementation complexity: Medium (needs managed secrets and stable test dataset).

## Test Coverage Gaps

**Runtime installer commands in full subprocess mode:**
- What's not tested: Real `npm`/`npx` invocation side-effects end-to-end.
- Risk: Environment-specific failures only seen by users.
- Priority: Medium.
- Difficulty to test: Medium due to external tools/network dependencies.

---
*Concerns audit: 2026-02-27*
*Update as issues are fixed or new ones discovered*

# Migration Guide (v1 Reliability Sprint)

This guide covers intentional behavior changes introduced across phases 1-4 of the reliability sprint.

## Who Should Read This

- Users upgrading from pre-sprint CLI builds.
- Maintainers automating Tavily CLI calls in scripts/CI.
- Release operators validating publish readiness.

## Summary of Changes

1. Error output is now deterministic and standardized across commands.
2. Doctor diagnostics include stricter trust and setup checks.
3. `tavily doctor --fix` now supports safe, allowlisted local remediations.
4. Release validation requires smoke checks in addition to tests/build/type-check.

## 1) Error Output Normalization

### Before

- Different commands could fail with inconsistent messaging.
- Unknown/runtime errors were harder to parse in automation.

### After

- Runtime failures use a standardized format:

```text
Error [CODE]: message
Remediation: suggested action
```

- Exit codes remain deterministic (`0` success, non-zero failure).

### Action

- Update log parsers to rely on `Error [CODE]:` prefixes.
- If you grep old free-form strings, migrate to code-aware matching.

## 2) Typed Contract Tightening

### Before

- Some command payload mapping used permissive casting internally.

### After

- Request mapping is type-safe and normalized before Tavily SDK calls.
- Invalid/unsupported mapped values are normalized deterministically.

### Action

- Validate automation inputs before invoking CLI flags.
- Keep option values aligned with documented command flags.

## 3) Doctor Auto-Remediation (`--fix`)

### New Behavior

`tavily doctor` now supports safe remediation controls:

```bash
tavily doctor --fix
tavily doctor --fix --fix-check auth.credentials_file
tavily doctor --fix-dry-run --json --pretty
```

### Safety Model

- Only allowlisted local remediations are executed.
- Unsupported or unsafe remediations are reported as `skipped`.
- `--fix-dry-run` reports intended actions without file mutation.

### Action

- Prefer `--fix-dry-run` in automation before enabling mutating `--fix`.
- Scope fixes with `--fix-check` when you need predictable targeted behavior.

## 4) Release Gate Expectations

### Before

- Release checks relied on type-check, tests, and build only.

### After

- Release validation includes smoke checks:

```bash
pnpm run type-check
pnpm run test
pnpm run build
pnpm run smoke
```

- Publish workflow is gated by the same chain.

### Action

- Add `pnpm run smoke` to local pre-release flow.
- Treat smoke failures as publish blockers.

## Quick Upgrade Checklist

1. Pull latest changes and reinstall dependencies.
2. Run `pnpm run type-check && pnpm run test && pnpm run build && pnpm run smoke`.
3. Validate doctor behavior with `tavily doctor --json --fix-dry-run`.
4. Review release process in `docs/release-checklist.md`.

# Release Checklist

Use this checklist for every release candidate and production publish.

## 1. Preconditions

- You are on the intended release branch and fully up to date.
- Working tree is clean (`git status --short`).
- Correct Node/pnpm versions are available locally.

## 2. Pre-Release Validation (Local)

Run gates in this exact order:

```bash
pnpm run type-check
pnpm run test
pnpm run build
pnpm run smoke
```

Expected result: all commands exit `0`.

## 3. Doctor Contract Spot Check

Run a non-mutating diagnostics pass:

```bash
tavily doctor --json --fix-dry-run
```

Expected result:

- Output contains diagnostics report schema.
- Output includes fix summary/results section.
- Exit code is deterministic (`0` when no required failures, `1` otherwise).

## 4. Version + Release Prep

1. Update `package.json` version as needed.
2. Confirm release notes include migration references:
   - `docs/migration.md`
   - this checklist (`docs/release-checklist.md`)
3. Push the release commit and tag/release through your normal GitHub flow.

## 5. CI/Publish Gate Expectations

`publish.yml` blocks `npm publish` unless all gates pass:

1. `pnpm run type-check`
2. `pnpm run test`
3. `pnpm run build`
4. `pnpm run smoke`

If any gate fails, publishing is blocked.

## 6. Post-Release Verification

1. Verify the published version exists on npm:

```bash
npm view @syxs/tavily-cli version
```

2. Install and run a quick command check:

```bash
npx -y @syxs/tavily-cli@latest doctor --json
```

3. Confirm release docs links are still valid from README.

## 7. Rollback Playbook (If Needed)

1. Stop further publish attempts.
2. Document the failure mode and failing gate.
3. Patch on a new commit.
4. Re-run full pre-release validation chain:

```bash
pnpm run type-check && pnpm run test && pnpm run build && pnpm run smoke
```

5. Publish a corrected version (do not overwrite existing npm versions).

# External Integrations

**Analysis Date:** 2026-02-27

## APIs & External Services

**Search/Crawl/Extract/Research API:**
- Tavily API - Primary external service for all data operations.
  - SDK/Client: `@tavily/core` via `tavily()` in `src/utils/client.ts`
  - Auth: API key (`TAVILY_API_KEY` or stored credentials)
  - Endpoint: default `https://api.tavily.com`, optional override with trust guard

**Developer Tooling Services:**
- Skills registry via `npx skills@1.4.1` (`src/commands/setup.ts`, `src/commands/init.ts`)
- MCP installer via `npx add-mcp@1.2.2` and `mcp-remote@0.1.38` (`src/commands/setup.ts`)

## Data Storage

**Local credential storage:**
- OS-specific config directory from `src/utils/credentials.ts`
  - macOS: `~/Library/Application Support/tavily-cli/credentials.json`
  - Linux: `~/.config/tavily-cli/credentials.json`
  - Windows: `%AppData%/Roaming/tavily-cli/credentials.json`
- Permissions: `0700` dir and `0600` file where supported

**Local output files:**
- CLI command output optionally written to user paths via `src/utils/output.ts`
- `.env` editing support via `src/commands/env.ts`

## Authentication & Identity

**API key auth model:**
- Key resolution order in `src/utils/config.ts`:
  1. CLI option
  2. In-memory config
  3. environment variable
  4. stored credentials file
- No OAuth/user identity provider inside this CLI

## Monitoring & Observability

**Runtime logging:**
- Console-based status/errors only (`console.log` / `console.error`)
- No external observability sink (Sentry/Datadog/etc.)

## CI/CD & Deployment

**CI platform:**
- GitHub Actions (`.github/workflows/test.yml`, `.github/workflows/publish.yml`)
- Steps include formatting, type-check, build, and tests.

**npm publishing:**
- Trusted publishing + provenance (`npm publish --provenance`)
- Publishes only when package version does not already exist.

## Environment Configuration

**Development:**
- Requires `TAVILY_API_KEY` or prior `tavily login`.
- Optional `TAVILY_API_URL` and untrusted-host override env.

**Production/Release:**
- Package metadata in `package.json`.
- Publish workflow enforces checks before release push/release events.

## Webhooks & Callbacks

**Incoming webhooks:**
- None in this codebase.

**Outgoing webhooks/callbacks:**
- None from runtime commands.
- Only outbound HTTPS API calls through Tavily SDK methods.

---
*Integration audit: 2026-02-27*
*Update when adding/removing external services*

# Tavily CLI

Unofficial command-line interface for Tavily, built by SYXS. Search, extract, crawl, map, and run research directly from your terminal.

> This is **not** an official Tavily package. It is maintained by **SYXS**.

## Installation

### Option 1: Local install (without npm publish)

```bash
git clone https://github.com/Lag0/tavily-cli.git
cd tavily-cli
pnpm install
pnpm run build
pnpm link --global
```

Then verify:

```bash
tavily --help
```

To remove the global local link later:

```bash
pnpm unlink --global @syxs/tavily-cli
```

### Option 2: npm (if published)

```bash
npm install -g @syxs/tavily-cli
```

Or run the one-shot setup flow:

```bash
TAVILY_API_KEY=tvly-your-key npx -y @syxs/tavily-cli@latest init --all --yes
```

## Quick Start

```bash
# Authenticate

export TAVILY_API_KEY=tvly-your-key
tavily login

# Check status

tavily status

# Search

tavily search "latest AI agent frameworks" --max-results 5

# Extract

tavily extract https://docs.tavily.com -o .tavily/docs.md

# Crawl

tavily crawl https://docs.tavily.com --max-depth 2 --limit 30

# Map

tavily map https://docs.tavily.com --max-depth 2

# Research

tavily research "Analyze current trends in retrieval-augmented generation" --model pro

# Diagnose local readiness

tavily doctor
tavily doctor --json --pretty
```

## Commands

- `search <query>`: web search
- `extract [urls...]`: content extraction
- `crawl <url>`: site crawling
- `map <url>`: URL mapping
- `research <input>`: start research job
- `research-status <request-id>`: fetch research status/result
- `login`: save credentials from interactive input or `TAVILY_API_KEY`
- `logout`: clear saved credentials
- `status`: auth/version summary
- `doctor`: local diagnostics with optional safe auto-remediation (`--fix`, `--fix-check`, `--fix-dry-run`)
- `init`: install + auth + skills
- `setup <skills|mcp>`: install skill or MCP integration
- `env`: write `TAVILY_API_KEY` to `.env`

## Doctor Diagnostics

Use `tavily doctor` to validate local readiness before running Tavily workflows:

```bash
tavily doctor
```

Machine-readable diagnostics:

```bash
tavily doctor --json --pretty
tavily doctor --output .tavily/doctor.json
```

Safe remediation flow:

```bash
tavily doctor --fix-dry-run --json --pretty
tavily doctor --fix
tavily doctor --fix --fix-check auth.credentials_file
```

Exit behavior for automation/CI:

- Exit `0`: no required diagnostic failures
- Exit `1`: one or more required checks failed

## Setup Skills and MCP

Install Tavily skill:

```bash
tavily setup skills
```

Install Tavily remote MCP:

```bash
tavily setup mcp
```

Equivalent direct commands:

```bash
npx skills@1.4.1 add https://github.com/lag0/tavily-cli/tree/main
npx add-mcp@1.2.2 "npx -y mcp-remote@0.1.38 https://mcp.tavily.com/mcp" --name tavily
```

## Environment Variables

- `TAVILY_API_KEY`
- `TAVILY_API_URL` (optional, default: `https://api.tavily.com`)

## Development

```bash
pnpm install
pnpm run type-check
pnpm run build
pnpm run test
pnpm run smoke
```

## Migration and Release Docs

- [Migration Guide](./docs/migration.md)
- [Release Checklist](./docs/release-checklist.md)

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
npx -y @syxs/tavily-cli@latest init --all --yes --api-key tvly-your-key
```

## Quick Start

```bash
# Authenticate

tavily login --api-key tvly-your-key

# Check status

tavily --status

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
```

## Commands

- `search <query>`: web search
- `extract [urls...]`: content extraction
- `crawl <url>`: site crawling
- `map <url>`: URL mapping
- `research <input>`: start research job
- `research-status <request-id>`: fetch research status/result
- `login --api-key <key>`: save credentials
- `logout`: clear saved credentials
- `status`: auth/version summary
- `init`: install + auth + skills
- `setup <skills|mcp>`: install skill or MCP integration
- `env`: write `TAVILY_API_KEY` to `.env`

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
npx skills add syxs/tavily-cli
npx add-mcp "npx -y mcp-remote https://mcp.tavily.com/mcp" --name tavily
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
```

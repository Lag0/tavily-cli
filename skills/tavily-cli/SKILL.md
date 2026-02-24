---
name: tavily
description: |
  Official Tavily CLI skill for search, extract, crawl, map, and research.

  USE FOR:
  - Web research and source discovery
  - URL content extraction
  - Website mapping and crawling
  - Tavily research workflows

  Must be installed and authenticated. See rules/install.md and rules/security.md.
allowed-tools:
  - Bash(tavily *)
  - Bash(npx tavily-cli *)
---

# Tavily CLI

Use the `tavily` CLI for web operations.

## Prerequisites

Check status:

```bash
tavily --status
```

If not authenticated:

```bash
tavily login --api-key "tvly-your-api-key"
```

## Workflow

1. `search` when you need to discover sources.
2. `extract` when you already have URLs.
3. `map` when you need URL discovery on one site.
4. `crawl` when you need bulk content from a site.
5. `research` for end-to-end synthesis workflows.

## Output Rules

Write outputs to `.tavily/` unless the user asks to return inline.

```bash
mkdir -p .tavily

tavily search "query" --json -o .tavily/search-query.json
tavily extract "https://example.com" -o .tavily/example.md
```

Do not read large files in full. Use targeted reads:

```bash
wc -l .tavily/file.json
head -50 .tavily/file.json
rg -n "keyword" .tavily/file.json
```

---
name: tavily-cli-installation
description: |
  Install and authenticate the unofficial Tavily CLI by SYXS.
---

# Tavily CLI Installation

Use this checklist when `tavily` is missing or not authenticated.

## 1) Install CLI

### Preferred (npm)

```bash
npm install -g @syxs/tavily-cli@latest
```

### One-shot setup (install + auth + skills)

```bash
npx -y @syxs/tavily-cli@latest init --all --yes --api-key "tvly-your-api-key"
```

### Local development install (if needed)

```bash
git clone https://github.com/Lag0/tavily-cli.git
cd tavily-cli
pnpm install
pnpm run build
pnpm link --global
```

## 2) Verify installation and auth

```bash
tavily status
```

## 3) Authenticate (if needed)

```bash
tavily login --api-key "tvly-your-api-key"
```

Recheck:

```bash
tavily status
```

## 4) Install skill and MCP integrations

```bash
tavily setup skills
tavily setup mcp
```

If `setup skills` fails due to old published version/source mismatch, use direct fallback:

```bash
npx -y skills add https://github.com/lag0/tavily-cli.git
```

## 5) Optional local env export

```bash
tavily env --file .env --overwrite
```

## 6) Local uninstall cleanup (for linked local install only)

```bash
pnpm unlink --global @syxs/tavily-cli
```

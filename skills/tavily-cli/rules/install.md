---
name: tavily-cli-installation
description: |
  Install and authenticate the unofficial Tavily CLI by SYXS.
---

# Tavily CLI Installation

## Local Install (No npm publish required)

```bash
git clone https://github.com/Lag0/tavily-cli.git
cd tavily-cli
pnpm install
pnpm run build
pnpm link --global
```

Verify:

```bash
tavily --status
```

Remove local global link:

```bash
pnpm unlink --global @syxs/tavily-cli
```

## Quick Setup

```bash
npx -y @syxs/tavily-cli@latest init --all --yes --api-key "tvly-your-api-key"
```

## Manual Install

```bash
npm install -g @syxs/tavily-cli@latest
```

## Verify

```bash
tavily --status
```

## Authenticate

```bash
tavily login --api-key "tvly-your-api-key"
```

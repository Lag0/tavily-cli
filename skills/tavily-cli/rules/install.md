---
name: tavily-cli-installation
description: |
  Install and authenticate the official Tavily CLI.
---

# Tavily CLI Installation

## Quick Setup

```bash
npx -y tavily-cli@latest init --all --yes --api-key "tvly-your-api-key"
```

## Manual Install

```bash
npm install -g tavily-cli@latest
```

## Verify

```bash
tavily --status
```

## Authenticate

```bash
tavily login --api-key "tvly-your-api-key"
```

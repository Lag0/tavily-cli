---
name: tavily-cli-installation
description: |
  Trust-boundary and readiness checks for Tavily CLI skill usage.
---

# Tavily CLI Readiness

This skill assumes Tavily CLI is provisioned by your environment owner.

To reduce supply-chain risk in skill execution, this file does not include
installer bootstrap commands or remote source URLs.

Use approved internal documentation/channels for installation.

## Preflight Checks

1. Confirm the binary is available:

```bash
tavily --help
```

2. Confirm auth state:

```bash
tavily status
```

3. If authentication is missing, authenticate interactively:

```bash
tavily login
```

4. Configure optional integrations (when needed):

```bash
tavily setup skills
tavily setup mcp
```

5. Optional local environment export:

```bash
tavily env --file .env --overwrite
```

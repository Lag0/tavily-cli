#!/usr/bin/env node

import { Command, InvalidArgumentError } from 'commander';
import packageJson from '../package.json';
import { registerAllCommands } from './commands/registrars/register-all-commands';
import { initializeConfig, updateConfig, validateConfig } from './utils/config';
import { isUrl, normalizeUrl } from './utils/url';

const AUTH_REQUIRED_COMMANDS = [
  'search',
  'extract',
  'crawl',
  'map',
  'research',
  'research-status',
];

function parseIntegerOption(optionName: string, min = 1) {
  return (value: string): number => {
    const parsed = Number(value);
    if (!Number.isInteger(parsed)) {
      throw new InvalidArgumentError(`${optionName} must be an integer.`);
    }

    if (parsed < min) {
      throw new InvalidArgumentError(`${optionName} must be >= ${min}.`);
    }

    return parsed;
  };
}

function parsePositiveNumberOption(optionName: string) {
  return (value: string): number => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new InvalidArgumentError(
        `${optionName} must be a number greater than 0.`
      );
    }

    return parsed;
  };
}

export function createProgram(): Command {
  const program = new Command();

  program
    .name('tavily')
    .description(
      'CLI tool for Tavily search, extraction, crawling, and research'
    )
    .version(packageJson.version)
    .option(
      '-k, --api-key <key>',
      'Tavily API key (or set TAVILY_API_KEY env var)'
    )
    .option('--api-url <url>', 'Tavily API URL (or set TAVILY_API_URL env var)')
    .hook('preAction', (thisCommand, actionCommand) => {
      const globalOptions = thisCommand.opts();
      const commandOptions = actionCommand.opts();

      if (globalOptions.apiKey) {
        updateConfig({ apiKey: globalOptions.apiKey });
      }

      if (globalOptions.apiUrl) {
        updateConfig({ apiUrl: globalOptions.apiUrl });
      }

      if (commandOptions.apiKey) {
        updateConfig({ apiKey: commandOptions.apiKey });
      }

      if (commandOptions.apiUrl) {
        updateConfig({ apiUrl: commandOptions.apiUrl });
      }

      if (AUTH_REQUIRED_COMMANDS.includes(actionCommand.name())) {
        validateConfig(commandOptions.apiKey || globalOptions.apiKey);
      }
    });

  registerAllCommands(program, {
    parseIntegerOption,
    parsePositiveNumberOption,
  });

  return program;
}

export async function runCli(argv: string[] = process.argv): Promise<void> {
  initializeConfig();

  const args = argv.slice(2);
  const program = createProgram();

  if (args.length === 0) {
    program.outputHelp();
    return;
  }

  if (!args[0].startsWith('-') && isUrl(args[0])) {
    const url = normalizeUrl(args[0]);
    const remaining = args.slice(1);
    const next = ['extract', url, ...remaining];
    await program.parseAsync(['node', 'tavily', ...next]);
    return;
  }

  await program.parseAsync(argv);
}

if (
  typeof require !== 'undefined' &&
  typeof module !== 'undefined' &&
  require.main === module
) {
  runCli(process.argv).catch((error) => {
    console.error(
      `Fatal error: ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  });
}

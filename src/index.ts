#!/usr/bin/env node

import { Command, CommanderError, InvalidArgumentError } from 'commander';
import packageJson from '../package.json';
import { registerAllCommands } from './commands/registrars/register-all-commands';
import {
  CommandRuntimeError,
  isCommandRuntimeError,
  toCommandRuntimeError,
} from './commands/runtime/command-error';
import { renderCliError } from './commands/runtime/render-cli-error';
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
  program.exitOverride();

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

function printCliError(error: CommandRuntimeError): void {
  console.error(renderCliError(error));
}

function isCommanderError(error: unknown): error is CommanderError {
  return error instanceof CommanderError;
}

export function handleCliError(error: unknown): void {
  if (isCommandRuntimeError(error)) {
    printCliError(error);
    process.exitCode = error.exitCode;
    return;
  }

  if (error instanceof InvalidArgumentError) {
    const runtimeError = new CommandRuntimeError({
      code: 'INVALID_INPUT',
      message: error.message,
      exitCode: 1,
      suggestion: 'Run the command with --help to inspect valid options.',
      cause: error,
    });
    printCliError(runtimeError);
    process.exitCode = runtimeError.exitCode;
    return;
  }

  if (isCommanderError(error)) {
    const runtimeError = new CommandRuntimeError({
      code: 'INVALID_INPUT',
      message: error.message,
      exitCode: error.exitCode || 1,
      suggestion: 'Run `tavily --help` for command usage.',
      cause: error,
    });
    printCliError(runtimeError);
    process.exitCode = runtimeError.exitCode;
    return;
  }

  const runtimeError = toCommandRuntimeError(error, {
    code: 'COMMAND_EXECUTION_FAILED',
    message: 'Unexpected command failure.',
    exitCode: 1,
    suggestion: 'Retry the command. If it persists, run `tavily doctor`.',
  });
  printCliError(runtimeError);
  process.exitCode = runtimeError.exitCode;
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
    try {
      const url = normalizeUrl(args[0]);
      const remaining = args.slice(1);
      const next = ['extract', url, ...remaining];
      await program.parseAsync(['node', 'tavily', ...next]);
    } catch (error) {
      handleCliError(error);
    }
    return;
  }

  try {
    await program.parseAsync(argv);
  } catch (error) {
    handleCliError(error);
  }
}

if (
  typeof require !== 'undefined' &&
  typeof module !== 'undefined' &&
  require.main === module
) {
  runCli(process.argv);
}

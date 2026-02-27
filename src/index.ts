#!/usr/bin/env node

import { Command, InvalidArgumentError } from 'commander';
import packageJson from '../package.json';
import { handleSearchCommand } from './commands/search';
import { handleExtractCommand } from './commands/extract';
import { handleCrawlCommand } from './commands/crawl';
import { handleMapCommand } from './commands/map';
import {
  handleResearchCommand,
  handleResearchStatusCommand,
} from './commands/research';
import { handleLoginCommand } from './commands/login';
import { handleLogoutCommand } from './commands/logout';
import { handleStatusCommand } from './commands/status';
import { handleInitCommand } from './commands/init';
import { handleSetupCommand } from './commands/setup';
import type { SetupSubcommand } from './commands/setup';
import { handleEnvPullCommand } from './commands/env';
import { initializeConfig, updateConfig, validateConfig } from './utils/config';
import { parseJsonObject, parseList } from './utils/options';
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

  program
    .command('search')
    .description('Search the web using Tavily')
    .argument('<query>', 'Search query')
    .option(
      '--max-results <number>',
      'Maximum number of results',
      parseIntegerOption('--max-results')
    )
    .option(
      '--search-depth <depth>',
      'Search depth: basic, advanced, fast, ultra-fast'
    )
    .option('--topic <topic>', 'Search topic: general, news, finance')
    .option('--time-range <range>', 'Time range: day, week, month, year')
    .option('--start-date <date>', 'Start date in YYYY-MM-DD')
    .option('--end-date <date>', 'End date in YYYY-MM-DD')
    .option('--include-domains <domains>', 'Comma-separated domains to include')
    .option('--exclude-domains <domains>', 'Comma-separated domains to exclude')
    .option('--country <code>', 'Country code boost, e.g., US, BR, DE')
    .option('--include-raw-content', 'Include full raw content', false)
    .option('--include-images', 'Include images', false)
    .option('--include-image-descriptions', 'Include image descriptions', false)
    .option('--include-answer', 'Include direct answer', false)
    .option('--include-favicon', 'Include favicon', false)
    .option('--include-usage', 'Include usage details', false)
    .option(
      '-k, --api-key <key>',
      'Tavily API key (overrides global --api-key)'
    )
    .option('--api-url <url>', 'Tavily API URL (overrides global --api-url)')
    .option('-o, --output <path>', 'Output file path')
    .option('--json', 'Output as JSON', false)
    .option('--pretty', 'Pretty print JSON output', false)
    .action(async (query, options) => {
      await handleSearchCommand({
        query,
        maxResults: options.maxResults,
        searchDepth: options.searchDepth,
        topic: options.topic,
        timeRange: options.timeRange,
        startDate: options.startDate,
        endDate: options.endDate,
        includeDomains: parseList(options.includeDomains),
        excludeDomains: parseList(options.excludeDomains),
        country: options.country,
        includeRawContent: options.includeRawContent,
        includeImages: options.includeImages,
        includeImageDescriptions: options.includeImageDescriptions,
        includeAnswer: options.includeAnswer,
        includeFavicon: options.includeFavicon,
        includeUsage: options.includeUsage,
        apiKey: options.apiKey,
        apiUrl: options.apiUrl,
        output: options.output,
        json: options.json,
        pretty: options.pretty,
      });
    });

  program
    .command('extract')
    .description('Extract content from one or more URLs')
    .argument('[urls...]', 'URL(s) to extract')
    .option('-u, --url <url>', 'Single URL to extract')
    .option('--extract-depth <depth>', 'Extract depth: basic or advanced')
    .option('--format <format>', 'Output format: markdown or text')
    .option('--include-images', 'Include images', false)
    .option('--include-favicon', 'Include favicon', false)
    .option('--include-usage', 'Include usage details', false)
    .option(
      '--timeout <seconds>',
      'Timeout in seconds',
      parsePositiveNumberOption('--timeout')
    )
    .option('--query <query>', 'Optional relevance query')
    .option(
      '--chunks-per-source <number>',
      'Chunks per source',
      parseIntegerOption('--chunks-per-source')
    )
    .option(
      '-k, --api-key <key>',
      'Tavily API key (overrides global --api-key)'
    )
    .option('--api-url <url>', 'Tavily API URL (overrides global --api-url)')
    .option('-o, --output <path>', 'Output file path')
    .option('--json', 'Output as JSON', false)
    .option('--pretty', 'Pretty print JSON output', false)
    .action(async (positionalUrls: string[], options) => {
      const urls = [...(positionalUrls ?? [])];

      if (options.url) {
        urls.push(options.url);
      }

      const normalizedUrls = [...new Set(urls.map(normalizeUrl))];

      if (normalizedUrls.length === 0) {
        console.error('Error: at least one URL is required.');
        process.exit(1);
      }

      await handleExtractCommand({
        urls: normalizedUrls,
        extractDepth: options.extractDepth,
        format: options.format,
        includeImages: options.includeImages,
        includeFavicon: options.includeFavicon,
        includeUsage: options.includeUsage,
        timeout: options.timeout,
        query: options.query,
        chunksPerSource: options.chunksPerSource,
        apiKey: options.apiKey,
        apiUrl: options.apiUrl,
        output: options.output,
        json: options.json,
        pretty: options.pretty,
      });
    });

  program
    .command('crawl')
    .description('Crawl a website with Tavily')
    .argument('<url>', 'Root URL to crawl')
    .option(
      '--max-depth <number>',
      'Maximum crawl depth',
      parseIntegerOption('--max-depth')
    )
    .option(
      '--max-breadth <number>',
      'Maximum breadth per page',
      parseIntegerOption('--max-breadth')
    )
    .option(
      '--limit <number>',
      'Maximum number of pages',
      parseIntegerOption('--limit')
    )
    .option('--extract-depth <depth>', 'Extract depth: basic or advanced')
    .option('--select-paths <patterns>', 'Comma-separated regex path filters')
    .option(
      '--select-domains <patterns>',
      'Comma-separated regex domain filters'
    )
    .option(
      '--exclude-paths <patterns>',
      'Comma-separated regex path exclusions'
    )
    .option(
      '--exclude-domains <patterns>',
      'Comma-separated regex domain exclusions'
    )
    .option('--allow-external', 'Allow external domains', false)
    .option('--include-images', 'Include images', false)
    .option('--instructions <text>', 'Crawl guidance instructions')
    .option('--format <format>', 'Output format: markdown or text')
    .option(
      '--timeout <seconds>',
      'Timeout in seconds',
      parsePositiveNumberOption('--timeout')
    )
    .option('--include-favicon', 'Include favicon', false)
    .option('--include-usage', 'Include usage details', false)
    .option(
      '--chunks-per-source <number>',
      'Chunks per source',
      parseIntegerOption('--chunks-per-source')
    )
    .option(
      '-k, --api-key <key>',
      'Tavily API key (overrides global --api-key)'
    )
    .option('--api-url <url>', 'Tavily API URL (overrides global --api-url)')
    .option('-o, --output <path>', 'Output file path')
    .option('--json', 'Output as JSON', false)
    .option('--pretty', 'Pretty print JSON output', false)
    .action(async (url, options) => {
      await handleCrawlCommand({
        url: normalizeUrl(url),
        maxDepth: options.maxDepth,
        maxBreadth: options.maxBreadth,
        limit: options.limit,
        extractDepth: options.extractDepth,
        selectPaths: parseList(options.selectPaths),
        selectDomains: parseList(options.selectDomains),
        excludePaths: parseList(options.excludePaths),
        excludeDomains: parseList(options.excludeDomains),
        allowExternal: options.allowExternal,
        includeImages: options.includeImages,
        instructions: options.instructions,
        format: options.format,
        timeout: options.timeout,
        includeFavicon: options.includeFavicon,
        includeUsage: options.includeUsage,
        chunksPerSource: options.chunksPerSource,
        apiKey: options.apiKey,
        apiUrl: options.apiUrl,
        output: options.output,
        json: options.json,
        pretty: options.pretty,
      });
    });

  program
    .command('map')
    .description('Map URLs on a website with Tavily')
    .argument('<url>', 'Root URL to map')
    .option(
      '--max-depth <number>',
      'Maximum map depth',
      parseIntegerOption('--max-depth')
    )
    .option(
      '--max-breadth <number>',
      'Maximum breadth per level',
      parseIntegerOption('--max-breadth')
    )
    .option(
      '--limit <number>',
      'Maximum URLs to return',
      parseIntegerOption('--limit')
    )
    .option('--select-paths <patterns>', 'Comma-separated regex path filters')
    .option(
      '--select-domains <patterns>',
      'Comma-separated regex domain filters'
    )
    .option(
      '--exclude-paths <patterns>',
      'Comma-separated regex path exclusions'
    )
    .option(
      '--exclude-domains <patterns>',
      'Comma-separated regex domain exclusions'
    )
    .option('--allow-external', 'Allow external domains', false)
    .option('--instructions <text>', 'Map guidance instructions')
    .option(
      '--timeout <seconds>',
      'Timeout in seconds',
      parsePositiveNumberOption('--timeout')
    )
    .option('--include-usage', 'Include usage details', false)
    .option(
      '-k, --api-key <key>',
      'Tavily API key (overrides global --api-key)'
    )
    .option('--api-url <url>', 'Tavily API URL (overrides global --api-url)')
    .option('-o, --output <path>', 'Output file path')
    .option('--json', 'Output as JSON', false)
    .option('--pretty', 'Pretty print JSON output', false)
    .action(async (url, options) => {
      await handleMapCommand({
        url: normalizeUrl(url),
        maxDepth: options.maxDepth,
        maxBreadth: options.maxBreadth,
        limit: options.limit,
        selectPaths: parseList(options.selectPaths),
        selectDomains: parseList(options.selectDomains),
        excludePaths: parseList(options.excludePaths),
        excludeDomains: parseList(options.excludeDomains),
        allowExternal: options.allowExternal,
        instructions: options.instructions,
        timeout: options.timeout,
        includeUsage: options.includeUsage,
        apiKey: options.apiKey,
        apiUrl: options.apiUrl,
        output: options.output,
        json: options.json,
        pretty: options.pretty,
      });
    });

  program
    .command('research')
    .description('Start a Tavily research task')
    .argument('<input>', 'Research request')
    .option('--model <model>', 'Research model: mini, pro, auto')
    .option('--citation-format <format>', 'Citation format')
    .option(
      '--timeout <seconds>',
      'Timeout in seconds',
      parsePositiveNumberOption('--timeout')
    )
    .option('--stream', 'Stream research result', false)
    .option('--output-schema <json>', 'JSON schema object as string')
    .option(
      '-k, --api-key <key>',
      'Tavily API key (overrides global --api-key)'
    )
    .option('--api-url <url>', 'Tavily API URL (overrides global --api-url)')
    .option('-o, --output <path>', 'Output file path')
    .option('--json', 'Output as JSON', false)
    .option('--pretty', 'Pretty print JSON output', false)
    .action(async (input, options) => {
      await handleResearchCommand({
        input,
        model: options.model,
        citationFormat: options.citationFormat,
        timeout: options.timeout,
        stream: options.stream,
        outputSchema: parseJsonObject(options.outputSchema),
        apiKey: options.apiKey,
        apiUrl: options.apiUrl,
        output: options.output,
        json: options.json,
        pretty: options.pretty,
      });
    });

  program
    .command('research-status')
    .description('Get status/result from an existing Tavily research request')
    .argument('<request-id>', 'Research request ID')
    .option(
      '-k, --api-key <key>',
      'Tavily API key (overrides global --api-key)'
    )
    .option('--api-url <url>', 'Tavily API URL (overrides global --api-url)')
    .option('-o, --output <path>', 'Output file path')
    .option('--json', 'Output as JSON', false)
    .option('--pretty', 'Pretty print JSON output', false)
    .action(async (requestId, options) => {
      await handleResearchStatusCommand({
        requestId,
        apiKey: options.apiKey,
        apiUrl: options.apiUrl,
        output: options.output,
        json: options.json,
        pretty: options.pretty,
      });
    });

  program
    .command('login')
    .description('Login with Tavily API key (interactive, env, or --api-key)')
    .option('-k, --api-key <key>', 'Tavily API key')
    .option('--api-url <url>', 'API URL (default: https://api.tavily.com)')
    .action(async (options, command) => {
      const globalOptions = command.parent?.opts() ?? {};

      await handleLoginCommand({
        apiKey: options.apiKey || globalOptions.apiKey,
        apiUrl: options.apiUrl || globalOptions.apiUrl,
      });
    });

  program
    .command('logout')
    .description('Logout and clear stored credentials')
    .action(async () => {
      await handleLogoutCommand();
    });

  program
    .command('status')
    .description('Show version and authentication status')
    .action(async () => {
      await handleStatusCommand();
    });

  program
    .command('init')
    .description(
      'Install CLI globally, configure auth, and install skills in one step (npx -y @syxs/tavily-cli init)'
    )
    .option('--all', 'Install skills to all detected agents (implies --yes)')
    .option('-y, --yes', 'Skip confirmation prompts for skills installation')
    .option('-g, --global', 'Install skills globally (user-level)')
    .option('-a, --agent <agent>', 'Install skills to a specific agent')
    .option('-k, --api-key <key>', 'Authenticate with this API key')
    .option('--skip-install', 'Skip global CLI installation')
    .option('--skip-auth', 'Skip authentication')
    .option('--skip-skills', 'Skip skills installation')
    .action(async (options) => {
      await handleInitCommand({
        all: options.all,
        yes: options.yes,
        global: options.global,
        agent: options.agent,
        apiKey: options.apiKey,
        skipInstall: options.skipInstall,
        skipAuth: options.skipAuth,
        skipSkills: options.skipSkills,
      });
    });

  program
    .command('setup')
    .description('Set up individual Tavily integrations (skills, mcp)')
    .argument('<subcommand>', 'What to set up: skills or mcp')
    .option('-g, --global', 'Install globally (user-level)')
    .option('-a, --agent <agent>', 'Install to a specific agent')
    .action(async (subcommand: SetupSubcommand, options) => {
      await handleSetupCommand(subcommand, options);
    });

  program
    .command('env')
    .description('Pull TAVILY_API_KEY into a local .env file')
    .option('-f, --file <path>', 'Target env file (default: .env)')
    .option('--overwrite', 'Overwrite existing TAVILY_API_KEY if present')
    .action(async (options) => {
      await handleEnvPullCommand({
        file: options.file,
        overwrite: options.overwrite,
      });
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

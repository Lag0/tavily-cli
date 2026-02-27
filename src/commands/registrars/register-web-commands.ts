import type { Command } from 'commander';
import { handleSearchCommand } from '../search';
import { handleExtractCommand } from '../extract';
import { handleCrawlCommand } from '../crawl';
import { handleMapCommand } from '../map';
import {
  handleResearchCommand,
  handleResearchStatusCommand,
} from '../research';
import { parseJsonObject, parseList } from '../../utils/options';
import { normalizeUrl } from '../../utils/url';

export interface WebCommandRegistrationOptions {
  parseIntegerOption: (
    optionName: string,
    min?: number
  ) => (value: string) => number;
  parsePositiveNumberOption: (optionName: string) => (value: string) => number;
}

export function registerWebCommands(
  program: Command,
  options: WebCommandRegistrationOptions
): void {
  program
    .command('search')
    .description('Search the web using Tavily')
    .argument('<query>', 'Search query')
    .option(
      '--max-results <number>',
      'Maximum number of results',
      options.parseIntegerOption('--max-results')
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
    .action(async (query, searchOptions) => {
      await handleSearchCommand({
        query,
        maxResults: searchOptions.maxResults,
        searchDepth: searchOptions.searchDepth,
        topic: searchOptions.topic,
        timeRange: searchOptions.timeRange,
        startDate: searchOptions.startDate,
        endDate: searchOptions.endDate,
        includeDomains: parseList(searchOptions.includeDomains),
        excludeDomains: parseList(searchOptions.excludeDomains),
        country: searchOptions.country,
        includeRawContent: searchOptions.includeRawContent,
        includeImages: searchOptions.includeImages,
        includeImageDescriptions: searchOptions.includeImageDescriptions,
        includeAnswer: searchOptions.includeAnswer,
        includeFavicon: searchOptions.includeFavicon,
        includeUsage: searchOptions.includeUsage,
        apiKey: searchOptions.apiKey,
        apiUrl: searchOptions.apiUrl,
        output: searchOptions.output,
        json: searchOptions.json,
        pretty: searchOptions.pretty,
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
      options.parsePositiveNumberOption('--timeout')
    )
    .option('--query <query>', 'Optional relevance query')
    .option(
      '--chunks-per-source <number>',
      'Chunks per source',
      options.parseIntegerOption('--chunks-per-source')
    )
    .option(
      '-k, --api-key <key>',
      'Tavily API key (overrides global --api-key)'
    )
    .option('--api-url <url>', 'Tavily API URL (overrides global --api-url)')
    .option('-o, --output <path>', 'Output file path')
    .option('--json', 'Output as JSON', false)
    .option('--pretty', 'Pretty print JSON output', false)
    .action(async (positionalUrls: string[], extractOptions) => {
      const urls = [...(positionalUrls ?? [])];

      if (extractOptions.url) {
        urls.push(extractOptions.url);
      }

      const normalizedUrls = [...new Set(urls.map(normalizeUrl))];

      if (normalizedUrls.length === 0) {
        console.error('Error: at least one URL is required.');
        process.exit(1);
      }

      await handleExtractCommand({
        urls: normalizedUrls,
        extractDepth: extractOptions.extractDepth,
        format: extractOptions.format,
        includeImages: extractOptions.includeImages,
        includeFavicon: extractOptions.includeFavicon,
        includeUsage: extractOptions.includeUsage,
        timeout: extractOptions.timeout,
        query: extractOptions.query,
        chunksPerSource: extractOptions.chunksPerSource,
        apiKey: extractOptions.apiKey,
        apiUrl: extractOptions.apiUrl,
        output: extractOptions.output,
        json: extractOptions.json,
        pretty: extractOptions.pretty,
      });
    });

  program
    .command('crawl')
    .description('Crawl a website with Tavily')
    .argument('<url>', 'Root URL to crawl')
    .option(
      '--max-depth <number>',
      'Maximum crawl depth',
      options.parseIntegerOption('--max-depth')
    )
    .option(
      '--max-breadth <number>',
      'Maximum breadth per page',
      options.parseIntegerOption('--max-breadth')
    )
    .option(
      '--limit <number>',
      'Maximum number of pages',
      options.parseIntegerOption('--limit')
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
      options.parsePositiveNumberOption('--timeout')
    )
    .option('--include-favicon', 'Include favicon', false)
    .option('--include-usage', 'Include usage details', false)
    .option(
      '--chunks-per-source <number>',
      'Chunks per source',
      options.parseIntegerOption('--chunks-per-source')
    )
    .option(
      '-k, --api-key <key>',
      'Tavily API key (overrides global --api-key)'
    )
    .option('--api-url <url>', 'Tavily API URL (overrides global --api-url)')
    .option('-o, --output <path>', 'Output file path')
    .option('--json', 'Output as JSON', false)
    .option('--pretty', 'Pretty print JSON output', false)
    .action(async (url, crawlOptions) => {
      await handleCrawlCommand({
        url: normalizeUrl(url),
        maxDepth: crawlOptions.maxDepth,
        maxBreadth: crawlOptions.maxBreadth,
        limit: crawlOptions.limit,
        extractDepth: crawlOptions.extractDepth,
        selectPaths: parseList(crawlOptions.selectPaths),
        selectDomains: parseList(crawlOptions.selectDomains),
        excludePaths: parseList(crawlOptions.excludePaths),
        excludeDomains: parseList(crawlOptions.excludeDomains),
        allowExternal: crawlOptions.allowExternal,
        includeImages: crawlOptions.includeImages,
        instructions: crawlOptions.instructions,
        format: crawlOptions.format,
        timeout: crawlOptions.timeout,
        includeFavicon: crawlOptions.includeFavicon,
        includeUsage: crawlOptions.includeUsage,
        chunksPerSource: crawlOptions.chunksPerSource,
        apiKey: crawlOptions.apiKey,
        apiUrl: crawlOptions.apiUrl,
        output: crawlOptions.output,
        json: crawlOptions.json,
        pretty: crawlOptions.pretty,
      });
    });

  program
    .command('map')
    .description('Map URLs on a website with Tavily')
    .argument('<url>', 'Root URL to map')
    .option(
      '--max-depth <number>',
      'Maximum map depth',
      options.parseIntegerOption('--max-depth')
    )
    .option(
      '--max-breadth <number>',
      'Maximum breadth per level',
      options.parseIntegerOption('--max-breadth')
    )
    .option(
      '--limit <number>',
      'Maximum URLs to return',
      options.parseIntegerOption('--limit')
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
      options.parsePositiveNumberOption('--timeout')
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
    .action(async (url, mapOptions) => {
      await handleMapCommand({
        url: normalizeUrl(url),
        maxDepth: mapOptions.maxDepth,
        maxBreadth: mapOptions.maxBreadth,
        limit: mapOptions.limit,
        selectPaths: parseList(mapOptions.selectPaths),
        selectDomains: parseList(mapOptions.selectDomains),
        excludePaths: parseList(mapOptions.excludePaths),
        excludeDomains: parseList(mapOptions.excludeDomains),
        allowExternal: mapOptions.allowExternal,
        instructions: mapOptions.instructions,
        timeout: mapOptions.timeout,
        includeUsage: mapOptions.includeUsage,
        apiKey: mapOptions.apiKey,
        apiUrl: mapOptions.apiUrl,
        output: mapOptions.output,
        json: mapOptions.json,
        pretty: mapOptions.pretty,
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
      options.parsePositiveNumberOption('--timeout')
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
    .action(async (input, researchOptions) => {
      await handleResearchCommand({
        input,
        model: researchOptions.model,
        citationFormat: researchOptions.citationFormat,
        timeout: researchOptions.timeout,
        stream: researchOptions.stream,
        outputSchema: parseJsonObject(researchOptions.outputSchema),
        apiKey: researchOptions.apiKey,
        apiUrl: researchOptions.apiUrl,
        output: researchOptions.output,
        json: researchOptions.json,
        pretty: researchOptions.pretty,
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
    .action(async (requestId, statusOptions) => {
      await handleResearchStatusCommand({
        requestId,
        apiKey: statusOptions.apiKey,
        apiUrl: statusOptions.apiUrl,
        output: statusOptions.output,
        json: statusOptions.json,
        pretty: statusOptions.pretty,
      });
    });
}

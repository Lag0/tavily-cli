import type {
  TavilyCrawlOptions,
  TavilyExtractOptions,
  TavilyMapOptions,
  TavilyResearchOptions,
  TavilySearchOptions,
} from '@tavily/core';
import type { CrawlOptions } from './crawl';
import type { ExtractOptions } from './extract';
import type { MapOptions } from './map';
import type { ResearchOptions } from './research';
import type { SearchOptions } from './search';

type SearchRawContentMode = NonNullable<
  TavilySearchOptions['includeRawContent']
>;
type CitationFormat = NonNullable<TavilyResearchOptions['citationFormat']>;

const CITATION_FORMATS: readonly CitationFormat[] = [
  'numbered',
  'mla',
  'apa',
  'chicago',
];

function toSearchRawContentMode(
  includeRawContent: SearchOptions['includeRawContent']
): SearchRawContentMode | undefined {
  if (!includeRawContent) {
    return undefined;
  }

  return 'markdown';
}

function toCitationFormat(
  citationFormat: ResearchOptions['citationFormat']
): CitationFormat | undefined {
  if (!citationFormat) {
    return undefined;
  }

  if ((CITATION_FORMATS as readonly string[]).includes(citationFormat)) {
    return citationFormat as CitationFormat;
  }

  return undefined;
}

export interface SearchRequestAdapterResult {
  query: string;
  request: TavilySearchOptions;
}

export function buildSearchRequest(
  options: SearchOptions
): SearchRequestAdapterResult {
  return {
    query: options.query,
    request: {
      maxResults: options.maxResults,
      searchDepth: options.searchDepth,
      topic: options.topic,
      timeRange: options.timeRange,
      startDate: options.startDate,
      endDate: options.endDate,
      includeDomains: options.includeDomains,
      excludeDomains: options.excludeDomains,
      country: options.country,
      includeRawContent: toSearchRawContentMode(options.includeRawContent),
      includeImages: options.includeImages,
      includeImageDescriptions: options.includeImageDescriptions,
      includeAnswer: options.includeAnswer,
      includeFavicon: options.includeFavicon,
      includeUsage: options.includeUsage,
    },
  };
}

export interface ExtractRequestAdapterResult {
  urls: string[];
  request: TavilyExtractOptions;
}

export function buildExtractRequest(
  options: ExtractOptions
): ExtractRequestAdapterResult {
  return {
    urls: options.urls,
    request: {
      extractDepth: options.extractDepth,
      format: options.format,
      includeImages: options.includeImages,
      includeFavicon: options.includeFavicon,
      includeUsage: options.includeUsage,
      timeout: options.timeout,
      query: options.query,
      chunksPerSource: options.chunksPerSource,
    },
  };
}

export interface CrawlRequestAdapterResult {
  url: string;
  request: TavilyCrawlOptions;
}

export function buildCrawlRequest(
  options: CrawlOptions
): CrawlRequestAdapterResult {
  return {
    url: options.url,
    request: {
      maxDepth: options.maxDepth,
      maxBreadth: options.maxBreadth,
      limit: options.limit,
      extractDepth: options.extractDepth,
      selectPaths: options.selectPaths,
      selectDomains: options.selectDomains,
      excludePaths: options.excludePaths,
      excludeDomains: options.excludeDomains,
      allowExternal: options.allowExternal,
      includeImages: options.includeImages,
      instructions: options.instructions,
      format: options.format,
      timeout: options.timeout,
      includeFavicon: options.includeFavicon,
      includeUsage: options.includeUsage,
      chunksPerSource: options.chunksPerSource,
    },
  };
}

export interface MapRequestAdapterResult {
  url: string;
  request: TavilyMapOptions;
}

export function buildMapRequest(options: MapOptions): MapRequestAdapterResult {
  return {
    url: options.url,
    request: {
      maxDepth: options.maxDepth,
      maxBreadth: options.maxBreadth,
      limit: options.limit,
      selectPaths: options.selectPaths,
      selectDomains: options.selectDomains,
      excludePaths: options.excludePaths,
      excludeDomains: options.excludeDomains,
      allowExternal: options.allowExternal,
      instructions: options.instructions,
      timeout: options.timeout,
      includeUsage: options.includeUsage,
    },
  };
}

export interface ResearchRequestAdapterResult {
  input: string;
  request: TavilyResearchOptions;
}

export function buildResearchRequest(
  options: ResearchOptions
): ResearchRequestAdapterResult {
  return {
    input: options.input,
    request: {
      model: options.model,
      citationFormat: toCitationFormat(options.citationFormat),
      timeout: options.timeout,
      stream: options.stream,
      outputSchema: options.outputSchema,
    },
  };
}

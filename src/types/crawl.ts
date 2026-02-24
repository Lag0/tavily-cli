import type { ExtractDepth, ExtractFormat } from './extract';

export interface CrawlOptions {
  url: string;
  apiKey?: string;
  apiUrl?: string;
  maxDepth?: number;
  maxBreadth?: number;
  limit?: number;
  extractDepth?: ExtractDepth;
  selectPaths?: string[];
  selectDomains?: string[];
  excludePaths?: string[];
  excludeDomains?: string[];
  allowExternal?: boolean;
  includeImages?: boolean;
  instructions?: string;
  format?: ExtractFormat;
  timeout?: number;
  includeFavicon?: boolean;
  includeUsage?: boolean;
  chunksPerSource?: number;
  json?: boolean;
  pretty?: boolean;
  output?: string;
}

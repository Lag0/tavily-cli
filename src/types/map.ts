export interface MapOptions {
  url: string;
  apiKey?: string;
  apiUrl?: string;
  maxDepth?: number;
  maxBreadth?: number;
  limit?: number;
  selectPaths?: string[];
  selectDomains?: string[];
  excludePaths?: string[];
  excludeDomains?: string[];
  allowExternal?: boolean;
  instructions?: string;
  timeout?: number;
  includeUsage?: boolean;
  json?: boolean;
  pretty?: boolean;
  output?: string;
}

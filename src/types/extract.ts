export type ExtractDepth = 'basic' | 'advanced';
export type ExtractFormat = 'markdown' | 'text';

export interface ExtractOptions {
  urls: string[];
  apiKey?: string;
  apiUrl?: string;
  extractDepth?: ExtractDepth;
  format?: ExtractFormat;
  includeImages?: boolean;
  includeFavicon?: boolean;
  includeUsage?: boolean;
  timeout?: number;
  query?: string;
  chunksPerSource?: number;
  json?: boolean;
  pretty?: boolean;
  output?: string;
}

export type SearchDepth = 'basic' | 'advanced' | 'fast' | 'ultra-fast';
export type SearchTopic = 'general' | 'news' | 'finance';
export type TimeRange = 'day' | 'week' | 'month' | 'year';

export interface SearchOptions {
  query: string;
  apiKey?: string;
  apiUrl?: string;
  maxResults?: number;
  searchDepth?: SearchDepth;
  topic?: SearchTopic;
  timeRange?: TimeRange;
  startDate?: string;
  endDate?: string;
  includeDomains?: string[];
  excludeDomains?: string[];
  country?: string;
  includeRawContent?: boolean;
  includeImages?: boolean;
  includeImageDescriptions?: boolean;
  includeAnswer?: boolean;
  includeFavicon?: boolean;
  includeUsage?: boolean;
  json?: boolean;
  pretty?: boolean;
  output?: string;
}

import type { SearchOptions } from '../types/search';
import { getClient } from '../utils/client';
import { writeCommandOutput } from './runtime/command-context';
import { withCommandHandler } from './runtime/with-command-handler';

function formatSearchReadable(result: any): string {
  const lines: string[] = [];

  if (result.answer) {
    lines.push(`Answer: ${result.answer}`);
    lines.push('');
  }

  if (Array.isArray(result.results)) {
    for (const item of result.results) {
      lines.push(item.title || 'Untitled');
      lines.push(`  URL: ${item.url}`);
      if (item.content) lines.push(`  ${item.content}`);
      if (typeof item.score === 'number') lines.push(`  Score: ${item.score}`);
      if (item.publishedDate) lines.push(`  Published: ${item.publishedDate}`);
      lines.push('');
    }
  }

  if (Array.isArray(result.images) && result.images.length > 0) {
    lines.push('Images:');
    for (const image of result.images) {
      if (typeof image === 'string') {
        lines.push(`  - ${image}`);
      } else {
        lines.push(`  - ${image.url}`);
      }
    }
    lines.push('');
  }

  return lines.join('\n').trim();
}

export async function executeSearch(options: SearchOptions): Promise<any> {
  const client = getClient({ apiKey: options.apiKey, apiUrl: options.apiUrl });

  return client.search(options.query, {
    maxResults: options.maxResults,
    searchDepth: options.searchDepth,
    topic: options.topic,
    timeRange: options.timeRange,
    startDate: options.startDate,
    endDate: options.endDate,
    includeDomains: options.includeDomains,
    excludeDomains: options.excludeDomains,
    country: options.country,
    includeRawContent: options.includeRawContent,
    includeImages: options.includeImages,
    includeImageDescriptions: options.includeImageDescriptions,
    includeAnswer: options.includeAnswer,
    includeFavicon: options.includeFavicon,
    includeUsage: options.includeUsage,
  } as any);
}

export async function handleSearchCommand(
  options: SearchOptions
): Promise<void> {
  await withCommandHandler(options, async (context) => {
    const result = await context.client.search(options.query, {
      maxResults: options.maxResults,
      searchDepth: options.searchDepth,
      topic: options.topic,
      timeRange: options.timeRange,
      startDate: options.startDate,
      endDate: options.endDate,
      includeDomains: options.includeDomains,
      excludeDomains: options.excludeDomains,
      country: options.country,
      includeRawContent: options.includeRawContent,
      includeImages: options.includeImages,
      includeImageDescriptions: options.includeImageDescriptions,
      includeAnswer: options.includeAnswer,
      includeFavicon: options.includeFavicon,
      includeUsage: options.includeUsage,
    } as any);

    writeCommandOutput(context, result, formatSearchReadable);
  });
}

import type { CrawlOptions } from '../types/crawl';
import { getClient } from '../utils/client';
import { writeObjectOutput } from '../utils/output';

function formatCrawlReadable(result: any): string {
  const lines: string[] = [];

  lines.push(`Base URL: ${result.baseUrl || 'n/a'}`);
  lines.push(
    `Results: ${Array.isArray(result.results) ? result.results.length : 0}`
  );
  lines.push('');

  for (const item of result.results ?? []) {
    lines.push(item.url);
  }

  return lines.join('\n').trim();
}

export async function executeCrawl(options: CrawlOptions): Promise<any> {
  const client = getClient({ apiKey: options.apiKey, apiUrl: options.apiUrl });

  return client.crawl(options.url, {
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
  } as any);
}

export async function handleCrawlCommand(options: CrawlOptions): Promise<void> {
  try {
    const result = await executeCrawl(options);

    if (options.json || options.output?.toLowerCase().endsWith('.json')) {
      writeObjectOutput(result, options);
      return;
    }

    writeObjectOutput(formatCrawlReadable(result), options);
  } catch (error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    process.exit(1);
  }
}

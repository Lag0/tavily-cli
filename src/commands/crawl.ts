import type { CrawlOptions } from '../types/crawl';
import { buildCrawlRequest } from '../types/tavily-request-adapters';
import { getClient } from '../utils/client';
import { writeCommandOutput } from './runtime/command-context';
import { withCommandHandler } from './runtime/with-command-handler';

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
  const request = buildCrawlRequest(options);

  return client.crawl(request.url, request.request);
}

export async function handleCrawlCommand(options: CrawlOptions): Promise<void> {
  await withCommandHandler(options, async (context) => {
    const request = buildCrawlRequest(options);
    const result = await context.client.crawl(request.url, request.request);

    writeCommandOutput(context, result, formatCrawlReadable);
  });
}

import type { ExtractOptions } from '../types/extract';
import { getClient } from '../utils/client';
import { writeCommandOutput } from './runtime/command-context';
import { withCommandHandler } from './runtime/with-command-handler';

function formatExtractReadable(result: any): string {
  const lines: string[] = [];

  for (const item of result.results ?? []) {
    lines.push(item.title || item.url || 'Result');
    lines.push(`  URL: ${item.url}`);
    if (item.rawContent) {
      lines.push('');
      lines.push(item.rawContent);
      lines.push('');
    }
  }

  if (Array.isArray(result.failedResults) && result.failedResults.length > 0) {
    lines.push('Failed URLs:');
    for (const failure of result.failedResults) {
      lines.push(`  - ${failure.url}: ${failure.error}`);
    }
  }

  return lines.join('\n').trim();
}

export async function executeExtract(options: ExtractOptions): Promise<any> {
  const client = getClient({ apiKey: options.apiKey, apiUrl: options.apiUrl });

  return client.extract(options.urls, {
    extractDepth: options.extractDepth,
    format: options.format,
    includeImages: options.includeImages,
    includeFavicon: options.includeFavicon,
    includeUsage: options.includeUsage,
    timeout: options.timeout,
    query: options.query,
    chunksPerSource: options.chunksPerSource,
  } as any);
}

export async function handleExtractCommand(
  options: ExtractOptions
): Promise<void> {
  await withCommandHandler(options, async (context) => {
    const result = await context.client.extract(options.urls, {
      extractDepth: options.extractDepth,
      format: options.format,
      includeImages: options.includeImages,
      includeFavicon: options.includeFavicon,
      includeUsage: options.includeUsage,
      timeout: options.timeout,
      query: options.query,
      chunksPerSource: options.chunksPerSource,
    } as any);

    writeCommandOutput(context, result, formatExtractReadable);
  });
}

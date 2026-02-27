import type { ExtractOptions } from '../types/extract';
import { buildExtractRequest } from '../types/tavily-request-adapters';
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
  const request = buildExtractRequest(options);

  return client.extract(request.urls, request.request);
}

export async function handleExtractCommand(
  options: ExtractOptions
): Promise<void> {
  await withCommandHandler(options, async (context) => {
    const request = buildExtractRequest(options);
    const result = await context.client.extract(request.urls, request.request);

    writeCommandOutput(context, result, formatExtractReadable);
  });
}

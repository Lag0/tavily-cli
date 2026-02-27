import type { SearchOptions } from '../types/search';
import { buildSearchRequest } from '../types/tavily-request-adapters';
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
  const request = buildSearchRequest(options);

  return client.search(request.query, request.request);
}

export async function handleSearchCommand(
  options: SearchOptions
): Promise<void> {
  await withCommandHandler(options, async (context) => {
    const request = buildSearchRequest(options);
    const result = await context.client.search(request.query, request.request);

    writeCommandOutput(context, result, formatSearchReadable);
  });
}

import type { MapOptions } from '../types/map';
import { getClient } from '../utils/client';
import { writeCommandOutput } from './runtime/command-context';
import { withCommandHandler } from './runtime/with-command-handler';

function formatMapReadable(result: any): string {
  const lines: string[] = [];

  lines.push(`Base URL: ${result.baseUrl || 'n/a'}`);
  lines.push(
    `URLs: ${Array.isArray(result.results) ? result.results.length : 0}`
  );
  lines.push('');

  for (const item of result.results ?? []) {
    lines.push(String(item));
  }

  return lines.join('\n').trim();
}

export async function executeMap(options: MapOptions): Promise<any> {
  const client = getClient({ apiKey: options.apiKey, apiUrl: options.apiUrl });

  return client.map(options.url, {
    maxDepth: options.maxDepth,
    maxBreadth: options.maxBreadth,
    limit: options.limit,
    selectPaths: options.selectPaths,
    selectDomains: options.selectDomains,
    excludePaths: options.excludePaths,
    excludeDomains: options.excludeDomains,
    allowExternal: options.allowExternal,
    instructions: options.instructions,
    timeout: options.timeout,
    includeUsage: options.includeUsage,
  } as any);
}

export async function handleMapCommand(options: MapOptions): Promise<void> {
  await withCommandHandler(options, async (context) => {
    const result = await context.client.map(options.url, {
      maxDepth: options.maxDepth,
      maxBreadth: options.maxBreadth,
      limit: options.limit,
      selectPaths: options.selectPaths,
      selectDomains: options.selectDomains,
      excludePaths: options.excludePaths,
      excludeDomains: options.excludeDomains,
      allowExternal: options.allowExternal,
      instructions: options.instructions,
      timeout: options.timeout,
      includeUsage: options.includeUsage,
    } as any);

    writeCommandOutput(context, result, formatMapReadable);
  });
}

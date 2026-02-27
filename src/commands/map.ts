import type { MapOptions } from '../types/map';
import { buildMapRequest } from '../types/tavily-request-adapters';
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
  const request = buildMapRequest(options);

  return client.map(request.url, request.request);
}

export async function handleMapCommand(options: MapOptions): Promise<void> {
  await withCommandHandler(options, async (context) => {
    const request = buildMapRequest(options);
    const result = await context.client.map(request.url, request.request);

    writeCommandOutput(context, result, formatMapReadable);
  });
}

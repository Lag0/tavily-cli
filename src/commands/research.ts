import type { ResearchOptions, ResearchStatusOptions } from '../types/research';
import { getClient } from '../utils/client';
import { writeObjectOutput } from '../utils/output';
import { writeCommandOutput } from './runtime/command-context';
import { withCommandHandler } from './runtime/with-command-handler';

function formatResearchReadable(result: any): string {
  const lines: string[] = [];

  lines.push(`Request ID: ${result.requestId || 'n/a'}`);
  if (result.status) lines.push(`Status: ${result.status}`);
  if (result.createdAt) lines.push(`Created At: ${result.createdAt}`);
  if (result.model) lines.push(`Model: ${result.model}`);
  if (result.responseTime !== undefined) {
    lines.push(`Response Time: ${result.responseTime}`);
  }

  if (result.content) {
    lines.push('');
    lines.push(result.content);
  }

  return lines.join('\n').trim();
}

export async function executeResearch(options: ResearchOptions): Promise<any> {
  const client = getClient({ apiKey: options.apiKey, apiUrl: options.apiUrl });

  return client.research(options.input, {
    model: options.model,
    citationFormat: options.citationFormat,
    timeout: options.timeout,
    stream: options.stream,
    outputSchema: options.outputSchema,
  } as any);
}

export async function executeResearchStatus(
  options: ResearchStatusOptions
): Promise<any> {
  const client = getClient({ apiKey: options.apiKey, apiUrl: options.apiUrl });
  return client.getResearch(options.requestId);
}

export async function handleResearchCommand(
  options: ResearchOptions
): Promise<void> {
  await withCommandHandler(options, async (context) => {
    const result = await context.client.research(options.input, {
      model: options.model,
      citationFormat: options.citationFormat,
      timeout: options.timeout,
      stream: options.stream,
      outputSchema: options.outputSchema,
    } as any);

    if (options.stream) {
      const chunks: string[] = [];
      for await (const chunk of result as AsyncGenerator<Buffer>) {
        chunks.push(chunk.toString('utf-8'));
      }
      writeObjectOutput(chunks.join(''), options);
      return;
    }

    writeCommandOutput(context, result, formatResearchReadable);
  });
}

export async function handleResearchStatusCommand(
  options: ResearchStatusOptions
): Promise<void> {
  await withCommandHandler(options, async (context) => {
    const result = await context.client.getResearch(options.requestId);
    writeCommandOutput(context, result, formatResearchReadable);
  });
}

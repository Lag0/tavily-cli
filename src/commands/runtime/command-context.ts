import { getClient } from '../../utils/client';
import { writeObjectOutput } from '../../utils/output';

export interface CommandRuntimeOptions {
  apiKey?: string;
  apiUrl?: string;
  output?: string;
  json?: boolean;
  pretty?: boolean;
}

export interface CommandContext<TOptions extends CommandRuntimeOptions> {
  client: ReturnType<typeof getClient>;
  options: TOptions;
  jsonOutput: boolean;
}

export function createCommandContext<TOptions extends CommandRuntimeOptions>(
  options: TOptions
): CommandContext<TOptions> {
  return {
    client: getClient({ apiKey: options.apiKey, apiUrl: options.apiUrl }),
    options,
    jsonOutput:
      options.json === true ||
      options.output?.toLowerCase().endsWith('.json') === true,
  };
}

export function writeCommandOutput<
  TOptions extends CommandRuntimeOptions,
  TResult,
>(
  context: CommandContext<TOptions>,
  result: TResult,
  formatReadable: (result: TResult) => string
): void {
  if (context.jsonOutput) {
    writeObjectOutput(result, context.options);
    return;
  }

  writeObjectOutput(formatReadable(result), context.options);
}

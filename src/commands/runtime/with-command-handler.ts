import {
  createCommandContext,
  type CommandContext,
  type CommandRuntimeOptions,
} from './command-context';

export class CommandExecutionError extends Error {
  readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'CommandExecutionError';
    this.cause = cause;
  }
}

function normalizeError(error: unknown): CommandExecutionError {
  if (error instanceof CommandExecutionError) {
    return error;
  }

  if (error instanceof Error) {
    return new CommandExecutionError(error.message, error);
  }

  return new CommandExecutionError('Unknown error', error);
}

export async function withCommandHandler<TOptions extends CommandRuntimeOptions>(
  options: TOptions,
  run: (context: CommandContext<TOptions>) => Promise<void>
): Promise<void> {
  const context = createCommandContext(options);

  try {
    await run(context);
  } catch (error) {
    throw normalizeError(error);
  }
}

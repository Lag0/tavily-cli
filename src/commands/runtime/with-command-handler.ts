import {
  createCommandContext,
  type CommandContext,
  type CommandRuntimeOptions,
} from './command-context';
import {
  CommandRuntimeError,
  toCommandRuntimeError,
} from './command-error';

function normalizeError(error: unknown): CommandRuntimeError {
  return toCommandRuntimeError(error, {
    code: 'COMMAND_EXECUTION_FAILED',
    message: 'Unknown error',
    exitCode: 1,
  });
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

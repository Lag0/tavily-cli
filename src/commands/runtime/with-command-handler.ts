import {
  createCommandContext,
  type CommandContext,
  type CommandRuntimeOptions,
} from './command-context';
import { classifyCommandError } from './classify-command-error';

export async function withCommandHandler<TOptions extends CommandRuntimeOptions>(
  options: TOptions,
  run: (context: CommandContext<TOptions>) => Promise<void>
): Promise<void> {
  const context = createCommandContext(options);

  try {
    await run(context);
  } catch (error) {
    throw classifyCommandError(error);
  }
}

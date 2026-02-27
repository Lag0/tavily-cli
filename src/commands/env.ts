import * as fs from 'fs';
import { getApiKey } from '../utils/config';
import { CommandRuntimeError } from './runtime/command-error';

export interface EnvPullOptions {
  file?: string;
  overwrite?: boolean;
}

export async function handleEnvPullCommand(
  options: EnvPullOptions
): Promise<void> {
  try {
    const target = options.file || '.env';
    const key = getApiKey();

    if (!key) {
      throw new CommandRuntimeError({
        code: 'AUTH_REQUIRED',
        message: 'No API key found. Run "tavily login" first.',
      });
    }

    const line = `TAVILY_API_KEY=${key}`;
    let content = '';

    if (fs.existsSync(target)) {
      content = fs.readFileSync(target, 'utf-8');

      if (/^TAVILY_API_KEY=/m.test(content)) {
        if (!options.overwrite) {
          throw new CommandRuntimeError({
            code: 'INVALID_INPUT',
            message: `TAVILY_API_KEY already exists in ${target}. Use --overwrite to replace it.`,
          });
        }

        content = content.replace(/^TAVILY_API_KEY=.*$/m, line);
      } else {
        content = `${content.trimEnd()}\n${line}\n`;
      }
    } else {
      content = `${line}\n`;
    }

    fs.writeFileSync(target, content, 'utf-8');
    if (process.platform !== 'win32') {
      fs.chmodSync(target, 0o600);
    }
    console.log(`Updated ${target}`);
  } catch (error: unknown) {
    if (error instanceof CommandRuntimeError) {
      throw error;
    }

    throw new CommandRuntimeError({
      code: 'COMMAND_FAILED',
      message: `Failed to update env file: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
      cause: error,
    });
  }
}

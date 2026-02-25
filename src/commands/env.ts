import * as fs from 'fs';
import { getApiKey } from '../utils/config';

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
      console.error('No API key found. Run "tavily login" first.');
      process.exit(1);
    }

    const line = `TAVILY_API_KEY=${key}`;
    let content = '';

    if (fs.existsSync(target)) {
      content = fs.readFileSync(target, 'utf-8');

      if (/^TAVILY_API_KEY=/m.test(content)) {
        if (!options.overwrite) {
          console.error(
            `TAVILY_API_KEY already exists in ${target}. Use --overwrite to replace it.`
          );
          process.exit(1);
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
  } catch (error) {
    console.error(
      `Failed to update env file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    process.exit(1);
  }
}

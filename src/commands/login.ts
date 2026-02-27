import { saveCredentials } from '../utils/credentials';
import { updateConfig } from '../utils/config';
import { createInterface } from 'readline/promises';
import { CommandRuntimeError } from './runtime/command-error';

export interface LoginOptions {
  apiKey?: string;
  apiUrl?: string;
}

async function promptApiKey(): Promise<string | undefined> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return undefined;
  }

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const key = (await rl.question('Enter Tavily API key: ')).trim();
    return key || undefined;
  } finally {
    rl.close();
  }
}

export async function handleLoginCommand(options: LoginOptions): Promise<void> {
  const { apiKey, apiUrl } = options;
  let resolvedApiKey = apiKey || process.env.TAVILY_API_KEY;

  if (apiKey) {
    console.error(
      'Warning: Using --api-key may expose secrets via shell history/process list. Prefer TAVILY_API_KEY or interactive login.'
    );
  }

  if (!resolvedApiKey) {
    resolvedApiKey = await promptApiKey();
  }

  if (!resolvedApiKey) {
    throw new CommandRuntimeError({
      code: 'AUTH_REQUIRED',
      message:
        'API key is required. Set TAVILY_API_KEY and run "tavily login", or pass --api-key.',
      suggestion:
        'Provide --api-key, set TAVILY_API_KEY, or run tavily login interactively.',
    });
  }

  saveCredentials({ apiKey: resolvedApiKey, apiUrl });
  updateConfig({ apiKey: resolvedApiKey, apiUrl });

  console.log('Authenticated and credentials saved.');
}

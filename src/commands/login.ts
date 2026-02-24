import { saveCredentials } from '../utils/credentials';
import { updateConfig } from '../utils/config';

export interface LoginOptions {
  apiKey?: string;
  apiUrl?: string;
}

export async function handleLoginCommand(options: LoginOptions): Promise<void> {
  if (!options.apiKey) {
    console.error('Error: --api-key is required in v1.');
    process.exit(1);
  }

  saveCredentials({ apiKey: options.apiKey, apiUrl: options.apiUrl });
  updateConfig({ apiKey: options.apiKey, apiUrl: options.apiUrl });

  console.log('Authenticated and credentials saved.');
}

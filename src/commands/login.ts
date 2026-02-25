import { saveCredentials } from '../utils/credentials';
import { updateConfig } from '../utils/config';

export interface LoginOptions {
  apiKey?: string;
  apiUrl?: string;
}

export async function handleLoginCommand(options: LoginOptions): Promise<void> {
  const { apiKey, apiUrl } = options;

  if (!apiKey) {
    console.error('Error: --api-key is required in v1.');
    process.exit(1);
  }

  saveCredentials({ apiKey, apiUrl });
  updateConfig({ apiKey, apiUrl });

  console.log('Authenticated and credentials saved.');
}

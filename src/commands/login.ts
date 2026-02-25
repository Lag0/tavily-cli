import { saveCredentials } from '../utils/credentials';
import { getApiKey, getApiUrl, updateConfig } from '../utils/config';

export interface LoginOptions {
  apiKey?: string;
  apiUrl?: string;
}

export async function handleLoginCommand(options: LoginOptions): Promise<void> {
  const apiKey = getApiKey(options.apiKey);
  const apiUrl = getApiUrl(options.apiUrl);

  if (!apiKey) {
    console.error('Error: --api-key is required in v1.');
    process.exit(1);
  }

  saveCredentials({ apiKey, apiUrl });
  updateConfig({ apiKey, apiUrl });

  console.log('Authenticated and credentials saved.');
}

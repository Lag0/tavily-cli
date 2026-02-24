import { tavily } from '@tavily/core';
import { getApiKey, getApiUrl, updateConfig, validateConfig } from './config';

interface ClientOptions {
  apiKey?: string;
  apiUrl?: string;
}

let clientInstance: ReturnType<typeof tavily> | null = null;

export function getClient(
  options: ClientOptions = {}
): ReturnType<typeof tavily> {
  if (options.apiKey !== undefined || options.apiUrl !== undefined) {
    updateConfig({ apiKey: options.apiKey, apiUrl: options.apiUrl });
  }

  const apiKey = getApiKey(options.apiKey);
  const apiUrl = getApiUrl(options.apiUrl);
  validateConfig(apiKey);

  if (!clientInstance || options.apiKey || options.apiUrl) {
    clientInstance = tavily({
      apiKey,
      apiBaseURL: apiUrl,
      clientSource: 'tavily-cli',
    });
  }

  return clientInstance;
}

export function resetClient(): void {
  clientInstance = null;
}

import { loadCredentials } from './credentials';

const DEFAULT_API_URL = 'https://api.tavily.com';

export interface GlobalConfig {
  apiKey?: string;
  apiUrl?: string;
}

let globalConfig: GlobalConfig = {
  apiUrl: DEFAULT_API_URL,
};

export function initializeConfig(config: Partial<GlobalConfig> = {}): void {
  const stored = loadCredentials();

  globalConfig = {
    apiKey: config.apiKey || process.env.TAVILY_API_KEY || stored?.apiKey,
    apiUrl:
      config.apiUrl ||
      process.env.TAVILY_API_URL ||
      stored?.apiUrl ||
      DEFAULT_API_URL,
  };
}

export function getConfig(): GlobalConfig {
  return { ...globalConfig };
}

export function updateConfig(config: Partial<GlobalConfig>): void {
  globalConfig = { ...globalConfig, ...config };
}

export function getApiKey(provided?: string): string | undefined {
  if (provided) return provided;
  if (globalConfig.apiKey) return globalConfig.apiKey;
  if (process.env.TAVILY_API_KEY) return process.env.TAVILY_API_KEY;

  return loadCredentials()?.apiKey;
}

export function getApiUrl(provided?: string): string {
  return (
    provided ||
    globalConfig.apiUrl ||
    process.env.TAVILY_API_URL ||
    loadCredentials()?.apiUrl ||
    DEFAULT_API_URL
  );
}

export function validateConfig(apiKey?: string): void {
  const key = getApiKey(apiKey);
  if (!key) {
    throw new Error(
      'API key is required. Set TAVILY_API_KEY, pass --api-key, or run "tavily login --api-key <key>".'
    );
  }
}

export function resetConfig(): void {
  globalConfig = { apiUrl: DEFAULT_API_URL };
}

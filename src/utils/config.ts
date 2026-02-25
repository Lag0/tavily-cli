import { loadCredentials } from './credentials';

const DEFAULT_API_URL = 'https://api.tavily.com';
const ALLOW_UNTRUSTED_API_URL_ENV = 'TAVILY_ALLOW_UNTRUSTED_API_URL';

export interface GlobalConfig {
  apiKey?: string;
  apiUrl?: string;
}

let globalConfig: GlobalConfig = {
  apiUrl: DEFAULT_API_URL,
};

function isLocalHost(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '[::1]'
  );
}

function isTrustedApiHost(hostname: string): boolean {
  return hostname === 'api.tavily.com' || hostname.endsWith('.tavily.com');
}

function normalizeApiUrl(raw?: string): string {
  const candidate = raw || DEFAULT_API_URL;

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error(
      `Invalid API URL: ${candidate}. Use a valid https URL like ${DEFAULT_API_URL}.`
    );
  }

  const hostname = parsed.hostname.toLowerCase();
  const localhost = isLocalHost(hostname);
  const trustedHost = isTrustedApiHost(hostname) || localhost;
  const allowUntrusted = process.env[ALLOW_UNTRUSTED_API_URL_ENV] === '1';

  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && localhost)) {
    throw new Error(
      `Invalid API URL protocol: ${parsed.protocol}. Use https (or http only for localhost).`
    );
  }

  if (!trustedHost && !allowUntrusted) {
    throw new Error(
      `Refusing untrusted API URL host "${hostname}". Set ${ALLOW_UNTRUSTED_API_URL_ENV}=1 to override.`
    );
  }

  return parsed.toString().replace(/\/$/, '');
}

export function initializeConfig(config: Partial<GlobalConfig> = {}): void {
  const stored = loadCredentials();
  const rawApiUrl =
    config.apiUrl ||
    process.env.TAVILY_API_URL ||
    stored?.apiUrl ||
    DEFAULT_API_URL;

  globalConfig = {
    apiKey: config.apiKey || process.env.TAVILY_API_KEY || stored?.apiKey,
    apiUrl: normalizeApiUrl(rawApiUrl),
  };
}

export function getConfig(): GlobalConfig {
  return { ...globalConfig };
}

export function updateConfig(config: Partial<GlobalConfig>): void {
  const nextApiUrl =
    config.apiUrl !== undefined ? normalizeApiUrl(config.apiUrl) : globalConfig.apiUrl;
  globalConfig = { ...globalConfig, ...config, apiUrl: nextApiUrl };
}

export function getApiKey(provided?: string): string | undefined {
  if (provided) return provided;
  if (globalConfig.apiKey) return globalConfig.apiKey;
  if (process.env.TAVILY_API_KEY) return process.env.TAVILY_API_KEY;

  return loadCredentials()?.apiKey;
}

export function getApiUrl(provided?: string): string {
  return normalizeApiUrl(
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
      'API key is required. Set TAVILY_API_KEY, run "tavily login", or pass --api-key.'
    );
  }
}

export function resetConfig(): void {
  globalConfig = { apiUrl: DEFAULT_API_URL };
}

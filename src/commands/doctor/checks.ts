import { constants as fsConstants, existsSync, readFileSync } from 'fs';
import { accessSync } from 'fs';
import * as path from 'path';
import { getConfigDirectoryPath, loadCredentials } from '../../utils/credentials';

const DEFAULT_API_URL = 'https://api.tavily.com';
const ALLOW_UNTRUSTED_API_URL_ENV = 'TAVILY_ALLOW_UNTRUSTED_API_URL';

export type DoctorCheckCategory = 'auth' | 'api-url' | 'dependency' | 'setup';
export type DoctorCheckStatus = 'pass' | 'warn' | 'fail';

export type DoctorCheckId =
  | 'auth.api_key_resolution'
  | 'auth.credentials_file'
  | 'api_url.trust_posture'
  | 'deps.node'
  | 'deps.npm'
  | 'deps.npx'
  | 'setup.skills_readiness'
  | 'setup.mcp_readiness';

export interface DoctorCheckResult {
  id: DoctorCheckId;
  category: DoctorCheckCategory;
  status: DoctorCheckStatus;
  required: boolean;
  message: string;
  remediation?: string;
  details?: Record<string, unknown>;
}

export interface DoctorCheckContext {
  apiKey?: string;
  apiUrl?: string;
}

export interface DoctorCheck {
  id: DoctorCheckId;
  category: DoctorCheckCategory;
  required: boolean;
  run: (
    context: DoctorCheckContext
  ) => Promise<Omit<DoctorCheckResult, 'id'>> | Omit<DoctorCheckResult, 'id'>;
}

interface ApiUrlAssessment {
  source: 'flag' | 'env' | 'stored' | 'default';
  value: string;
  allowUntrustedOverride: boolean;
  parseError?: string;
  protocol?: string;
  hostname?: string;
  trustedHost?: boolean;
  secureProtocol?: boolean;
}

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

function getCredentialsPath(): string {
  return path.join(getConfigDirectoryPath(), 'credentials.json');
}

function getApiKeyResolution(context: DoctorCheckContext): {
  key?: string;
  source: 'flag' | 'env' | 'stored' | 'missing';
} {
  if (context.apiKey) {
    return { key: context.apiKey, source: 'flag' };
  }

  if (process.env.TAVILY_API_KEY) {
    return { key: process.env.TAVILY_API_KEY, source: 'env' };
  }

  const stored = loadCredentials()?.apiKey;
  if (stored) {
    return { key: stored, source: 'stored' };
  }

  return { source: 'missing' };
}

function assessApiUrlTrust(context: DoctorCheckContext): ApiUrlAssessment {
  const stored = loadCredentials()?.apiUrl;
  const envValue = process.env.TAVILY_API_URL;
  const allowUntrustedOverride =
    process.env[ALLOW_UNTRUSTED_API_URL_ENV] === '1';

  const value = context.apiUrl || envValue || stored || DEFAULT_API_URL;
  const source: ApiUrlAssessment['source'] = context.apiUrl
    ? 'flag'
    : envValue
      ? 'env'
      : stored
        ? 'stored'
        : 'default';

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return {
      source,
      value,
      allowUntrustedOverride,
      parseError: `Invalid URL: ${value}`,
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const localHost = isLocalHost(hostname);
  const secureProtocol =
    parsed.protocol === 'https:' || (parsed.protocol === 'http:' && localHost);
  const trustedHost = isTrustedApiHost(hostname) || localHost;

  return {
    source,
    value: parsed.toString().replace(/\/$/, ''),
    allowUntrustedOverride,
    protocol: parsed.protocol,
    hostname,
    secureProtocol,
    trustedHost,
  };
}

function buildApiKeyCheck(context: DoctorCheckContext): DoctorCheckResult {
  const resolution = getApiKeyResolution(context);

  if (resolution.key) {
    return {
      id: 'auth.api_key_resolution',
      category: 'auth',
      required: true,
      status: 'pass',
      message: `API key resolved from ${resolution.source}.`,
      details: {
        source: resolution.source,
      },
    };
  }

  return {
    id: 'auth.api_key_resolution',
    category: 'auth',
    required: true,
    status: 'fail',
    message: 'No Tavily API key was found in flags, environment, or stored credentials.',
    remediation:
      'Run "tavily login", set TAVILY_API_KEY, or pass --api-key for the current invocation.',
    details: {
      source: 'missing',
    },
  };
}

function buildCredentialsCheck(): DoctorCheckResult {
  const credentialsPath = getCredentialsPath();
  if (!existsSync(credentialsPath)) {
    return {
      id: 'auth.credentials_file',
      category: 'auth',
      required: true,
      status: 'warn',
      message: `Credentials file not found at ${credentialsPath}.`,
      remediation:
        'Run "tavily login" to create persistent credentials if you do not rely exclusively on environment variables.',
      details: {
        path: credentialsPath,
        exists: false,
      },
    };
  }

  try {
    accessSync(credentialsPath, fsConstants.R_OK);
  } catch {
    return {
      id: 'auth.credentials_file',
      category: 'auth',
      required: true,
      status: 'fail',
      message: `Credentials file is not readable at ${credentialsPath}.`,
      remediation:
        'Fix file permissions (read access) and rerun doctor, or run "tavily logout" followed by "tavily login".',
      details: {
        path: credentialsPath,
        exists: true,
        readable: false,
      },
    };
  }

  try {
    const parsed = JSON.parse(
      readFileSync(credentialsPath, 'utf-8')
    ) as Record<string, unknown>;

    return {
      id: 'auth.credentials_file',
      category: 'auth',
      required: true,
      status: 'pass',
      message: `Credentials file is readable at ${credentialsPath}.`,
      details: {
        path: credentialsPath,
        exists: true,
        readable: true,
        hasApiKey: typeof parsed.apiKey === 'string' && parsed.apiKey.length > 0,
        hasApiUrl: typeof parsed.apiUrl === 'string' && parsed.apiUrl.length > 0,
      },
    };
  } catch {
    return {
      id: 'auth.credentials_file',
      category: 'auth',
      required: true,
      status: 'fail',
      message: `Credentials file contains invalid JSON at ${credentialsPath}.`,
      remediation:
        'Run "tavily logout" and "tavily login" to rebuild credentials, or fix the JSON file manually.',
      details: {
        path: credentialsPath,
        exists: true,
        readable: true,
        parseable: false,
      },
    };
  }
}

function buildApiUrlTrustCheck(context: DoctorCheckContext): DoctorCheckResult {
  const assessment = assessApiUrlTrust(context);

  if (assessment.parseError) {
    return {
      id: 'api_url.trust_posture',
      category: 'api-url',
      required: true,
      status: 'fail',
      message: assessment.parseError,
      remediation: `Set TAVILY_API_URL to a valid https URL (or http://localhost for local development).`,
      details: assessment,
    };
  }

  if (!assessment.secureProtocol) {
    return {
      id: 'api_url.trust_posture',
      category: 'api-url',
      required: true,
      status: 'fail',
      message: `API URL uses unsupported protocol ${assessment.protocol}.`,
      remediation:
        'Use https for remote hosts, or http only for localhost during local development.',
      details: assessment,
    };
  }

  if (!assessment.trustedHost && assessment.allowUntrustedOverride) {
    return {
      id: 'api_url.trust_posture',
      category: 'api-url',
      required: true,
      status: 'warn',
      message: `Using untrusted API host ${assessment.hostname} because ${ALLOW_UNTRUSTED_API_URL_ENV}=1 is set.`,
      remediation:
        'Unset TAVILY_ALLOW_UNTRUSTED_API_URL or switch TAVILY_API_URL back to a trusted Tavily domain for production usage.',
      details: assessment,
    };
  }

  if (!assessment.trustedHost) {
    return {
      id: 'api_url.trust_posture',
      category: 'api-url',
      required: true,
      status: 'fail',
      message: `Untrusted API host ${assessment.hostname} detected.`,
      remediation: `Use a trusted Tavily host or set ${ALLOW_UNTRUSTED_API_URL_ENV}=1 only for controlled local/testing environments.`,
      details: assessment,
    };
  }

  return {
    id: 'api_url.trust_posture',
    category: 'api-url',
    required: true,
    status: 'pass',
    message: `API URL is trusted (${assessment.hostname}) and uses a secure protocol.`,
    details: assessment,
  };
}

const defaultChecks: DoctorCheck[] = [
  {
    id: 'auth.api_key_resolution',
    category: 'auth',
    required: true,
    run: (context) => {
      const result = buildApiKeyCheck(context);
      return {
        category: result.category,
        required: result.required,
        status: result.status,
        message: result.message,
        remediation: result.remediation,
        details: result.details,
      };
    },
  },
  {
    id: 'auth.credentials_file',
    category: 'auth',
    required: true,
    run: () => {
      const result = buildCredentialsCheck();
      return {
        category: result.category,
        required: result.required,
        status: result.status,
        message: result.message,
        remediation: result.remediation,
        details: result.details,
      };
    },
  },
  {
    id: 'api_url.trust_posture',
    category: 'api-url',
    required: true,
    run: (context) => {
      const result = buildApiUrlTrustCheck(context);
      return {
        category: result.category,
        required: result.required,
        status: result.status,
        message: result.message,
        remediation: result.remediation,
        details: result.details,
      };
    },
  },
];

export async function runDoctorChecks(
  context: DoctorCheckContext = {},
  checks: DoctorCheck[] = defaultChecks
): Promise<DoctorCheckResult[]> {
  const results = await Promise.all(
    checks.map(async (check) => {
      const result = await check.run(context);
      return {
        ...result,
        id: check.id,
      };
    })
  );

  return [...results].sort((a, b) => a.id.localeCompare(b.id));
}

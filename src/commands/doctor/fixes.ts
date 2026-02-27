import { chmodSync, copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import { getConfigDirectoryPath } from '../../utils/credentials';
import type { DoctorCheckContext, DoctorCheckId, DoctorCheckResult } from './checks';

export type DoctorFixStatus = 'applied' | 'skipped' | 'failed';

export interface DoctorFixResult {
  checkId: DoctorCheckId;
  status: DoctorFixStatus;
  message: string;
  reason?: string;
  dryRun: boolean;
  details?: unknown;
}

export interface DoctorFixSummary {
  attempted: number;
  applied: number;
  skipped: number;
  failed: number;
}

export interface DoctorFixReport {
  enabled: true;
  dryRun: boolean;
  selectedChecks?: DoctorCheckId[];
  summary: DoctorFixSummary;
  results: DoctorFixResult[];
}

export interface DoctorFixExecutionOptions {
  checks: DoctorCheckResult[];
  context?: DoctorCheckContext;
  selectedChecks?: DoctorCheckId[];
  dryRun?: boolean;
}

export interface DoctorFixHandlerContext {
  check: DoctorCheckResult;
  context: DoctorCheckContext;
  dryRun: boolean;
}

export type DoctorFixHandler = (
  context: DoctorFixHandlerContext
) => Promise<Omit<DoctorFixResult, 'checkId'>> | Omit<DoctorFixResult, 'checkId'>;

type DoctorFixHandlers = Partial<Record<DoctorCheckId, DoctorFixHandler>>;

const DEFAULT_TRUSTED_API_URL = 'https://api.tavily.com';

interface CredentialsCheckDetails {
  path?: string;
  exists?: boolean;
  readable?: boolean;
  parseable?: boolean;
}

interface ApiUrlTrustDetails {
  source?: 'flag' | 'env' | 'stored' | 'default';
  value?: string;
  parseError?: string;
  protocol?: string;
  hostname?: string;
  trustedHost?: boolean;
  secureProtocol?: boolean;
}

function getCredentialsPath(): string {
  return path.join(getConfigDirectoryPath(), 'credentials.json');
}

function ensureSecurePermissions(filePath: string): void {
  try {
    chmodSync(filePath, 0o600);
  } catch {
    // No-op on platforms that do not support chmod semantics.
  }
}

function asCredentialsCheckDetails(details: unknown): CredentialsCheckDetails {
  if (!details || typeof details !== 'object') return {};
  const record = details as Record<string, unknown>;

  return {
    path: typeof record.path === 'string' ? record.path : undefined,
    exists: typeof record.exists === 'boolean' ? record.exists : undefined,
    readable: typeof record.readable === 'boolean' ? record.readable : undefined,
    parseable: typeof record.parseable === 'boolean' ? record.parseable : undefined,
  };
}

function asApiUrlTrustDetails(details: unknown): ApiUrlTrustDetails {
  if (!details || typeof details !== 'object') return {};
  const record = details as Record<string, unknown>;

  return {
    source:
      record.source === 'flag' ||
      record.source === 'env' ||
      record.source === 'stored' ||
      record.source === 'default'
        ? record.source
        : undefined,
    value: typeof record.value === 'string' ? record.value : undefined,
    parseError: typeof record.parseError === 'string' ? record.parseError : undefined,
    protocol: typeof record.protocol === 'string' ? record.protocol : undefined,
    hostname: typeof record.hostname === 'string' ? record.hostname : undefined,
    trustedHost:
      typeof record.trustedHost === 'boolean' ? record.trustedHost : undefined,
    secureProtocol:
      typeof record.secureProtocol === 'boolean' ? record.secureProtocol : undefined,
  };
}

function fixCredentialsFilePermissions(
  credentialsPath: string,
  dryRun: boolean
): Omit<DoctorFixResult, 'checkId'> {
  if (dryRun) {
    return {
      status: 'skipped',
      message: `Preview: would set secure permissions on ${credentialsPath}.`,
      reason: 'dry_run',
      dryRun,
      details: {
        action: 'chmod_600',
        path: credentialsPath,
      },
    };
  }

  ensureSecurePermissions(credentialsPath);
  return {
    status: 'applied',
    message: `Updated credentials file permissions at ${credentialsPath}.`,
    dryRun,
    details: {
      action: 'chmod_600',
      path: credentialsPath,
    },
  };
}

function recoverMalformedCredentialsFile(
  credentialsPath: string,
  dryRun: boolean
): Omit<DoctorFixResult, 'checkId'> {
  const backupPath = `${credentialsPath}.bak`;
  if (dryRun) {
    return {
      status: 'skipped',
      message: `Preview: would back up malformed credentials to ${backupPath} and reset ${credentialsPath}.`,
      reason: 'dry_run',
      dryRun,
      details: {
        action: 'backup_and_reset',
        path: credentialsPath,
        backupPath,
      },
    };
  }

  copyFileSync(credentialsPath, backupPath);
  writeFileSync(credentialsPath, JSON.stringify({}, null, 2) + '\n', 'utf-8');
  ensureSecurePermissions(credentialsPath);

  return {
    status: 'applied',
    message: `Backed up malformed credentials to ${backupPath} and reset credentials file content.`,
    dryRun,
    details: {
      action: 'backup_and_reset',
      path: credentialsPath,
      backupPath,
    },
  };
}

function repairCredentialsFileFix(
  context: DoctorFixHandlerContext
): Omit<DoctorFixResult, 'checkId'> {
  const details = asCredentialsCheckDetails(context.check.details);
  const credentialsPath = details.path || getCredentialsPath();

  if (!details.exists && !existsSync(credentialsPath)) {
    return {
      status: 'skipped',
      message: 'Credentials file is missing; no safe auto-fix is available.',
      reason: 'missing_credentials_file',
      dryRun: context.dryRun,
    };
  }

  if (details.readable === false) {
    return fixCredentialsFilePermissions(credentialsPath, context.dryRun);
  }

  if (details.parseable === false) {
    return recoverMalformedCredentialsFile(credentialsPath, context.dryRun);
  }

  return {
    status: 'skipped',
    message: 'Credentials file check did not report a fixable failure state.',
    reason: 'non_fixable_state',
    dryRun: context.dryRun,
  };
}

function resetStoredApiUrlFix(
  context: DoctorFixHandlerContext
): Omit<DoctorFixResult, 'checkId'> {
  const details = asApiUrlTrustDetails(context.check.details);
  if (details.source !== 'stored') {
    return {
      status: 'skipped',
      message:
        'API URL fix is only allowed for values loaded from stored credentials.',
      reason: 'unsafe_source',
      dryRun: context.dryRun,
      details: {
        source: details.source ?? 'unknown',
      },
    };
  }

  const credentialsPath = getCredentialsPath();
  if (!existsSync(credentialsPath)) {
    return {
      status: 'failed',
      message: `Stored credentials file was not found at ${credentialsPath}.`,
      reason: 'missing_credentials_file',
      dryRun: context.dryRun,
    };
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(readFileSync(credentialsPath, 'utf-8')) as Record<
      string,
      unknown
    >;
  } catch {
    return {
      status: 'failed',
      message:
        'Cannot safely reset stored API URL because credentials JSON is malformed.',
      reason: 'malformed_credentials_file',
      dryRun: context.dryRun,
    };
  }

  if (context.dryRun) {
    return {
      status: 'skipped',
      message: `Preview: would reset stored API URL in ${credentialsPath} to ${DEFAULT_TRUSTED_API_URL}.`,
      reason: 'dry_run',
      dryRun: context.dryRun,
      details: {
        path: credentialsPath,
        previous: typeof parsed.apiUrl === 'string' ? parsed.apiUrl : undefined,
        next: DEFAULT_TRUSTED_API_URL,
      },
    };
  }

  const previousApiUrl =
    typeof parsed.apiUrl === 'string' ? parsed.apiUrl : undefined;
  parsed.apiUrl = DEFAULT_TRUSTED_API_URL;
  writeFileSync(credentialsPath, JSON.stringify(parsed, null, 2) + '\n', 'utf-8');
  ensureSecurePermissions(credentialsPath);

  return {
    status: 'applied',
    message: `Reset stored API URL to trusted default (${DEFAULT_TRUSTED_API_URL}).`,
    dryRun: context.dryRun,
    details: {
      path: credentialsPath,
      previous: previousApiUrl,
      next: DEFAULT_TRUSTED_API_URL,
    },
  };
}

const defaultFixHandlers: DoctorFixHandlers = {
  'auth.credentials_file': repairCredentialsFileFix,
  'api_url.trust_posture': resetStoredApiUrlFix,
};

function countFixStatus(
  results: DoctorFixResult[],
  status: DoctorFixStatus
): number {
  return results.filter((result) => result.status === status).length;
}

async function executeFixForCheck(
  check: DoctorCheckResult,
  context: DoctorCheckContext,
  dryRun: boolean,
  handlers: DoctorFixHandlers
): Promise<DoctorFixResult> {
  if (check.status !== 'fail') {
    return {
      checkId: check.id,
      status: 'skipped',
      message: 'Fix was not attempted because this check did not fail.',
      reason: `status:${check.status}`,
      dryRun,
    };
  }

  const handler = handlers[check.id];
  if (!handler) {
    return {
      checkId: check.id,
      status: 'skipped',
      message: 'No allowlisted automatic fix is available for this check.',
      reason: 'not_fixable',
      dryRun,
    };
  }

  try {
    const result = await handler({
      check,
      context,
      dryRun,
    });

    return {
      ...result,
      checkId: check.id,
      dryRun,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected fix error.';
    return {
      checkId: check.id,
      status: 'failed',
      message: `Fix action failed: ${message}`,
      reason: 'handler_exception',
      dryRun,
    };
  }
}

export async function runDoctorFixes(
  options: DoctorFixExecutionOptions,
  handlers: DoctorFixHandlers = defaultFixHandlers
): Promise<DoctorFixReport> {
  const dryRun = options.dryRun ?? false;
  const context = options.context ?? {};
  const checksById = new Map(options.checks.map((check) => [check.id, check]));

  const checksToAttempt =
    options.selectedChecks && options.selectedChecks.length > 0
      ? options.selectedChecks
          .map((checkId) => checksById.get(checkId))
          .filter((check): check is DoctorCheckResult => Boolean(check))
      : options.checks.filter((check) => check.status === 'fail');

  const results = await Promise.all(
    checksToAttempt.map((check) => executeFixForCheck(check, context, dryRun, handlers))
  );

  results.sort((left, right) => left.checkId.localeCompare(right.checkId));

  return {
    enabled: true,
    dryRun,
    selectedChecks:
      options.selectedChecks && options.selectedChecks.length > 0
        ? [...options.selectedChecks].sort((left, right) =>
            left.localeCompare(right)
          )
        : undefined,
    summary: {
      attempted: results.length,
      applied: countFixStatus(results, 'applied'),
      skipped: countFixStatus(results, 'skipped'),
      failed: countFixStatus(results, 'failed'),
    },
    results,
  };
}

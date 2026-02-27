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

const defaultFixHandlers: DoctorFixHandlers = {};

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

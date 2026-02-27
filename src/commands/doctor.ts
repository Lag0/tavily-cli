import { writeObjectOutput } from '../utils/output';
import { CommandRuntimeError } from './runtime/command-error';
import {
  DOCTOR_CHECK_IDS,
  isDoctorCheckId,
  runDoctorChecks,
  type DoctorCheckContext,
  type DoctorCheckId,
} from './doctor/checks';
import { runDoctorFixes } from './doctor/fixes';
import { buildDoctorReport, renderDoctorTextReport, type DoctorReport } from './doctor/report';

export interface DoctorCommandOptions extends DoctorCheckContext {
  output?: string;
  json?: boolean;
  pretty?: boolean;
  fix?: boolean;
  fixCheck?: string[];
  fixDryRun?: boolean;
}

function shouldOutputJson(options: DoctorCommandOptions): boolean {
  if (options.json) return true;
  return options.output?.toLowerCase().endsWith('.json') ?? false;
}

function shouldRunFixes(options: DoctorCommandOptions): boolean {
  return Boolean(options.fix || options.fixDryRun || options.fixCheck?.length);
}

function resolveFixCheckSelection(options: DoctorCommandOptions): DoctorCheckId[] | undefined {
  if (!options.fixCheck || options.fixCheck.length === 0) return undefined;

  const deduped = [...new Set(options.fixCheck.map((checkId) => checkId.trim()))].filter(
    Boolean
  );
  const invalid = deduped.filter((checkId) => !isDoctorCheckId(checkId));

  if (invalid.length > 0) {
    throw new CommandRuntimeError({
      code: 'INVALID_INPUT',
      message: `Unknown check id for --fix-check: ${invalid.join(', ')}`,
      suggestion: `Use one or more of: ${DOCTOR_CHECK_IDS.join(', ')}`,
    });
  }

  return deduped as DoctorCheckId[];
}

export function getDoctorExitCode(report: DoctorReport): number {
  return report.summary.requiredFailures > 0 ? 1 : 0;
}

export async function buildDoctorCommandReport(
  options: DoctorCommandOptions = {}
): Promise<DoctorReport> {
  const context: DoctorCheckContext = {
    apiKey: options.apiKey,
    apiUrl: options.apiUrl,
  };
  let checks = await runDoctorChecks(context);

  if (shouldRunFixes(options)) {
    await runDoctorFixes({
      checks,
      context,
      selectedChecks: resolveFixCheckSelection(options),
      dryRun: options.fixDryRun,
    });

    if (!options.fixDryRun) {
      checks = await runDoctorChecks(context);
    }
  }

  return buildDoctorReport(checks);
}

export async function handleDoctorCommand(
  options: DoctorCommandOptions = {}
): Promise<void> {
  const report = await buildDoctorCommandReport(options);

  if (shouldOutputJson(options)) {
    writeObjectOutput(report, options);
  } else {
    writeObjectOutput(renderDoctorTextReport(report), options);
  }

  process.exitCode = getDoctorExitCode(report);
}

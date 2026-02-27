import { writeObjectOutput } from '../utils/output';
import { runDoctorChecks, type DoctorCheckContext } from './doctor/checks';
import { buildDoctorReport, renderDoctorTextReport, type DoctorReport } from './doctor/report';

export interface DoctorCommandOptions extends DoctorCheckContext {
  output?: string;
  json?: boolean;
  pretty?: boolean;
}

function shouldOutputJson(options: DoctorCommandOptions): boolean {
  if (options.json) return true;
  return options.output?.toLowerCase().endsWith('.json') ?? false;
}

export function getDoctorExitCode(report: DoctorReport): number {
  return report.summary.requiredFailures > 0 ? 1 : 0;
}

export async function buildDoctorCommandReport(
  options: DoctorCommandOptions = {}
): Promise<DoctorReport> {
  const checks = await runDoctorChecks({
    apiKey: options.apiKey,
    apiUrl: options.apiUrl,
  });

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

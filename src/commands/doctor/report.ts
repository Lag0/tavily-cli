import type { DoctorCheckResult, DoctorCheckStatus } from './checks';
import type { DoctorFixReport, DoctorFixStatus } from './fixes';

export type DoctorOverallStatus = DoctorCheckStatus;

export interface DoctorSummary {
  total: number;
  passed: number;
  warned: number;
  failed: number;
  requiredFailures: number;
}

export interface DoctorMetadata {
  command: 'doctor';
  generatedAt: string;
}

export interface DoctorReport {
  schemaVersion: '1.0';
  metadata: DoctorMetadata;
  overallStatus: DoctorOverallStatus;
  summary: DoctorSummary;
  checks: DoctorCheckResult[];
  fixes?: DoctorFixReport;
}

function getOverallStatus(summary: DoctorSummary): DoctorOverallStatus {
  if (summary.failed > 0) return 'fail';
  if (summary.warned > 0) return 'warn';
  return 'pass';
}

function countStatuses(checks: DoctorCheckResult[], status: DoctorCheckStatus): number {
  return checks.filter((check) => check.status === status).length;
}

export function buildDoctorReport(
  checks: DoctorCheckResult[],
  generatedAt = new Date().toISOString(),
  fixes?: DoctorFixReport
): DoctorReport {
  const summary: DoctorSummary = {
    total: checks.length,
    passed: countStatuses(checks, 'pass'),
    warned: countStatuses(checks, 'warn'),
    failed: countStatuses(checks, 'fail'),
    requiredFailures: checks.filter((check) => check.required && check.status === 'fail').length,
  };

  return {
    schemaVersion: '1.0',
    metadata: {
      command: 'doctor',
      generatedAt,
    },
    overallStatus: getOverallStatus(summary),
    summary,
    checks,
    fixes,
  };
}

function statusLabel(status: DoctorCheckStatus): string {
  if (status === 'pass') return 'PASS';
  if (status === 'warn') return 'WARN';
  return 'FAIL';
}

function fixStatusLabel(status: DoctorFixStatus): string {
  if (status === 'applied') return 'APPLIED';
  if (status === 'skipped') return 'SKIPPED';
  return 'FAILED';
}

export function renderDoctorTextReport(report: DoctorReport): string {
  const lines: string[] = [];

  lines.push('Tavily Doctor');
  lines.push(`Overall status: ${statusLabel(report.overallStatus)}`);
  lines.push(
    `Checks: ${report.summary.total} total (${report.summary.passed} pass, ${report.summary.warned} warn, ${report.summary.failed} fail)`
  );
  lines.push('');

  for (const check of report.checks) {
    lines.push(`[${statusLabel(check.status)}] ${check.id} - ${check.message}`);
    if (check.remediation) {
      lines.push(`  Remediation: ${check.remediation}`);
    }
  }

  if (report.fixes) {
    lines.push('');
    lines.push(`Fix mode: ${report.fixes.dryRun ? 'DRY RUN' : 'ACTIVE'}`);
    lines.push(
      `Fix attempts: ${report.fixes.summary.attempted} total (${report.fixes.summary.applied} applied, ${report.fixes.summary.skipped} skipped, ${report.fixes.summary.failed} failed)`
    );
    if (report.fixes.selectedChecks && report.fixes.selectedChecks.length > 0) {
      lines.push(`Fix selection: ${report.fixes.selectedChecks.join(', ')}`);
    }
    lines.push('');

    for (const fixResult of report.fixes.results) {
      lines.push(
        `[${fixStatusLabel(fixResult.status)}] ${fixResult.checkId} - ${fixResult.message}`
      );
      if (fixResult.reason) {
        lines.push(`  Reason: ${fixResult.reason}`);
      }
    }
  }

  return lines.join('\n');
}

import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { spawnSync } from 'child_process';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runDoctorChecks } from '../../commands/doctor/checks';
import { buildDoctorCommandReport, handleDoctorCommand } from '../../commands/doctor';
import { renderDoctorTextReport } from '../../commands/doctor/report';
import { getConfigDirectoryPath, loadCredentials } from '../../utils/credentials';
import * as outputUtils from '../../utils/output';

vi.mock('child_process', () => ({
  spawnSync: vi.fn(),
}));

vi.mock('../../utils/credentials', () => ({
  loadCredentials: vi.fn(),
  getConfigDirectoryPath: vi.fn(),
}));

function getCheck(
  checks: Awaited<ReturnType<typeof runDoctorChecks>>,
  id: string
) {
  const check = checks.find((item) => item.id === id);
  if (!check) {
    throw new Error(`Expected check ${id} to exist.`);
  }
  return check;
}

describe('doctor checks (auth and trust)', () => {
  let tempDir: string;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'tavily-doctor-test-'));

    vi.mocked(getConfigDirectoryPath).mockReturnValue(tempDir);
    vi.mocked(loadCredentials).mockReturnValue(null);
    vi.mocked(spawnSync).mockImplementation((command) => {
      const rawCommand = String(command);
      const normalized = rawCommand.endsWith('.cmd')
        ? rawCommand.slice(0, -4)
        : rawCommand;

      return {
        status: 0,
        stdout: `${normalized}-v1.0.0\n`,
        stderr: '',
      } as any;
    });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('passes when API key is resolved from environment', async () => {
    process.env.TAVILY_API_KEY = 'tvly-env-key';

    const checks = await runDoctorChecks();
    const apiKeyCheck = getCheck(checks, 'auth.api_key_resolution');

    expect(apiKeyCheck.status).toBe('pass');
    expect(apiKeyCheck.details).toEqual(
      expect.objectContaining({ source: 'env' })
    );
  });

  it('fails when API key is missing across all sources', async () => {
    const checks = await runDoctorChecks();
    const apiKeyCheck = getCheck(checks, 'auth.api_key_resolution');

    expect(apiKeyCheck.status).toBe('fail');
    expect(apiKeyCheck.remediation).toContain('tavily login');
  });

  it('fails when credentials file is malformed JSON', async () => {
    const credentialsPath = path.join(tempDir, 'credentials.json');
    writeFileSync(credentialsPath, '{not-valid-json', 'utf-8');

    const checks = await runDoctorChecks();
    const credentialsCheck = getCheck(checks, 'auth.credentials_file');

    expect(credentialsCheck.status).toBe('fail');
    expect(credentialsCheck.message).toContain('invalid JSON');
  });

  it('warns on untrusted host when override is enabled', async () => {
    process.env.TAVILY_API_URL = 'https://example.invalid';
    process.env.TAVILY_ALLOW_UNTRUSTED_API_URL = '1';

    const checks = await runDoctorChecks();
    const apiUrlCheck = getCheck(checks, 'api_url.trust_posture');

    expect(apiUrlCheck.status).toBe('warn');
    expect(apiUrlCheck.message).toContain('untrusted API host');
  });

  it('passes dependency and setup checks when required executables are available', async () => {
    const checks = await runDoctorChecks();

    expect(getCheck(checks, 'deps.node').status).toBe('pass');
    expect(getCheck(checks, 'deps.npm').status).toBe('pass');
    expect(getCheck(checks, 'deps.npx').status).toBe('pass');
    expect(getCheck(checks, 'setup.skills_readiness').status).toBe('pass');
    expect(getCheck(checks, 'setup.mcp_readiness').status).toBe('pass');
  });

  it('fails dependency and setup checks when npx is unavailable', async () => {
    vi.mocked(spawnSync).mockImplementation((command) => {
      const rawCommand = String(command);
      const normalized = rawCommand.endsWith('.cmd')
        ? rawCommand.slice(0, -4)
        : rawCommand;

      if (normalized === 'npx') {
        return {
          status: null,
          stdout: '',
          stderr: '',
          error: Object.assign(new Error('not found'), { code: 'ENOENT' }),
        } as any;
      }

      return {
        status: 0,
        stdout: `${normalized}-v1.0.0\n`,
        stderr: '',
      } as any;
    });

    const checks = await runDoctorChecks();

    expect(getCheck(checks, 'deps.npx').status).toBe('fail');
    expect(getCheck(checks, 'setup.skills_readiness').status).toBe('fail');
    expect(getCheck(checks, 'setup.mcp_readiness').status).toBe('fail');
  });

  it('renders dependency and setup diagnostics in command-level text output', async () => {
    const report = await buildDoctorCommandReport();
    const output = renderDoctorTextReport(report);

    expect(output).toContain('deps.node');
    expect(output).toContain('setup.skills_readiness');
    expect(output).toContain('setup.mcp_readiness');
  });

  it('emits a stable doctor JSON schema contract', async () => {
    const report = await buildDoctorCommandReport();

    expect(report).toEqual(
      expect.objectContaining({
        schemaVersion: '1.0',
        metadata: expect.objectContaining({
          command: 'doctor',
          generatedAt: expect.any(String),
        }),
        overallStatus: expect.stringMatching(/^(pass|warn|fail)$/),
        summary: expect.objectContaining({
          total: expect.any(Number),
          passed: expect.any(Number),
          warned: expect.any(Number),
          failed: expect.any(Number),
          requiredFailures: expect.any(Number),
        }),
        checks: expect.any(Array),
      })
    );

    for (const check of report.checks) {
      expect(check).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          category: expect.stringMatching(/^(auth|api-url|dependency|setup)$/),
          status: expect.stringMatching(/^(pass|warn|fail)$/),
          required: expect.any(Boolean),
          message: expect.any(String),
        })
      );
    }
  });

  it('sets success exit code when diagnostics do not have required failures', async () => {
    const writeSpy = vi
      .spyOn(outputUtils, 'writeObjectOutput')
      .mockImplementation(() => {});

    process.env.TAVILY_API_KEY = 'tvly-env-key';
    process.exitCode = 99;

    await handleDoctorCommand({ json: true });

    expect(writeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        schemaVersion: '1.0',
      }),
      expect.objectContaining({ json: true })
    );
    expect(process.exitCode).toBe(0);
  });

  it('sets failing exit code when required diagnostics fail', async () => {
    const writeSpy = vi
      .spyOn(outputUtils, 'writeObjectOutput')
      .mockImplementation(() => {});

    delete process.env.TAVILY_API_KEY;
    vi.mocked(loadCredentials).mockReturnValue(null);
    process.exitCode = 0;

    await handleDoctorCommand({ json: true });

    expect(writeSpy).toHaveBeenCalledTimes(1);
    expect(process.exitCode).toBe(1);
  });
});

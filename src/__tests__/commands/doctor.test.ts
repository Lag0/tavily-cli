import {
  chmodSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'fs';
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
    vi.mocked(loadCredentials).mockImplementation(() => {
      const credentialsPath = path.join(tempDir, 'credentials.json');
      if (!existsSync(credentialsPath)) {
        return null;
      }

      try {
        return JSON.parse(readFileSync(credentialsPath, 'utf-8')) as {
          apiKey?: string;
          apiUrl?: string;
        };
      } catch {
        return null;
      }
    });
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

  it('repairs malformed credentials file with backup when --fix is enabled', async () => {
    process.env.TAVILY_API_KEY = 'tvly-env-key';
    const credentialsPath = path.join(tempDir, 'credentials.json');
    writeFileSync(credentialsPath, '{invalid-json', 'utf-8');

    await buildDoctorCommandReport({ fix: true });

    expect(existsSync(`${credentialsPath}.bak`)).toBe(true);
    expect(readFileSync(credentialsPath, 'utf-8')).toContain('{}');

    const checks = await runDoctorChecks();
    expect(getCheck(checks, 'auth.credentials_file').status).toBe('pass');
  });

  it('restores secure credentials file permissions when --fix is enabled', async () => {
    process.env.TAVILY_API_KEY = 'tvly-env-key';
    const credentialsPath = path.join(tempDir, 'credentials.json');
    writeFileSync(credentialsPath, JSON.stringify({ apiKey: 'tvly' }), 'utf-8');
    chmodSync(credentialsPath, 0o000);

    await buildDoctorCommandReport({ fix: true });

    const checks = await runDoctorChecks();
    expect(getCheck(checks, 'auth.credentials_file').status).toBe('pass');
  });

  it('resets untrusted stored API URL to trusted default during --fix', async () => {
    process.env.TAVILY_API_KEY = 'tvly-env-key';
    const credentialsPath = path.join(tempDir, 'credentials.json');
    writeFileSync(
      credentialsPath,
      JSON.stringify(
        {
          apiKey: 'tvly-stored-key',
          apiUrl: 'https://example.invalid',
        },
        null,
        2
      ),
      'utf-8'
    );

    await buildDoctorCommandReport({ fix: true });
    const parsed = JSON.parse(readFileSync(credentialsPath, 'utf-8')) as {
      apiUrl?: string;
    };
    expect(parsed.apiUrl).toBe('https://api.tavily.com');
  });

  it('does not mutate files during fix dry run', async () => {
    process.env.TAVILY_API_KEY = 'tvly-env-key';
    const credentialsPath = path.join(tempDir, 'credentials.json');
    writeFileSync(credentialsPath, '{invalid-json', 'utf-8');

    await buildDoctorCommandReport({
      fix: true,
      fixDryRun: true,
    });

    expect(readFileSync(credentialsPath, 'utf-8')).toBe('{invalid-json');
    expect(existsSync(`${credentialsPath}.bak`)).toBe(false);
  });

  it('does not auto-fix untrusted API URL when source is environment', async () => {
    process.env.TAVILY_API_KEY = 'tvly-env-key';
    process.env.TAVILY_API_URL = 'https://example.invalid';

    const credentialsPath = path.join(tempDir, 'credentials.json');
    writeFileSync(
      credentialsPath,
      JSON.stringify(
        {
          apiKey: 'tvly-stored-key',
          apiUrl: 'https://api.tavily.com',
        },
        null,
        2
      ),
      'utf-8'
    );

    await buildDoctorCommandReport({ fix: true });

    const parsed = JSON.parse(readFileSync(credentialsPath, 'utf-8')) as {
      apiUrl?: string;
    };
    expect(parsed.apiUrl).toBe('https://api.tavily.com');
  });

  it('includes fix outcome details in doctor report contracts', async () => {
    process.env.TAVILY_API_KEY = 'tvly-env-key';
    const credentialsPath = path.join(tempDir, 'credentials.json');
    writeFileSync(credentialsPath, '{invalid-json', 'utf-8');

    const report = await buildDoctorCommandReport({ fix: true });

    expect(report.fixes).toEqual(
      expect.objectContaining({
        enabled: true,
        dryRun: false,
        summary: expect.objectContaining({
          attempted: expect.any(Number),
          applied: expect.any(Number),
          skipped: expect.any(Number),
          failed: expect.any(Number),
        }),
        results: expect.arrayContaining([
          expect.objectContaining({
            checkId: 'auth.credentials_file',
            status: 'applied',
          }),
        ]),
      })
    );
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

  it('sets success exit code when --fix remediates required failures', async () => {
    const writeSpy = vi
      .spyOn(outputUtils, 'writeObjectOutput')
      .mockImplementation(() => {});
    process.env.TAVILY_API_KEY = 'tvly-env-key';

    const credentialsPath = path.join(tempDir, 'credentials.json');
    writeFileSync(credentialsPath, '{invalid-json', 'utf-8');
    process.exitCode = 1;

    await handleDoctorCommand({ json: true, fix: true });

    expect(writeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        fixes: expect.objectContaining({
          enabled: true,
        }),
      }),
      expect.objectContaining({ json: true })
    );
    expect(process.exitCode).toBe(0);
  });

  it('keeps non-zero exit code when required failures remain after --fix', async () => {
    const writeSpy = vi
      .spyOn(outputUtils, 'writeObjectOutput')
      .mockImplementation(() => {});
    delete process.env.TAVILY_API_KEY;
    process.exitCode = 0;

    await handleDoctorCommand({ json: true, fix: true });

    expect(writeSpy).toHaveBeenCalledTimes(1);
    expect(process.exitCode).toBe(1);
  });
});

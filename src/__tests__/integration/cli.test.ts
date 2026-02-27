import { beforeEach, describe, expect, it, vi } from 'vitest';

const handleSearchCommand = vi.fn();
const handleExtractCommand = vi.fn();
const handleCrawlCommand = vi.fn();
const handleMapCommand = vi.fn();
const handleResearchCommand = vi.fn();
const handleResearchStatusCommand = vi.fn();
const handleLoginCommand = vi.fn();
const handleLogoutCommand = vi.fn();
const handleStatusCommand = vi.fn();
const handleInitCommand = vi.fn();
const handleSetupCommand = vi.fn();
const handleEnvPullCommand = vi.fn();
const handleDoctorCommand = vi.fn();

const initializeConfig = vi.fn();
const updateConfig = vi.fn();
const validateConfig = vi.fn();

vi.mock('../../commands/search', () => ({ handleSearchCommand }));
vi.mock('../../commands/extract', () => ({ handleExtractCommand }));
vi.mock('../../commands/crawl', () => ({ handleCrawlCommand }));
vi.mock('../../commands/map', () => ({ handleMapCommand }));
vi.mock('../../commands/research', () => ({
  handleResearchCommand,
  handleResearchStatusCommand,
}));
vi.mock('../../commands/login', () => ({ handleLoginCommand }));
vi.mock('../../commands/logout', () => ({ handleLogoutCommand }));
vi.mock('../../commands/status', () => ({ handleStatusCommand }));
vi.mock('../../commands/init', () => ({ handleInitCommand }));
vi.mock('../../commands/setup', () => ({ handleSetupCommand }));
vi.mock('../../commands/env', () => ({ handleEnvPullCommand }));
vi.mock('../../commands/doctor', () => ({ handleDoctorCommand }));
vi.mock('../../utils/config', () => ({
  initializeConfig,
  updateConfig,
  validateConfig,
}));

async function loadCli() {
  vi.resetModules();
  return import('../../index');
}

describe('CLI integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    process.exitCode = 0;
  });

  it('runs status only through the explicit status command', async () => {
    const { runCli } = await loadCli();
    await runCli(['node', 'tavily', 'status']);

    expect(handleStatusCommand).toHaveBeenCalledTimes(1);
    expect(handleSearchCommand).not.toHaveBeenCalled();
  });

  it('routes bare URLs to extract', async () => {
    const { runCli } = await loadCli();
    await runCli(['node', 'tavily', 'docs.tavily.com']);

    expect(handleExtractCommand).toHaveBeenCalledTimes(1);
    expect(handleExtractCommand).toHaveBeenCalledWith(
      expect.objectContaining({ urls: ['https://docs.tavily.com'] })
    );
  });

  it('resolves login api key from global option parsing', async () => {
    const { runCli } = await loadCli();
    await runCli(['node', 'tavily', '--api-key', 'tvly-key', 'login']);

    expect(handleLoginCommand).toHaveBeenCalledWith(
      expect.objectContaining({ apiKey: 'tvly-key' })
    );
  });

  it('routes env command through tooling registrar', async () => {
    const { runCli } = await loadCli();
    await runCli(['node', 'tavily', 'env', '--file', '.env.local', '--overwrite']);

    expect(handleEnvPullCommand).toHaveBeenCalledTimes(1);
    expect(handleEnvPullCommand).toHaveBeenCalledWith({
      file: '.env.local',
      overwrite: true,
    });
  });

  it('routes doctor command through tooling registrar', async () => {
    const { runCli } = await loadCli();
    await runCli(['node', 'tavily', 'doctor', '--json', '--pretty']);

    expect(handleDoctorCommand).toHaveBeenCalledTimes(1);
    expect(handleDoctorCommand).toHaveBeenCalledWith({
      output: undefined,
      json: true,
      pretty: true,
    });
  });

  it('passes doctor output path options through tooling registrar', async () => {
    const { runCli } = await loadCli();
    await runCli(['node', 'tavily', 'doctor', '--output', '.tavily/doctor.json']);

    expect(handleDoctorCommand).toHaveBeenCalledTimes(1);
    expect(handleDoctorCommand).toHaveBeenCalledWith({
      output: '.tavily/doctor.json',
      json: false,
      pretty: false,
    });
  });

  it('passes doctor fix options through tooling registrar', async () => {
    const { runCli } = await loadCli();
    await runCli([
      'node',
      'tavily',
      'doctor',
      '--fix',
      '--fix-dry-run',
      '--fix-check',
      'auth.credentials_file,api_url.trust_posture',
      '--fix-check',
      'deps.node',
    ]);

    expect(handleDoctorCommand).toHaveBeenCalledTimes(1);
    expect(handleDoctorCommand).toHaveBeenCalledWith({
      output: undefined,
      json: false,
      pretty: false,
      fix: true,
      fixDryRun: true,
      fixCheck: [
        'auth.credentials_file',
        'api_url.trust_posture',
        'deps.node',
      ],
    });
  });

  it('preserves zero exit code when doctor diagnostics pass', async () => {
    handleDoctorCommand.mockImplementationOnce(async () => {
      process.exitCode = 0;
    });

    const { runCli } = await loadCli();
    await runCli(['node', 'tavily', 'doctor']);

    expect(process.exitCode).toBe(0);
  });

  it('propagates non-zero exit code when doctor diagnostics fail', async () => {
    handleDoctorCommand.mockImplementationOnce(async () => {
      process.exitCode = 1;
    });

    const { runCli } = await loadCli();
    await runCli(['node', 'tavily', 'doctor']);

    expect(process.exitCode).toBe(1);
  });

  it('rejects invalid numeric options before executing command', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { runCli } = await loadCli();
    await runCli(['node', 'tavily', 'search', 'hello', '--max-results', 'abc']);

    expect(handleSearchCommand).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error [INVALID_INPUT]:')
    );
  });

  it('rejects invalid positive-number parser options before executing command', async () => {
    const { runCli } = await loadCli();
    await runCli(['node', 'tavily', 'extract', '--url', 'https://example.com', '--timeout', '0']);

    expect(handleExtractCommand).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  it('rejects invalid JSON schema option before research handler executes', async () => {
    const { runCli } = await loadCli();
    await runCli([
      'node',
      'tavily',
      'research',
      'ai trends',
      '--output-schema',
      '{invalid',
    ]);

    expect(handleResearchCommand).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  it('rejects legacy --status on non-status commands', async () => {
    const { runCli } = await loadCli();
    await runCli(['node', 'tavily', 'search', 'hello', '--status']);

    expect(handleStatusCommand).not.toHaveBeenCalled();
    expect(handleSearchCommand).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  it('renders a standardized runtime error shape for command failures', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { runCli } = await loadCli();
    const { CommandRuntimeError } = await import(
      '../../commands/runtime/command-error'
    );
    handleSearchCommand.mockRejectedValueOnce(
      new CommandRuntimeError({
        code: 'COMMAND_FAILED',
        message: 'search failed',
        suggestion: 'retry later',
      })
    );
    await runCli(['node', 'tavily', 'search', 'hello']);

    expect(process.exitCode).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(
      'Error [COMMAND_FAILED]: search failed\nRemediation: retry later'
    );
  });

  it('normalizes unknown thrown errors into deterministic CLI runtime output', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { runCli } = await loadCli();
    handleSearchCommand.mockRejectedValueOnce(new Error('socket hang up'));

    await runCli(['node', 'tavily', 'search', 'hello']);

    expect(process.exitCode).toBe(1);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error [COMMAND_EXECUTION_FAILED]:')
    );
  });
});

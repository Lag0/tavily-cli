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

  it('rejects invalid numeric options before executing command', async () => {
    const { runCli } = await loadCli();
    await runCli(['node', 'tavily', 'search', 'hello', '--max-results', 'abc']);

    expect(handleSearchCommand).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  it('rejects legacy --status on non-status commands', async () => {
    const { runCli } = await loadCli();
    await runCli(['node', 'tavily', 'search', 'hello', '--status']);

    expect(handleStatusCommand).not.toHaveBeenCalled();
    expect(handleSearchCommand).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });
});

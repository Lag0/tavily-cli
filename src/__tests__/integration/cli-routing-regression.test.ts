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

describe('CLI routing regression', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    process.exitCode = 0;
  });

  it('routes each web command to exactly one handler', async () => {
    const { runCli } = await loadCli();

    await runCli(['node', 'tavily', 'search', 'hello world']);
    await runCli(['node', 'tavily', 'extract', 'https://docs.tavily.com']);
    await runCli(['node', 'tavily', 'crawl', 'https://docs.tavily.com']);
    await runCli(['node', 'tavily', 'map', 'https://docs.tavily.com']);
    await runCli(['node', 'tavily', 'research', 'summarize latest ai safety']);
    await runCli(['node', 'tavily', 'research-status', 'req_123']);

    expect(handleSearchCommand).toHaveBeenCalledTimes(1);
    expect(handleExtractCommand).toHaveBeenCalledTimes(1);
    expect(handleCrawlCommand).toHaveBeenCalledTimes(1);
    expect(handleMapCommand).toHaveBeenCalledTimes(1);
    expect(handleResearchCommand).toHaveBeenCalledTimes(1);
    expect(handleResearchStatusCommand).toHaveBeenCalledTimes(1);
  });

  it('routes tooling and auth commands without dispatching web handlers', async () => {
    const { runCli } = await loadCli();

    await runCli(['node', 'tavily', 'login']);
    await runCli(['node', 'tavily', 'logout']);
    await runCli(['node', 'tavily', 'status']);
    await runCli(['node', 'tavily', 'init', '--skip-auth', '--skip-skills']);
    await runCli(['node', 'tavily', 'setup', 'skills']);
    await runCli(['node', 'tavily', 'env']);
    await runCli(['node', 'tavily', 'doctor']);

    expect(handleLoginCommand).toHaveBeenCalledTimes(1);
    expect(handleLogoutCommand).toHaveBeenCalledTimes(1);
    expect(handleStatusCommand).toHaveBeenCalledTimes(1);
    expect(handleInitCommand).toHaveBeenCalledTimes(1);
    expect(handleSetupCommand).toHaveBeenCalledTimes(1);
    expect(handleEnvPullCommand).toHaveBeenCalledTimes(1);
    expect(handleDoctorCommand).toHaveBeenCalledTimes(1);

    expect(handleSearchCommand).not.toHaveBeenCalled();
    expect(handleExtractCommand).not.toHaveBeenCalled();
    expect(handleCrawlCommand).not.toHaveBeenCalled();
    expect(handleMapCommand).not.toHaveBeenCalled();
    expect(handleResearchCommand).not.toHaveBeenCalled();
    expect(handleResearchStatusCommand).not.toHaveBeenCalled();
  });

  it('keeps bare URL shortcut pinned to extract routing', async () => {
    const { runCli } = await loadCli();

    await runCli(['node', 'tavily', 'https://example.com/docs']);

    expect(handleExtractCommand).toHaveBeenCalledTimes(1);
    expect(handleExtractCommand).toHaveBeenCalledWith(
      expect.objectContaining({ urls: ['https://example.com/docs'] })
    );
    expect(handleSearchCommand).not.toHaveBeenCalled();
    expect(handleCrawlCommand).not.toHaveBeenCalled();
    expect(handleMapCommand).not.toHaveBeenCalled();
  });

  it('rejects unknown commands without calling handlers', async () => {
    const { runCli } = await loadCli();

    await runCli(['node', 'tavily', 'unknown-command']);

    expect(process.exitCode).toBe(1);
    expect(handleSearchCommand).not.toHaveBeenCalled();
    expect(handleExtractCommand).not.toHaveBeenCalled();
    expect(handleCrawlCommand).not.toHaveBeenCalled();
    expect(handleMapCommand).not.toHaveBeenCalled();
    expect(handleResearchCommand).not.toHaveBeenCalled();
    expect(handleResearchStatusCommand).not.toHaveBeenCalled();
  });
});

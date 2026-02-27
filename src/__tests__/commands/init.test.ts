import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleInitCommand } from '../../commands/init';
import { CommandRuntimeError } from '../../commands/runtime/command-error';
import { getApiKey } from '../../utils/config';
import { runCommandOrExit } from '../../utils/process';

vi.mock('../../utils/process', () => ({
  runCommandOrExit: vi.fn(),
}));

vi.mock('../../utils/config', () => ({
  getApiKey: vi.fn(),
  updateConfig: vi.fn(),
}));

vi.mock('../../utils/credentials', () => ({
  saveCredentials: vi.fn(),
}));

describe('handleInitCommand', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.mocked(getApiKey).mockReturnValue(undefined);
  });

  it('installs skills from the main branch source', async () => {
    await handleInitCommand({ skipInstall: true, skipAuth: true });

    expect(runCommandOrExit).toHaveBeenCalledWith({
      command: 'npx',
      args: [
        '-y',
        'skills@1.4.1',
        'add',
        'https://github.com/lag0/tavily-cli/tree/main',
      ],
      failureMessage:
        'Failed to install skills. You can retry with: tavily setup skills',
    });
  });

  it('installs the CLI from npm latest', async () => {
    await handleInitCommand({ skipAuth: true, skipSkills: true });

    expect(runCommandOrExit).toHaveBeenCalledWith({
      command: 'npm',
      args: ['install', '-g', '@syxs/tavily-cli@latest'],
      failureMessage: 'Failed to install @syxs/tavily-cli globally',
    });
  });

  it('adds skill installer flags for --all and --yes', async () => {
    await handleInitCommand({
      skipInstall: true,
      skipAuth: true,
      all: true,
      yes: true,
      global: true,
      agent: 'codex',
    });

    expect(runCommandOrExit).toHaveBeenCalledWith({
      command: 'npx',
      args: [
        '-y',
        'skills@1.4.1',
        'add',
        'https://github.com/lag0/tavily-cli/tree/main',
        '--all',
        '--yes',
        '--global',
        '--agent',
        'codex',
      ],
      failureMessage:
        'Failed to install skills. You can retry with: tavily setup skills',
    });
  });

  it('throws auth runtime error when auth step has no API key', async () => {
    await expect(
      handleInitCommand({ skipInstall: true, skipSkills: true })
    ).rejects.toMatchObject({
      name: CommandRuntimeError.name,
      code: 'AUTH_REQUIRED',
      exitCode: 1,
      message:
        'No API key available. Set TAVILY_API_KEY, use --api-key in init, or run tavily login later.',
    });
  });
});

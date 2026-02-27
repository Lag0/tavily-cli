import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleSetupCommand } from '../../commands/setup';
import { runCommandOrExit } from '../../utils/process';

vi.mock('../../utils/process', () => ({
  runCommandOrExit: vi.fn(),
}));

describe('handleSetupCommand', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('installs skills from the main branch source', async () => {
    await handleSetupCommand('skills');

    expect(runCommandOrExit).toHaveBeenCalledWith({
      command: 'npx',
      args: [
        'skills@1.4.1',
        'add',
        'https://github.com/lag0/tavily-cli/tree/main',
      ],
      failureMessage:
        'Failed to install Tavily skill. You can retry with: tavily setup skills',
      printCommand: true,
    });
  });

  it('applies optional flags for skills setup', async () => {
    await handleSetupCommand('skills', { global: true, agent: 'claude' });

    expect(runCommandOrExit).toHaveBeenCalledWith({
      command: 'npx',
      args: [
        'skills@1.4.1',
        'add',
        'https://github.com/lag0/tavily-cli/tree/main',
        '--global',
        '--agent',
        'claude',
      ],
      failureMessage:
        'Failed to install Tavily skill. You can retry with: tavily setup skills',
      printCommand: true,
    });
  });
});

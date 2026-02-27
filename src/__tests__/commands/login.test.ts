import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleLoginCommand } from '../../commands/login';
import { CommandRuntimeError } from '../../commands/runtime/command-error';
import { saveCredentials } from '../../utils/credentials';
import { updateConfig } from '../../utils/config';

vi.mock('../../utils/credentials', () => ({
  saveCredentials: vi.fn(),
}));

vi.mock('../../utils/config', () => ({
  updateConfig: vi.fn(),
}));

describe('handleLoginCommand', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    delete process.env.TAVILY_API_KEY;
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('saves provided credentials', async () => {
    await handleLoginCommand({
      apiKey: 'tvly-key',
      apiUrl: 'https://api.tavily.com',
    });

    expect(saveCredentials).toHaveBeenCalledWith({
      apiKey: 'tvly-key',
      apiUrl: 'https://api.tavily.com',
    });
    expect(updateConfig).toHaveBeenCalledWith({
      apiKey: 'tvly-key',
      apiUrl: 'https://api.tavily.com',
    });
  });

  it('uses TAVILY_API_KEY when api key argument is missing', async () => {
    process.env.TAVILY_API_KEY = 'tvly-env-key';

    await handleLoginCommand({});

    expect(saveCredentials).toHaveBeenCalledWith({
      apiKey: 'tvly-env-key',
      apiUrl: undefined,
    });
    expect(updateConfig).toHaveBeenCalledWith({
      apiKey: 'tvly-env-key',
      apiUrl: undefined,
    });
  });

  it('fails when api key is missing and no env var is set', async () => {
    await expect(handleLoginCommand({})).rejects.toMatchObject({
      name: CommandRuntimeError.name,
      message:
        'API key is required. Set TAVILY_API_KEY and run "tavily login", or pass --api-key.',
      code: 'AUTH_REQUIRED',
      exitCode: 1,
    });
  });
});

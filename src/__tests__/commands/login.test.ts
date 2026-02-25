import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleLoginCommand } from '../../commands/login';
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
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
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

  it('fails when api key is missing', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(((code?: string | number | null | undefined) => {
        throw new Error(`process.exit:${code}`);
      }) as never);

    await expect(handleLoginCommand({})).rejects.toThrow('process.exit:1');
    expect(errorSpy).toHaveBeenCalledWith('Error: --api-key is required in v1.');

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });
});

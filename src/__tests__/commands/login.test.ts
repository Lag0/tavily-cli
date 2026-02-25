import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleLoginCommand } from '../../commands/login';
import { saveCredentials } from '../../utils/credentials';
import { getApiKey, getApiUrl, updateConfig } from '../../utils/config';

vi.mock('../../utils/credentials', () => ({
  saveCredentials: vi.fn(),
}));

vi.mock('../../utils/config', () => ({
  getApiKey: vi.fn(),
  getApiUrl: vi.fn(),
  updateConfig: vi.fn(),
}));

describe('handleLoginCommand', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  it('saves provided credentials', async () => {
    vi.mocked(getApiKey).mockReturnValue('tvly-key');
    vi.mocked(getApiUrl).mockReturnValue('https://api.tavily.com');

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

  it('accepts api key resolved from global config', async () => {
    vi.mocked(getApiKey).mockReturnValue('tvly-key-from-global');
    vi.mocked(getApiUrl).mockReturnValue('https://api.tavily.com');

    await handleLoginCommand({});

    expect(saveCredentials).toHaveBeenCalledWith({
      apiKey: 'tvly-key-from-global',
      apiUrl: 'https://api.tavily.com',
    });
    expect(updateConfig).toHaveBeenCalledWith({
      apiKey: 'tvly-key-from-global',
      apiUrl: 'https://api.tavily.com',
    });
  });
});

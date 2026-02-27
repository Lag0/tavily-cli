import { beforeEach, describe, expect, it, vi } from 'vitest';
import { withCommandHandler } from '../../../commands/runtime/with-command-handler';
import { CommandRuntimeError } from '../../../commands/runtime/command-error';
import { getClient } from '../../../utils/client';

vi.mock('../../../utils/client', () => ({
  getClient: vi.fn(),
}));

describe('withCommandHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getClient).mockReturnValue({} as any);
  });

  it('provides command context and preserves successful execution', async () => {
    const run = vi.fn(async () => undefined);

    await expect(withCommandHandler({}, run)).resolves.toBeUndefined();
    expect(run).toHaveBeenCalledWith(
      expect.objectContaining({
        client: {},
        jsonOutput: false,
      })
    );
  });

  it('preserves existing CommandRuntimeError instances', async () => {
    const runtimeError = new CommandRuntimeError({
      code: 'INVALID_INPUT',
      message: 'bad input',
      suggestion: 'use a valid value',
    });

    await expect(
      withCommandHandler({}, async () => {
        throw runtimeError;
      })
    ).rejects.toBe(runtimeError);
  });

  it('classifies Tavily timeout failures with deterministic remediation', async () => {
    await expect(
      withCommandHandler({}, async () => {
        throw new Error('Request timed out after 60 seconds.');
      })
    ).rejects.toMatchObject({
      code: 'API_TIMEOUT',
      message: 'Tavily request timed out.',
      suggestion:
        'Retry the command or increase timeout flags for the request.',
      details: 'Request timed out after 60 seconds.',
      exitCode: 1,
    });
  });

  it('classifies Tavily auth failures from API responses', async () => {
    await expect(
      withCommandHandler({}, async () => {
        throw new Error('401 Error: {"detail":"Unauthorized"}');
      })
    ).rejects.toMatchObject({
      code: 'AUTH_REQUIRED',
      message: 'Authentication failed while calling Tavily.',
      suggestion: 'Run `tavily login` or pass --api-key before retrying.',
      exitCode: 1,
    });
  });

  it('classifies network transport failures consistently', async () => {
    await expect(
      withCommandHandler({}, async () => {
        throw new Error(
          'An unexpected error occurred while making the request. Error: Error: getaddrinfo ENOTFOUND api.tavily.com'
        );
      })
    ).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      message: 'Network failure while contacting Tavily.',
      suggestion: 'Check internet access and configured Tavily API URL.',
      exitCode: 1,
    });
  });
});

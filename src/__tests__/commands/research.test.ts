import { beforeEach, describe, expect, it, vi } from 'vitest';
import { executeResearch } from '../../commands/research';
import { getClient } from '../../utils/client';

vi.mock('../../utils/client', () => ({
  getClient: vi.fn(),
}));

describe('executeResearch', () => {
  const mockResearch = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    mockResearch.mockResolvedValue({ requestId: 'req_123' });
    vi.mocked(getClient).mockReturnValue({ research: mockResearch } as any);
  });

  it('maps valid research options to Tavily research', async () => {
    await executeResearch({
      input: 'latest AI regulation updates',
      model: 'pro',
      citationFormat: 'apa',
      timeout: 90,
      stream: true,
      outputSchema: { type: 'object' },
    });

    expect(mockResearch).toHaveBeenCalledWith('latest AI regulation updates', {
      model: 'pro',
      citationFormat: 'apa',
      timeout: 90,
      stream: true,
      outputSchema: { type: 'object' },
    });
  });

  it('drops unsupported citation format values from the adapter payload', async () => {
    await executeResearch({
      input: 'market summary',
      citationFormat: 'harvard',
    });

    expect(mockResearch).toHaveBeenCalledWith('market summary', {
      model: undefined,
      citationFormat: undefined,
      timeout: undefined,
      stream: undefined,
      outputSchema: undefined,
    });
  });
});

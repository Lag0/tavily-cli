import { beforeEach, describe, expect, it, vi } from 'vitest';
import { executeExtract } from '../../commands/extract';
import { getClient } from '../../utils/client';

vi.mock('../../utils/client', () => ({
  getClient: vi.fn(),
}));

describe('executeExtract', () => {
  const mockExtract = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    mockExtract.mockResolvedValue({ results: [] });
    vi.mocked(getClient).mockReturnValue({ extract: mockExtract } as any);
  });

  it('maps options to Tavily extract', async () => {
    await executeExtract({
      urls: ['https://example.com'],
      extractDepth: 'advanced',
      format: 'markdown',
      includeImages: true,
      query: 'api docs',
      timeout: 30,
      chunksPerSource: 4,
      includeUsage: true,
    });

    expect(mockExtract).toHaveBeenCalledWith(['https://example.com'], {
      extractDepth: 'advanced',
      format: 'markdown',
      includeImages: true,
      includeFavicon: undefined,
      includeUsage: true,
      timeout: 30,
      query: 'api docs',
      chunksPerSource: 4,
    });
  });
});

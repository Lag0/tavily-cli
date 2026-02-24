import { beforeEach, describe, expect, it, vi } from 'vitest';
import { executeSearch } from '../../commands/search';
import { getClient } from '../../utils/client';

vi.mock('../../utils/client', () => ({
  getClient: vi.fn(),
}));

describe('executeSearch', () => {
  const mockSearch = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    mockSearch.mockResolvedValue({ results: [] });
    vi.mocked(getClient).mockReturnValue({ search: mockSearch } as any);
  });

  it('maps options to Tavily search', async () => {
    await executeSearch({
      query: 'test query',
      maxResults: 5,
      searchDepth: 'advanced',
      includeDomains: ['docs.tavily.com'],
      includeAnswer: true,
    });

    expect(mockSearch).toHaveBeenCalledWith('test query', {
      maxResults: 5,
      searchDepth: 'advanced',
      topic: undefined,
      timeRange: undefined,
      startDate: undefined,
      endDate: undefined,
      includeDomains: ['docs.tavily.com'],
      excludeDomains: undefined,
      country: undefined,
      includeRawContent: undefined,
      includeImages: undefined,
      includeImageDescriptions: undefined,
      includeAnswer: true,
      includeFavicon: undefined,
      includeUsage: undefined,
    });
  });
});

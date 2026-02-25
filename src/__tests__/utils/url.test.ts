import { describe, expect, it } from 'vitest';
import { isUrl, normalizeUrl } from '../../utils/url';

describe('url utils', () => {
  it('detects URLs', () => {
    expect(isUrl('https://example.com')).toBe(true);
    expect(isUrl('example.com')).toBe(true);
    expect(isUrl('localhost:3000')).toBe(true);
    expect(isUrl('login')).toBe(false);
    expect(isUrl('not a url')).toBe(false);
  });

  it('normalizes URLs without protocol', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com');
    expect(normalizeUrl('https://example.com')).toBe('https://example.com');
  });
});

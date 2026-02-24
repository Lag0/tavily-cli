import { describe, expect, it } from 'vitest';
import { parseJsonObject, parseList } from '../../utils/options';

describe('parseList', () => {
  it('parses comma-separated values', () => {
    expect(parseList('a,b,c')).toEqual(['a', 'b', 'c']);
  });

  it('trims and drops empty values', () => {
    expect(parseList(' a, ,b ,')).toEqual(['a', 'b']);
  });

  it('returns undefined for empty input', () => {
    expect(parseList(undefined)).toBeUndefined();
  });
});

describe('parseJsonObject', () => {
  it('parses valid object JSON', () => {
    expect(parseJsonObject('{"a":1}')).toEqual({ a: 1 });
  });

  it('returns undefined when no value is provided', () => {
    expect(parseJsonObject(undefined)).toBeUndefined();
  });

  it('throws for non-object JSON', () => {
    expect(() => parseJsonObject('[1,2]')).toThrow('Expected a JSON object.');
  });
});

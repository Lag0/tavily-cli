import { beforeEach, describe, expect, it } from 'vitest';
import {
  getApiUrl,
  initializeConfig,
  resetConfig,
  updateConfig,
} from '../../utils/config';

describe('config apiUrl hardening', () => {
  beforeEach(() => {
    delete process.env.TAVILY_ALLOW_UNTRUSTED_API_URL;
    delete process.env.TAVILY_API_URL;
    resetConfig();
  });

  it('rejects non-https api urls for non-local hosts', () => {
    expect(() => initializeConfig({ apiUrl: 'http://api.tavily.com' })).toThrow(
      'Invalid API URL protocol'
    );
  });

  it('rejects untrusted hosts by default', () => {
    expect(() =>
      updateConfig({ apiUrl: 'https://attacker.example.com' })
    ).toThrow('Refusing untrusted API URL host');
  });

  it('allows untrusted hosts only with explicit override', () => {
    process.env.TAVILY_ALLOW_UNTRUSTED_API_URL = '1';
    updateConfig({ apiUrl: 'https://custom.internal.example.com' });
    expect(getApiUrl()).toBe('https://custom.internal.example.com');
  });

  it('allows localhost over http for local development', () => {
    initializeConfig({ apiUrl: 'http://localhost:8080' });
    expect(getApiUrl()).toBe('http://localhost:8080');
  });
});

import { describe, it, expect } from 'vitest';
import { getHelloWorldResponse, getAddresses } from './tools.js';

describe('getHelloWorldResponse', () => {
  it('returns a message and timestamp', () => {
    const result = getHelloWorldResponse();

    expect(result.message).toBe('Hello from MCP Server!');
    expect(typeof result.timestamp).toBe('string');
    expect(() => new Date(result.timestamp)).not.toThrow();
  });

  it('returns a valid ISO timestamp', () => {
    const result = getHelloWorldResponse();
    const parsed = new Date(result.timestamp);

    expect(parsed.toISOString()).toBe(result.timestamp);
  });
});

describe('getAddresses', () => {
  it('returns an array of 5 addresses', () => {
    const addresses = getAddresses();

    expect(addresses).toHaveLength(5);
  });

  it('each address has all required fields', () => {
    const addresses = getAddresses();

    for (const addr of addresses) {
      expect(addr).toHaveProperty('id');
      expect(addr).toHaveProperty('name');
      expect(addr).toHaveProperty('street');
      expect(addr).toHaveProperty('city');
      expect(addr).toHaveProperty('state');
      expect(addr).toHaveProperty('zip');
      expect(typeof addr.id).toBe('number');
      expect(typeof addr.name).toBe('string');
    }
  });

  it('returns unique ids', () => {
    const addresses = getAddresses();
    const ids = addresses.map((a) => a.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});

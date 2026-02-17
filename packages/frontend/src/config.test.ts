import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadConfig, resetConfigCache } from './config';

describe('loadConfig', () => {
  beforeEach(() => {
    resetConfigCache();
    vi.restoreAllMocks();
  });

  it('fetches and returns config from /config.json', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ mcpServerUrl: 'https://api.example.com/prod/mcp' }),
    } as Response);

    const config = await loadConfig();

    expect(config).toEqual({ mcpServerUrl: 'https://api.example.com/prod/mcp' });
    expect(globalThis.fetch).toHaveBeenCalledWith('/config.json', { cache: 'no-store' });
  });

  it('caches config after first fetch', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ mcpServerUrl: 'https://api.example.com/prod/mcp' }),
    } as Response);

    await loadConfig();
    await loadConfig();

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('falls back to localhost on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response);

    const config = await loadConfig();

    expect(config.mcpServerUrl).toBe('http://localhost:3001/mcp');
  });

  it('falls back to localhost when mcpServerUrl is missing', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);

    const config = await loadConfig();

    expect(config.mcpServerUrl).toBe('http://localhost:3001/mcp');
  });

  it('falls back to localhost on fetch error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    const config = await loadConfig();

    expect(config.mcpServerUrl).toBe('http://localhost:3001/mcp');
  });

  it('re-fetches after resetConfigCache', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ mcpServerUrl: 'https://api.example.com/prod/mcp' }),
    } as Response);

    await loadConfig();
    resetConfigCache();
    await loadConfig();

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });
});

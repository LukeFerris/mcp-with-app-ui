import { describe, it, expect, vi } from 'vitest';

vi.mock('node:fs/promises', () => ({
  default: { readFile: vi.fn().mockResolvedValue('<html>mcp-app</html>') },
  readFile: vi.fn().mockResolvedValue('<html>mcp-app</html>'),
}));

describe('Lambda handler', () => {
  it('exports a handler function', async () => {
    const indexModule = await import('./index.js');

    expect(indexModule.handler).toBeDefined();
    expect(typeof indexModule.handler).toBe('function');
  });
});

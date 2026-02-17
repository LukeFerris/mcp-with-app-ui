import { describe, it, expect, vi } from 'vitest';

vi.mock('node:fs/promises', () => ({
  default: { readFile: vi.fn().mockResolvedValue('<html>mcp-app</html>') },
  readFile: vi.fn().mockResolvedValue('<html>mcp-app</html>'),
}));

const { createExpressApp, noop } = await import('./app.js');

describe('createExpressApp basics', () => {
  it('returns an express app with noop helper', () => {
    const app = createExpressApp();

    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
    expect(noop()).toBeUndefined();
  });

  it('handles POST /mcp with MCP initialize request', async () => {
    const app = createExpressApp();
    const { default: supertest } = await import('supertest');

    const response = await supertest(app)
      .post('/mcp')
      .send({
        jsonrpc: '2.0',
        method: 'initialize',
        params: {
          protocolVersion: '2025-03-26',
          capabilities: {},
          clientInfo: { name: 'test-client', version: '1.0.0' },
        },
        id: 1,
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json, text/event-stream');

    expect(response.status).toBe(200);
  });
});

describe('createExpressApp error handling', () => {
  it('returns error for invalid JSON-RPC request', async () => {
    const app = createExpressApp();
    const { default: supertest } = await import('supertest');

    const response = await supertest(app)
      .post('/mcp')
      .send({ invalid: 'not jsonrpc' })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json, text/event-stream');

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('returns 500 when server.connect throws', async () => {
    const serverMod = await import('./server.js');
    const origCreate = serverMod.createServer;
    vi.spyOn(serverMod, 'createServer').mockImplementation(() => {
      const srv = origCreate();
      srv.connect = () => { throw new Error('boom'); };
      return srv;
    });

    const { createExpressApp: createApp } = await import('./app.js');
    const app = createApp();
    const { default: supertest } = await import('supertest');

    const response = await supertest(app)
      .post('/mcp')
      .send({
        jsonrpc: '2.0',
        method: 'initialize',
        params: {
          protocolVersion: '2025-03-26',
          capabilities: {},
          clientInfo: { name: 'test', version: '1.0.0' },
        },
        id: 1,
      })
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json, text/event-stream');

    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe(-32603);

    vi.restoreAllMocks();
  });
});

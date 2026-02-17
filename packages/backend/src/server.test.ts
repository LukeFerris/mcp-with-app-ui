import { describe, it, expect, vi } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

vi.mock('node:fs/promises', () => ({
  default: { readFile: vi.fn().mockResolvedValue('<html>mcp-app</html>') },
  readFile: vi.fn().mockResolvedValue('<html>mcp-app</html>'),
}));

const { createServer } = await import('./server.js');

describe('createServer', () => {
  it('returns an McpServer instance', () => {
    const server = createServer();

    expect(server).toBeDefined();
    expect(typeof server.connect).toBe('function');
    expect(typeof server.close).toBe('function');
  });

  it('creates a new server on each call', () => {
    const server1 = createServer();
    const server2 = createServer();

    expect(server1).not.toBe(server2);
  });

  it('hello_world tool returns greeting with timestamp', async () => {
    const server = createServer();
    const client = new Client({ name: 'test', version: '1.0.0' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    const result = await client.callTool({ name: 'hello_world', arguments: {} });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    const parsed = JSON.parse(text);

    expect(parsed.message).toBe('Hello from MCP Server!');
    expect(parsed.timestamp).toBeDefined();

    await client.close();
    await server.close();
  });

  it('get_addresses tool returns 5 addresses', async () => {
    const server = createServer();
    const client = new Client({ name: 'test', version: '1.0.0' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    const result = await client.callTool({ name: 'get_addresses', arguments: {} });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    const parsed = JSON.parse(text);

    expect(parsed.addresses).toHaveLength(5);
    expect(parsed.addresses[0]).toHaveProperty('name');

    await client.close();
    await server.close();
  });

  it('serves the mcp-app resource', async () => {
    const server = createServer();
    const client = new Client({ name: 'test', version: '1.0.0' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    const result = await client.readResource({ uri: 'ui://mcp-app/app.html' });

    expect(result.contents[0].text).toBe('<html>mcp-app</html>');

    await client.close();
    await server.close();
  });
});

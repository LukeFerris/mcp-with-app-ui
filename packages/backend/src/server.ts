import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from '@modelcontextprotocol/ext-apps/server';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAddresses, getHelloWorldResponse } from './tools.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Creates a configured MCP server with hello_world and get_addresses tools.
 * @returns A new McpServer instance with tools and resources registered
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: 'MCP App Server',
    version: '1.0.0',
  });

  const resourceUri = 'ui://mcp-app/app.html';

  registerAppTool(
    server,
    'hello_world',
    {
      title: 'Hello World',
      description: 'Returns a greeting with the current server timestamp.',
      inputSchema: {},
      _meta: { ui: { resourceUri } },
    },
    async () => {
      const result = getHelloWorldResponse();
      return { content: [{ type: 'text', text: JSON.stringify(result) }] };
    },
  );

  registerAppTool(
    server,
    'get_addresses',
    {
      title: 'Get Addresses',
      description: 'Returns a list of fictitious addresses.',
      inputSchema: {},
      _meta: { ui: { resourceUri } },
    },
    async () => {
      const addresses = getAddresses();
      return { content: [{ type: 'text', text: JSON.stringify({ addresses }) }] };
    },
  );

  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => {
      const htmlPath = path.join(currentDir, 'mcp-app.html');
      const html = await fs.readFile(htmlPath, 'utf-8');
      return { contents: [{ uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html }] };
    },
  );

  return server;
}

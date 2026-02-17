import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import cors from 'cors';
import express from 'express';
import type { Request, Response } from 'express';
import { createServer } from './server.js';

/** Silently ignores errors from cleanup operations. */
export const noop = (): void => { /* no-op */ };

/**
 * Creates an Express app wired to serve MCP over Streamable HTTP at /mcp.
 * @returns Configured Express application
 */
export function createExpressApp(): express.Express {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.all('/mcp', async (req: Request, res: Response) => {
    const server = createServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('MCP error:', error);
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    } finally {
      await transport.close().catch(noop);
      await server.close().catch(noop);
    }
  });

  return app;
}

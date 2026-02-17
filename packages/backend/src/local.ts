import { createExpressApp } from './app.js';

const PORT = Number(process.env.PORT ?? 3001);
const app = createExpressApp();

app.listen(PORT, () => {
  console.log(`MCP server listening on http://localhost:${PORT}/mcp`);
});

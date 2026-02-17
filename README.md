# MCP Server with App UI

A dual-modality MCP (Model Context Protocol) server deployed on AWS, featuring:

- **MCP Server**: Lambda + API Gateway serving tools via Streamable HTTP transport
- **React Frontend**: CloudFront-hosted UI that connects as an MCP client
- **MCP App UI**: Embedded interactive interface for Claude and other MCP hosts

## Architecture

```
React Frontend (CloudFront)  ──►  AWS Lambda (Express + MCP SDK)
Claude / AI Host             ──►  via API Gateway POST /mcp
```

The MCP server runs in **stateless mode** — each Lambda invocation handles one JSON-RPC request independently. No sessions or persistent connections needed.

## MCP Tools

| Tool | Description |
|------|-------------|
| `hello_world` | Returns a greeting with the current server timestamp |
| `get_addresses` | Returns a list of 5 fictitious addresses |

Both tools include an MCP App UI resource (`ui://mcp-app/app.html`) for interactive rendering in supported hosts.

## Getting Started

```bash
yarn install    # Install dependencies
yarn build      # Build all packages (mcp-app → backend → frontend)
yarn test       # Run tests
yarn dev        # Start local dev (backend :3001 + frontend :5173)
```

## Deployment

Deployment runs automatically on commit via pre-commit hooks:

1. Lint, security scan, build, and test
2. Terraform applies infrastructure changes
3. Frontend assets uploaded to S3
4. CloudFront cache invalidated

After deployment, the script outputs:
- **Frontend URL**: CloudFront distribution URL
- **MCP Server URL**: API Gateway URL + `/mcp`

## Connecting to Claude Desktop

Add the MCP server to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mcp-app-server": {
      "command": "npx",
      "args": ["mcp-remote", "https://<api-gateway-url>/prod/mcp"]
    }
  }
}
```

## Structure

```
packages/
  mcp-app/      # MCP App UI (builds to single HTML file)
  backend/      # MCP server (Lambda + Express + MCP SDK)
  frontend/     # React frontend (use-mcp hook)
deployment/     # Terraform infrastructure
scripts/        # Deploy and security scripts
```

# --- SSM Parameter Store for runtime configuration ---

resource "aws_ssm_parameter" "mcp_server_url" {
  name        = "/${local.resource_prefix}/mcp-server-url"
  description = "MCP Server URL for ${local.resource_prefix}"
  type        = "String"
  value       = "${aws_api_gateway_stage.prod.invoke_url}/mcp"
}

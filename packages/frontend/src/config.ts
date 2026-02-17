/**
 * Application configuration.
 */
export interface AppConfig {
  mcpServerUrl: string;
}

let cachedConfig: AppConfig | null = null;

/**
 * Fetches runtime configuration from /config.json (uploaded to S3 during deployment).
 * Falls back to localhost for local development.
 * @returns Application configuration with MCP server URL
 */
export async function loadConfig(): Promise<AppConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const response = await fetch('/config.json', { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const config = (await response.json()) as AppConfig;

    if (!config.mcpServerUrl || typeof config.mcpServerUrl !== 'string') {
      throw new Error('Invalid config: missing or invalid mcpServerUrl');
    }

    cachedConfig = config;
    return config;
  } catch {
    const fallback: AppConfig = { mcpServerUrl: 'http://localhost:3001/mcp' };
    cachedConfig = fallback;
    return fallback;
  }
}

/**
 * Resets the cached configuration (for testing).
 */
export function resetConfigCache(): void {
  cachedConfig = null;
}

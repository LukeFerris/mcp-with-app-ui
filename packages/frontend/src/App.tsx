import { useState, useEffect, useCallback } from 'react';
import { loadConfig } from './config';
import { McpTools } from './McpTools';

/**
 * Main application component. Loads config then renders MCP tools UI.
 * @returns The rendered App component
 */
function App(): React.ReactNode {
  const [mcpServerUrl, setMcpServerUrl] = useState<string | null>(null);

  useEffect(() => {
    loadConfig().then((config) => setMcpServerUrl(config.mcpServerUrl));
  }, []);

  if (!mcpServerUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading configuration...</p>
      </div>
    );
  }

  return <McpTools url={mcpServerUrl} />;
}

export default App;

/**
 * Formats a tool call result for display.
 * @param result - The raw result from callTool
 * @returns Formatted string
 */
export function formatToolResult(result: unknown): string {
  if (!result || typeof result !== 'object') {
    return String(result ?? '');
  }

  const typed = result as { content?: Array<{ type: string; text?: string }> };
  const textPart = typed.content?.find((c) => c.type === 'text');
  return textPart?.text ?? JSON.stringify(result, null, 2);
}

/**
 * Hook for managing tool call state.
 * @param callTool - The callTool function from useMcp
 * @returns Tool call helpers
 */
export function useToolCall(callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>) {
  const [results, setResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const invoke = useCallback(async (toolName: string) => {
    setLoading((prev) => ({ ...prev, [toolName]: true }));
    try {
      const result = await callTool(toolName, {});
      setResults((prev) => ({ ...prev, [toolName]: formatToolResult(result) }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Tool call failed';
      setResults((prev) => ({ ...prev, [toolName]: `Error: ${msg}` }));
    } finally {
      setLoading((prev) => ({ ...prev, [toolName]: false }));
    }
  }, [callTool]);

  return { results, loading, invoke };
}

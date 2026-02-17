import { useMcp } from 'use-mcp/react';
import { useToolCall } from './App';

/**
 * Props for the McpTools component.
 */
interface McpToolsProps {
  url: string;
}

/**
 * Displays MCP connection state and tool invocation UI.
 * @param props - Component props
 * @param props.url - MCP server URL
 * @returns The rendered McpTools component
 */
export function McpTools({ url }: McpToolsProps): React.ReactNode {
  const { state, tools, callTool, error } = useMcp({ url });
  const { results, loading, invoke } = useToolCall(callTool);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">MCP Tools</h1>
        <p className="text-gray-500 text-center text-sm mb-6">
          Connected via MCP Streamable HTTP
        </p>

        <ConnectionStatus state={state} error={error} toolCount={tools.length} />

        {state === 'ready' && (
          <div className="space-y-4 mt-6">
            <ToolCard
              name="hello_world"
              description="Returns a greeting with server timestamp"
              result={results['hello_world']}
              isLoading={loading['hello_world']}
              onInvoke={() => invoke('hello_world')}
            />
            <ToolCard
              name="get_addresses"
              description="Returns a list of fictitious addresses"
              result={results['get_addresses']}
              isLoading={loading['get_addresses']}
              onInvoke={() => invoke('get_addresses')}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Props for the ConnectionStatus component.
 */
interface ConnectionStatusProps {
  state: string;
  error: string | null | undefined;
  toolCount: number;
}

/**
 * Shows the current MCP connection state.
 * @param props - Connection status props
 * @param props.state - Current connection state
 * @param props.error - Error message if failed
 * @param props.toolCount - Number of available tools
 * @returns The rendered ConnectionStatus component
 */
function ConnectionStatus({ state, error, toolCount }: ConnectionStatusProps): React.ReactNode {
  const isReady = state === 'ready';
  const isFailed = state === 'failed';

  return (
    <div className={`p-3 rounded-lg text-sm ${isFailed ? 'bg-red-50 text-red-700' : isReady ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
      {isFailed && <p>Connection failed: {error ?? 'Unknown error'}</p>}
      {isReady && <p>Connected — {toolCount} tool{toolCount !== 1 ? 's' : ''} available</p>}
      {!isReady && !isFailed && <p>Status: {state}...</p>}
    </div>
  );
}

/**
 * Props for the ToolCard component.
 */
interface ToolCardProps {
  name: string;
  description: string;
  result: string | undefined;
  isLoading: boolean | undefined;
  onInvoke: () => void;
}

/**
 * Card UI for invoking a single MCP tool and displaying its result.
 * @param props - Tool card props
 * @param props.name - Tool name
 * @param props.description - Tool description
 * @param props.result - Result from last invocation
 * @param props.isLoading - Whether the tool is currently being called
 * @param props.onInvoke - Callback to invoke the tool
 * @returns The rendered ToolCard component
 */
function ToolCard({ name, description, result, isLoading, onInvoke }: ToolCardProps): React.ReactNode {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-800">{name}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <button
          onClick={onInvoke}
          disabled={!!isLoading}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Calling...' : 'Call'}
        </button>
      </div>
      {result && (
        <pre className="mt-3 p-3 bg-white rounded border text-xs overflow-auto max-h-64 whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </div>
  );
}

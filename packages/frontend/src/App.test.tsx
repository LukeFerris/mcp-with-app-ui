import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { formatToolResult } from './App';
import * as configModule from './config';

const mockUseMcp = vi.fn();

vi.mock('use-mcp/react', () => ({
  useMcp: (...args: unknown[]) => mockUseMcp(...args),
}));

vi.mock('./config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./config')>();
  return { ...actual, loadConfig: vi.fn() };
});

beforeEach(() => {
  vi.mocked(configModule.loadConfig).mockResolvedValue({
    mcpServerUrl: 'http://localhost:3001/mcp',
  });
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  configModule.resetConfigCache();
});

/**
 * Helper to set up the mock MCP hook.
 * @param overrides - Partial overrides for the useMcp return value
 */
function setupMockMcp(overrides: Record<string, unknown> = {}): void {
  mockUseMcp.mockReturnValue({
    state: 'ready',
    tools: [{ name: 'hello_world' }, { name: 'get_addresses' }],
    callTool: vi.fn().mockResolvedValue({ content: [{ type: 'text', text: 'Hello!' }] }),
    error: null,
    ...overrides,
  });
}

describe('App connection states', () => {
  it('shows loading config initially', async () => {
    vi.mocked(configModule.loadConfig).mockReturnValue(new Promise(() => {}));
    const { default: App } = await import('./App');
    render(<App />);
    expect(screen.getByText('Loading configuration...')).toBeInTheDocument();
  });

  it('renders MCP tools when ready', async () => {
    setupMockMcp();
    const { default: App } = await import('./App');
    render(<App />);
    await waitFor(() => expect(screen.getByText('MCP Tools')).toBeInTheDocument());
    expect(screen.getByText(/2 tools? available/)).toBeInTheDocument();
  });

  it('shows connection failed state', async () => {
    setupMockMcp({ state: 'failed', error: 'Connection refused', tools: [] });
    const { default: App } = await import('./App');
    render(<App />);
    await waitFor(() => expect(screen.getByText(/Connection failed/)).toBeInTheDocument());
  });

  it('shows connecting state', async () => {
    setupMockMcp({ state: 'connecting', tools: [] });
    const { default: App } = await import('./App');
    render(<App />);
    await waitFor(() => expect(screen.getByText(/connecting/i)).toBeInTheDocument());
  });

  it('shows single tool count text', async () => {
    setupMockMcp({ tools: [{ name: 'hello_world' }] });
    const { default: App } = await import('./App');
    render(<App />);
    await waitFor(() => expect(screen.getByText(/1 tool available/)).toBeInTheDocument());
  });
});

describe('App tool invocation', () => {
  it('calls hello_world on button click', async () => {
    const mockCallTool = vi.fn().mockResolvedValue({
      content: [{ type: 'text', text: '{"message":"Hello!"}' }],
    });
    setupMockMcp({ callTool: mockCallTool });
    const { default: App } = await import('./App');
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => expect(screen.getByText('MCP Tools')).toBeInTheDocument());
    const callButtons = screen.getAllByRole('button', { name: 'Call' });
    await user.click(callButtons[0]);
    expect(mockCallTool).toHaveBeenCalledWith('hello_world', {});
  });

  it('calls get_addresses on button click', async () => {
    const mockCallTool = vi.fn().mockResolvedValue({
      content: [{ type: 'text', text: '{"addresses":[]}' }],
    });
    setupMockMcp({ callTool: mockCallTool });
    const { default: App } = await import('./App');
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => expect(screen.getByText('MCP Tools')).toBeInTheDocument());
    const callButtons = screen.getAllByRole('button', { name: 'Call' });
    await user.click(callButtons[1]);
    expect(mockCallTool).toHaveBeenCalledWith('get_addresses', {});
  });

  it('shows error when tool call fails', async () => {
    const mockCallTool = vi.fn().mockRejectedValue(new Error('Tool failed'));
    setupMockMcp({ callTool: mockCallTool });
    const { default: App } = await import('./App');
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => expect(screen.getByText('MCP Tools')).toBeInTheDocument());
    const callButtons = screen.getAllByRole('button', { name: 'Call' });
    await user.click(callButtons[0]);
    await waitFor(() => expect(screen.getByText(/Error: Tool failed/)).toBeInTheDocument());
  });
});

describe('formatToolResult', () => {
  it('formats text content from tool result', () => {
    const result = { content: [{ type: 'text', text: 'hello' }] };
    expect(formatToolResult(result)).toBe('hello');
  });

  it('returns stringified result when no text content', () => {
    const result = { content: [{ type: 'image', url: 'http://example.com' }] };
    expect(formatToolResult(result)).toContain('image');
  });

  it('handles null and undefined', () => {
    expect(formatToolResult(null)).toBe('');
    expect(formatToolResult(undefined)).toBe('');
  });

  it('handles primitive values', () => {
    expect(formatToolResult('hello')).toBe('hello');
    expect(formatToolResult(42)).toBe('42');
  });
});

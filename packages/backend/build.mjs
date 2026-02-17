import { build } from 'esbuild';
import { cpSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const distDir = join(root, 'dist');

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

await build({
  entryPoints: [join(root, 'src/index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: join(distDir, 'index.mjs'),
  external: ['@aws-sdk/*'],
  sourcemap: true,
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
});

const mcpAppHtml = join(root, '..', 'mcp-app', 'dist', 'mcp-app.html');
if (existsSync(mcpAppHtml)) {
  cpSync(mcpAppHtml, join(distDir, 'mcp-app.html'));
} else {
  console.warn('WARNING: mcp-app.html not found. Build mcp-app first.');
}

console.log('Backend build complete.');

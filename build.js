const { build } = require('esbuild');
const fs = require('fs');
const path = require('path');

// Clean previous build
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}

// Build the client
console.log('Building client...');
const { execSync } = require('child_process');
execSync('npx vite build', { stdio: 'inherit' });

// Build the server for serverless deployment
console.log('Building server...');
build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  outdir: 'dist',
  format: 'cjs',
  platform: 'node',
  target: 'node18',
  external: ['pg-native'],
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  minify: false,
  sourcemap: true,
}).catch(() => process.exit(1));

console.log('Build completed!');
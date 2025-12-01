import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, readdirSync } from 'fs';

// Custom plugin to copy components folder
function copyComponentsPlugin() {
  return {
    name: 'copy-components',
    closeBundle() {
      const srcDir = resolve(__dirname, 'src/frontend/components');
      const destDir = resolve(__dirname, 'dist/components');

      try {
        mkdirSync(destDir, { recursive: true });
        const files = readdirSync(srcDir);
        for (const file of files) {
          copyFileSync(resolve(srcDir, file), resolve(destDir, file));
        }
        console.log('Copied components folder to dist');
      } catch (err) {
        console.error('Error copying components:', err);
      }
    }
  };
}

export default defineConfig({
  root: 'src/frontend',
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'src/frontend/index.html'
      }
    }
  },
  plugins: [copyComponentsPlugin()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true
      }
    }
  }
});

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    // Disable Vitest's API server to avoid binding to a local port in sandboxed environments
    api: false,
    // Use threads instead of child process forks because the sandbox blocks forked workers
    pool: 'threads'
  }
});

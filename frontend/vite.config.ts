//frontend\vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        port: 5173,
        hmr: {
            clientPort: 80,
            host: 'localhost',
        },
        proxy: {
            '/api': {
                target: 'http://backend:3000',
                changeOrigin: true,
            },
        },
    },
});
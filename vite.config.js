import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        dedupe: ['react', 'react-dom'],
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
    optimizeDeps: {
        // Prebundle the dashboard's lazy-loaded scroll area with the shared React runtime.
        include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime', '@radix-ui/react-scroll-area'],
    },
});

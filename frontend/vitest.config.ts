// frontend/vitest.config.ts

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        server: {
            deps: {
                inline: ["@mui/x-data-grid"],
            },
        },
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts',
        // Add this css block to mock CSS imports
        css: {
            modules: {
                classNameStrategy: 'non-scoped',
            },
        },
    },
});
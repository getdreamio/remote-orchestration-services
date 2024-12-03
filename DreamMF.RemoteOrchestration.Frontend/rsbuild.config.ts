import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
    plugins: [pluginReact()],
    source: {
        entry: {
            index: './src/index.tsx'
        }
    },
    output: {
        distPath: {
            root: 'dist',
            js: 'static/js',
            css: 'static/css',
            assets: 'static/assets'
        },
        cleanDistPath: true
    },
    server: {
        port: 3000
    }
});
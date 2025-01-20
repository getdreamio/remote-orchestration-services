import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
    plugins: [pluginReact()],
    source: {
        entry: {
            index: './src/index.tsx'
        },
        define: {
            // Automatically inject all process.env.* variables
            'process.env': JSON.stringify(process.env)
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
    },
    html: {
        template: './public/index.html',
        favicon: './public/favicon.ico'
    }
});
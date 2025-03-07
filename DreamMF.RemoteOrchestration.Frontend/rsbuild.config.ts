import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
    plugins: [pluginReact()],
    source: {
        entry: {
            index: './src/index.tsx'
        },
        define: {
            'process.env': JSON.stringify(process.env)
        },
        include: ['public/env-config.json']
    },
    output: {
        distPath: {
            root: 'dist',
            js: 'static/js',
            css: 'static/css',
            assets: 'static/assets'
        },
        cleanDistPath: true,
        copy: [
            { from: './public/env-config.json', to: 'static/config/env-config.json' }
        ]
    },
    server: {
        port: 3000
    },
    html: {
        template: './public/index.html',
        favicon: './public/favicon.ico'
    }
});
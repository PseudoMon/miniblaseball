import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json';

import riot from 'rollup-plugin-riot'

export default {
    input: 'src/main.js',
    output: {
        file: 'dist/app.js',
        format: 'iife',
        sourcemap: false,
        name: 'app'
    },
    plugins: [
        json(),
        riot({ ext: 'riot' }),
        resolve()
    ]
}

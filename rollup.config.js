import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json';

import { terser }  from 'rollup-plugin-terser'
import riot from 'rollup-plugin-riot'

const production = !process.env.ROLLUP_WATCH;
console.log("PRODUCTION:" + production)

export default {
    input: 'src/main.js',
    output: {
        file: 'dist/app.js',
        format: 'iife',
        name: 'app'
    },
    plugins: [
        json(),
        riot({ ext: 'riot' }),
        resolve(),
        production ? terser() : null
    ]
}

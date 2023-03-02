//rollup.config.js
import { defineConfig } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import eslint from '@rollup/plugin-eslint';
import css from 'rollup-plugin-import-css';

import glob from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  input: Object.fromEntries(
    glob.sync('scripts/*.js').map(file => [
        // This remove `src/` as well as the file extension from each
        // file, so e.g. src/nested/foo.js becomes nested/foo
        path.relative(
            'scripts',
            file.slice(0, file.length - path.extname(file).length)
        ),
        // This expands the relative paths to absolute paths, so e.g.
        // src/nested/foo becomes /project/src/nested/foo.js
        fileURLToPath(new URL(file, import.meta.url))
    ])
  ),
  output: {
    dir: 'assets',
    entryFileNames: '[name].js',
    format: 'iife',
    sourcemap: 'inline',
    assetFileNames: '[name].[ext]'
  },
  plugins: [
    eslint({
      exclude: ['assets/*.css', 'node_modules/**']
    }),
    css(),
    nodeResolve(),
  ],
  external: ['Glide']
});

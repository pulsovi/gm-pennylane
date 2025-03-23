import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { string } from 'rollup-plugin-string';

const commonConfig = {
  plugins: [
    commonjs(),
    resolve(),
    string({
      include: '**/*.css'
    }),
    typescript({
      lib: ['ES2020', 'DOM'],
      target: 'ES2020',
    }),
  ],
};

export default [
  {
    ...commonConfig,
    input: 'src/eval.ts',
    output: {
      file: 'dist/eval.cjs',
      format: 'cjs'
    }
  },
  {
    ...commonConfig,
    input: 'src/main.ts',
    output: {
      file: 'dist/main.cjs',
      format: 'cjs'
    }
  }
];

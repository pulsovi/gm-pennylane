import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const commonConfig = {
  plugins: [
    typescript({
      lib: ['ES2020', 'DOM'],
      target: 'ES2020',
    }),
    resolve(),
    commonjs()
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

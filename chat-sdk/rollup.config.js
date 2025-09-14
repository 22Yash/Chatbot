import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.js',
  output: [
    { file: 'dist/chat-sdk.cjs.js', format: 'cjs' },
    { file: 'dist/chat-sdk.esm.js', format: 'esm' },
    { file: 'dist/chat-sdk.umd.js', format: 'umd', name: 'ChatSDK' }
  ],
  plugins: [
    resolve({
      extensions: ['.js', '.jsx']
    }),
    commonjs(),
    babel({ babelHelpers: 'bundled', extensions: ['.js', '.jsx'] })
  ]
};

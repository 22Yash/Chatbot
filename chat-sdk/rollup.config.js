import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import css from 'rollup-plugin-css-only';

export default {
  input: 'src/index.js',
  output: [
    { file: 'dist/chat-sdk.cjs.js', format: 'cjs', exports: 'named' },
    { file: 'dist/chat-sdk.esm.js', format: 'esm' },
    { file: 'dist/chat-sdk.umd.js', format: 'umd', name: 'ChatSDK', globals: { react: 'React', 'react-dom': 'ReactDOM' } }
  ],
  external: ['react', 'react-dom'],
  plugins: [
    resolve({ extensions: ['.js', '.jsx'] }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx'],
      presets: ['@babel/preset-env', '@babel/preset-react'],
      exclude: 'node_modules/**'
    }),
    css({ output: 'chat-sdk.css' })
  ]
};

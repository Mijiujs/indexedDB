import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser'; // 压缩

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'lib/index.js',
      format: 'cjs',
    },
    {
      file: 'lib/index.umd.js',
      format: 'umd',
      name: 'IDB',
    }
  ],
  plugins: [
    terser(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**', // 只编译我们的源代码
    })
  ],
}
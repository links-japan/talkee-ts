const path = require('path');
const typescript = require('rollup-plugin-typescript');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const { babel } = require('@rollup/plugin-babel');
const json = require('@rollup/plugin-json');
const postcss = require('rollup-plugin-postcss');
const pkj = require(path.resolve(__dirname, './package.json'));
const replace = require('@rollup/plugin-replace');
const image = require('@rollup/plugin-image');

module.exports = function (config) {
  // umd
  const extensions = ['.ts', '.js', '.png', '.svg'];
  config.push({
    input: 'src/index.ts',
    output: {
      file: `umd/talkee.min.${pkj.version.replace(/\./g, '-')}.js`,
      format: 'umd',
      name: 'Talkee',
      exports: 'default',
      compact: true
    },
    plugins: [
      nodeResolve({
        extensions,
        preferBuiltins: true,
        browser: true
      }),
      commonjs(),
      typescript({
        target: 'es5',
        lib: ["es5", "es6", "es2015", "es2016", "dom"],
        declaration: false
      }),
      babel({
        exclude: 'node_modules/**',
        plugins: [['@babel/plugin-transform-runtime', { corejs: 3 }]],
        babelHelpers: 'runtime',
        extensions
      }),
      json(),
    ]
  });

  config.forEach(v => {
    v.plugins.push(
      postcss(),
      image()
    );
  });

  return config;
}
const path = require("path");
const typescript = require("rollup-plugin-typescript");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const { babel } = require("@rollup/plugin-babel");
const json = require("@rollup/plugin-json");
const postcss = require("rollup-plugin-postcss");
const pkj = require(path.resolve(__dirname, "./package.json"));
const replace = require("@rollup/plugin-replace");
const image = require("@rollup/plugin-image");

// fallback env vars
const CLIENT_ID = "3a6c513a-a189-4586-a0f8-cba80ed84de8";
const API_BASE = "https://links-login.getlinks.jp/api";
const LOGIN_BASE = `https://oauth.getlinks.jp`;

module.exports = function (config) {
  const extensions = [".ts", ".js", ".svg"];

  const defaultPlugins = [
    nodeResolve({
      extensions,
      preferBuiltins: true,
      browser: true,
    }),
    commonjs(),
    typescript({
      target: "es5",
      lib: ["es5", "es6", "es2015", "es2016", "dom"],
      declaration: false,
    }),
    babel({
      exclude: "node_modules/**",
      plugins: [["@babel/plugin-transform-runtime", { corejs: 3 }]],
      babelHelpers: "runtime",
      extensions,
    }),
    json(),
  ];

  // config.push({
  //   input: 'src/index.ts',
  //   output: {
  //     file: `umd/talkee.min.${pkj.version.replace(/\./g, '-')}.js`,
  //     format: 'umd',
  //     name: 'Talkee',
  //     exports: 'default',
  //     compact: true
  //   },
  //   plugins: defaultPlugins,
  // });

  config.push({
    input: "src/index.ts",
    output: {
      file: `umd/talkee.min.latest.js`,
      format: "umd",
      name: "Talkee",
      exports: "default",
      compact: true,
    },
    plugins: defaultPlugins,
  });

  config.forEach((v) => {
    v.plugins.push(
      postcss(),
      image(),
      replace({
        preventAssignment: true,
        "process.env.APP_ENV": `"${process.env.APP_ENV}"`,
        "process.env.APP_TOKEN": `"${process.env.APP_TOKEN || ""}"`,
        "process.env.API_BASE": `"${process.env.API_BASE || API_BASE}"`,
        "process.env.LOGIN_BASE": `"${process.env.LOGIN_BASE || LOGIN_BASE}"`,
        "process.env.CLIENT_ID": `"${process.env.CLIENT_ID || CLIENT_ID}"`,
      })
    );
  });

  return config;
};

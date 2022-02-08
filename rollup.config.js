const path = require("path");
const typescript = require("rollup-plugin-typescript");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const { babel } = require("@rollup/plugin-babel");
const json = require("@rollup/plugin-json");
const postcss = require("rollup-plugin-postcss");
const scss = require("rollup-plugin-scss");
const pkj = require(path.resolve(__dirname, "./package.json"));
const replace = require("@rollup/plugin-replace");
const image = require("@rollup/plugin-image");
const cleanup = require("rollup-plugin-cleanup");

// fallback env vars
const CLIENT_ID = "";
const API_BASE = "";
const LOGIN_BASE = "";

module.exports = function (config) {
  const extensions = [".ts", ".js", ".svg"];

  config.forEach(v => {
    // just keep the third party reference
    v.external = [/peeler\-js\S*/, 'classnames', 'lodash', 'axios'];
  });

  const defaultPlugins = [
    nodeResolve({
      extensions,
      preferBuiltins: true,
      browser: true,
    }),
    commonjs(),
    typescript({
      target: "es2015",
      module: "ESNext",
      lib: ["es5", "es6", "es2015", "es2016", "dom"],
      declaration: false,
    }),
    babel({
      exclude: "node_modules/**",
      plugins: [
        ["@babel/plugin-transform-runtime", { corejs: 3, proposals: true }],
      ],
      babelHelpers: "runtime",
      extensions,
    }),
    json(),
  ];

  config.push({
    input: "src/index.ts",
    output: [
      {
        file: `umd/talkee.min.js`,
        format: "umd",
        name: "Talkee",
        exports: "default",
        compact: true,
      },
      {
        file: `umd/talkee.min.latest.js`,
        format: "umd",
        name: "Talkee",
        exports: "default",
        compact: true,
      },
    ],
    plugins: defaultPlugins,
  });

  config.forEach((v, k) => {
    v.plugins.push(
      scss(),
      postcss(),
      image(),
      replace({
        preventAssignment: true,
        "process.env.APP_ENV": `"${process.env.APP_ENV}"`,
        "process.env.APP_TOKEN": `"${process.env.APP_TOKEN || ""}"`,
        "process.env.API_BASE": `"${process.env.API_BASE || API_BASE}"`,
        "process.env.LOGIN_BASE": `"${process.env.LOGIN_BASE || LOGIN_BASE}"`,
        "process.env.CLIENT_ID": `"${process.env.CLIENT_ID || CLIENT_ID}"`,
      }),
      cleanup({
        extensions: ["js", "ts"],
      })
    );
  });

  return config;
};

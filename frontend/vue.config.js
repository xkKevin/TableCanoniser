const { defineConfig } = require("@vue/cli-service");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const webpack = require("webpack");

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: "/TableCanoniser/",
  outputDir: "../docs",
  // chainWebpack: (config) => {
  //   config.module
  //     .rule("js")
  //     .use("babel-loader")
  //     .tap((options) => {
  //       // 修改 babel-loader 的配置
  //       options.compact = false;
  //       return options;
  //     });
  // },
  configureWebpack: {
    plugins: [
      new MonacoWebpackPlugin(),
      new webpack.DefinePlugin({
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
      }),
    ],
    // optimization: {
    //   splitChunks: {
    //     chunks: "all",
    //     maxSize: 500000, // 500KB
    //   },
    // },
  },
  devServer: {
    proxy: {
      "/backend": {
        target: "http://127.0.0.1:5001", // 5000是flask debug时的端口，正常启动是app.run port的端口
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          "^/backend/(.*)": "/$1",
        },
      },
    },
  },
});

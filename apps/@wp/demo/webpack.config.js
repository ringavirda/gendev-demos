import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";

const distPath = path.resolve(import.meta.dirname, "../../../dist/demos/rr");
const entryPath = path.resolve(import.meta.dirname, "src/index.ts");

export default {
  mode: "development",
  entry: {
    main: entryPath,
  },
  output: {
    path: distPath,
    filename: "[name].[contenthash].js",
    clean: true,
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["ts-loader"],
      },
      {
        test: /\.html$/,
        use: ["raw-loader"],
        exclude: /index.html/,
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Requests Demo",
      filename: "index.html",
      template: "src/index.html",
    }),
  ],
  devServer: {
    static: {
      directory: distPath,
    },
    port: 4000,
    open: true,
    hot: true,
  },
};

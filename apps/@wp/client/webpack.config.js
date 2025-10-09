import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";

const distPath = path.resolve(import.meta.dirname, "../../../dist/wp/client");
const entryPath = path.resolve(import.meta.dirname, "src/index.js");

export default {
  mode: "development",
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
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              sassOptions: {
                loadPaths: [path.resolve(import.meta.dirname, "src")],
              },
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|svg|gif)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[name].[ext]",
            outputPath: "assets",
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  entry: {
    main: entryPath,
  },
  output: {
    path: distPath,
    filename: "[name].[contenthash].js",
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "Waifu Picker",
      filename: "index.html",
      template: "./src/index.html",
      favicon: "./src/assets/favicon.ico",
    }),
  ],
  devServer: {
    static: {
      directory: distPath,
    },
    compress: true,
    port: 9000,
  },
};

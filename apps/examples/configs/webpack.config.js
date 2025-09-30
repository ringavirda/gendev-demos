import path from "path";
import nodeExternals from "webpack-node-externals";

const distPath = path.resolve(import.meta.dirname, "..", "dist");
const entryPath = path.resolve(import.meta.dirname, "..", "src/app.ts");

export default {
  mode: "development",
  externalsPresets: { node: true },
  externals: [nodeExternals()],
  entry: {
    main: entryPath,
  },
  output: {
    path: distPath,
    filename: "[name].js",
    clean: true,
  },
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: "ts-loader",
            options: { configFile: "configs/tsconfig.json" },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", "..."],
  },
};

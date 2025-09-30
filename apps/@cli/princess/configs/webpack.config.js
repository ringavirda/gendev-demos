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
  devtool: "source-map",
  output: {
    path: distPath,
    filename: "[name].js",
    devtoolModuleFilenameTemplate: "webpack:///apps/@cli/demo/[resource-path]",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: "configs/tsconfig.json",
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js", "..."],
  },
};

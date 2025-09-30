import path from "path";

const distPath = path.resolve(import.meta.dirname, "..", "dist");
const entryPath = path.resolve(import.meta.dirname, "..", "src/app.ts");

export default {
  mode: "production",
  target: "node",
  optimization: { minimize: true },
  entry: {
    main: entryPath,
  },
  output: {
    path: distPath,
    filename: "[name].js",
    clean: true,
  },
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

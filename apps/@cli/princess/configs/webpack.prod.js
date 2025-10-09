import { merge } from "webpack-merge";
import common from "./webpack.common.js";

export default merge(common, {
  mode: "production",
  target: "node",
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: "all",
    },
  },
});

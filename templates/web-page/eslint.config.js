import { defineConfig } from "eslint/config";
import globals from "globals";
import pluginJs from "@eslint/js";

export default defineConfig([
  {
    ignores: ["node_modules/"],
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
]);

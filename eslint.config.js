import { defineConfig } from "eslint/config";
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    ignores: ["**/dist/", "apps/ts7/", "templates/"],
  },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
    },
  },
]);

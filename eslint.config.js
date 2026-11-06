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
  {
    files: ["apps/princess/src/model/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "../**",
                "@gendev/*",
                "inversify",
                "reflect-metadata",
                "zod",
                "drizzle-orm",
                "drizzle-orm/**",
                "better-sqlite3",
              ],
              message: "The model imports nothing outside src/model.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["apps/princess/src/services/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "../storage/**",
                "../cli/**",
                "../app/**",
                "@gendev/*",
                "zod",
                "drizzle-orm",
                "drizzle-orm/**",
                "better-sqlite3",
              ],
              message: "Services import only the model.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["apps/princess/src/storage/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../cli/**", "../app/**", "@gendev/*"],
              message: "Storage imports only services and the model.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["apps/princess/src/cli/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "../storage/**",
                "../app/**",
                "zod",
                "drizzle-orm",
                "drizzle-orm/**",
                "better-sqlite3",
              ],
              message: "The CLI imports only services and the model.",
            },
          ],
        },
      ],
    },
  },
]);

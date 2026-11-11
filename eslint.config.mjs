import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [
      "packages/frontend/dist/**",
      "packages/frontend/.expo/**",
      "playwright-report/**",
      "test-results/**",
      "node_modules/**",
    ],
  },
  {
    files: ["packages/backend/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["packages/frontend/src/**/*.{js,jsx,mjs,cjs}"],
    ...pluginReact.configs.flat.recommended,
    settings: { react: { version: "detect" } },
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      "react/prop-types": "off",
    },
  },
]);

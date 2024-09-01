import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    files: ["src/**", "**/*.ts", "**/*.tsx"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      project: ["./tsconfig.eslint.json"],
      ecmaVersion: 2020,
      sourceType: "module",
    },
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "double"],
      "explicit-function-return-type": "error",
      "no-explicit-any": "warn",
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: true,
        },
      ],
      "no-inferrable-types": [
        "warn",
        {
          "ignore-parameters": true,
        },
      ],
    },
  },
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];
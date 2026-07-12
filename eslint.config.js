const js = require("@eslint/js");
const globals = require("globals");
const reactHooks = require("eslint-plugin-react-hooks");
const prettier = require("eslint-plugin-prettier");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  {
    ignores: ["dist/**", "release/**", "backend/**", "node_modules/**", "ffmpeg/**", ".venv/**"],
  },
  js.configs.recommended,
  {
    files: ["src/main/**/*.js", "src/preload/**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node,
    },
    rules: {
      "no-console": "off",
    },
  },
  {
    files: ["src/renderer/**/*.{js,jsx}"],
    languageOptions: {
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-unused-vars": ["error", { varsIgnorePattern: "^React$" }],
    },
  },
  {
    files: ["vite.config.js"],
    languageOptions: {
      sourceType: "module",
      globals: globals.node,
    },
  },
  {
    files: ["eslint.config.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node,
    },
  },
  {
    plugins: { prettier },
    rules: {
      "prettier/prettier": "warn",
    },
  },
  prettierConfig,
];

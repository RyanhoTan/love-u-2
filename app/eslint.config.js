const { defineConfig } = require("eslint/config");
const path = require("node:path");
const expoConfig = require("eslint-config-expo/flat");
const reactNative = require("eslint-plugin-react-native");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");

module.exports = defineConfig([
  ...expoConfig,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: path.resolve(),
      },
    },
    rules: {
      "@typescript-eslint/no-deprecated": "warn",
    },
  },
  {
    plugins: {
      "react-native": reactNative,
    },
    rules: {
      "react-native/no-unused-styles": "warn",
    },
  },
]);

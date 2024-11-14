import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    // Apply configuration to JS, JSX, MJS, CJS files
    files: ["**/*.{js,mjs,cjs,jsx}"],

    languageOptions: {
      globals: { ...globals.browser, ...globals.node }, // Global settings for browser & node
    },

    plugins: {
      react: pluginReact,
      js: pluginJs,
    },

    rules: {
      // Disable 'react/react-in-jsx-scope' rule for React 17+
      "react/react-in-jsx-scope": "off",
      // Add other rules here if needed
    },

    settings: {
      react: {
        version: "detect", // Automatically detect React version
      },
    },
    overrides: {
      parser: "espree",
    },
  },
];

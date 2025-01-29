import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import react from "eslint-plugin-react";
import unusedImports from "eslint-plugin-unused-imports";
import _import from "eslint-plugin-import";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import jsxA11Y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-plugin-prettier";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default [
  ...fixupConfigRules(
    compat.extends(
      "next/core-web-vitals",
      "plugin:react/recommended",
      "plugin:prettier/recommended",
      "plugin:react-hooks/recommended",
      "plugin:jsx-a11y/recommended",
      "plugin:@typescript-eslint/recommended"
    )
  ),
  {
    plugins: {
      react: fixupPluginRules(react),
      "unused-imports": unusedImports,
      import: fixupPluginRules(_import),
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
      "jsx-a11y": fixupPluginRules(jsxA11Y),
      prettier: fixupPluginRules(prettier)
    },

    languageOptions: {
      globals: {
        ...Object.fromEntries(Object.entries(globals.browser).map(([key]) => [key, "off"])),
        ...globals.node
      },

      parser: tsParser,
      ecmaVersion: 12,
      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },

    settings: {
      react: {
        version: "detect"
      }
    },

    rules: {
      "react/no-unknown-property": "off",
      "react/prop-types": "off",
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react-hooks/exhaustive-deps": "off",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/interactive-supports-focus": "warn",
      "jsx-a11y/anchor-has-content": "off",
      "jsx-a11y/heading-has-content": "off",
      "prettier/prettier": "off",
      "no-unused-vars": "off",
      "unused-imports/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "warn",

      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-explicit-any": "off",

      "import/order": [
        "off",
        {
          groups: ["type", "builtin", "object", "external", "internal", "parent", "sibling", "index"],

          pathGroups: [
            {
              pattern: "~/**",
              group: "external",
              position: "after"
            }
          ],

          "newlines-between": "always"
        }
      ],

      "react/self-closing-comp": "warn",

      "react/jsx-sort-props": [
        "off",
        {
          callbacksLast: true,
          shorthandFirst: true,
          noSortAlphabetically: false,
          reservedFirst: true
        }
      ]
    }
  },
  {
    ignores: ["**/node_modules/*", ".next/*", "out", "public", "*.mjs", "*.cjs", "*.d.ts", "*.js"],
  }
];

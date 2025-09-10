import js from "@eslint/js"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import tseslint from "@typescript-eslint/eslint-plugin"
import tsparser from "@typescript-eslint/parser"

export default [
  {
    ignores: [
      "dist",
      "build",
      "node_modules",
      "**/*.js",
      "**/*.jsx",
      "src/backend/dist/**",
      "src/backend/node_modules/**",
      "src/backend/mysql-data/**",
      "src/backend/logs/**",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly",
        NodeJS: "readonly",
        HeadersInit: "readonly",
        RequestInit: "readonly",
        PositionCallback: "readonly",
        GeolocationPosition: "readonly",
        Express: "readonly",
        bcrypt: "readonly",
        jwt: "readonly",
      },
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-var-requires": "warn",
      "no-undef": "off", // TypeScript가 처리하므로 비활성화
    },
  },

  {
    files: ["vite.config.ts", "*.config.{ts,js}", "scripts/**/*.{ts,js}"],
    languageOptions: {
      globals: {
        ...globals.node,
        NodeJS: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-var-requires": "off",
      "no-undef": "off",
    },
  },
]

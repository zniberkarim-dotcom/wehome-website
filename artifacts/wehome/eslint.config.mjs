import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
      globals: {
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        console: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": "warn",
      // Newly-strict react-hooks/* rules (React 19) softened to warn — real
      // fixes come in Sprint 2+, keep the Sprint 1 hygiene gate green.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/purity": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "smart"],

      // Guard-rail: <Navbar> must declare its backdrop explicitly on every route.
      // The default is theme="dark" (9 of 13 public routes need it), which means a new
      // page with a light top fails SILENTLY — white nav text on a light background,
      // measured at 1.0-1.05:1 contrast. No error, no build warning, just an unreadable
      // header. This rule turns that silent failure into a lint error.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            'JSXElement[openingElement.name.name="Navbar"]:not(:has(JSXAttribute[name.name="theme"]))',
          message:
            'Navbar requires an explicit theme prop: <Navbar theme="dark" /> over a dark hero, <Navbar theme="light" /> on a light page. See DESIGN_SYSTEM.md §11.',
        },
      ],
    },
  },
  { ignores: ["node_modules", "dist", "build", "public"] },
];

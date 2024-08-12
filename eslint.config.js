import pluginJs from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "max-lines-per-function": [
        "warn",
        { max: 20, skipBlankLines: true, skipComments: true },
      ],
      "max-lines": [
        "warn",
        { max: 150, skipBlankLines: true, skipComments: true },
      ],
    },
  },
  {
    files: ["**/*.{test,test-d}.ts", "**/vitest.setup.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "max-lines-per-function": "off",
      "max-lines": "off",
    },
  },
  { ignores: ["**/{dist,sync-rpc}/**/*"] },
];

import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  {
    rules: {
      "no-unused-vars": "warn",
    },
  },
  globalIgnores([
    "dist/**",
    "node_modules/**",
  ]),
]);

export default eslintConfig;

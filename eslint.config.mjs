import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    /*
     * `--template/` is a stray create-next-app scaffold: a mis-parsed `npx` flag
     * became a directory name, and it got committed with its build output. It is
     * imported by nothing. Ignored here so its generated `.next/types` files stop
     * reporting twenty-five errors that belong to no one; deleting it is a
     * separate decision, since the files are tracked.
     */
    "--template/**",
  ]),
]);

export default eslintConfig;

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
  ]),
  {
    // React Three Fiber scenes mutate Three.js objects inside the render
    // loop (useFrame) — an intentional imperative pattern that the
    // React Compiler immutability rules are not designed for.
    files: ["components/3d/**"],
    rules: {
      "react-hooks/immutability": "off",
    },
  },
]);

export default eslintConfig;

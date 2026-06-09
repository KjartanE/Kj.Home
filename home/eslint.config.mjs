import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  globalIgnores([".next/**"]),
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      // react-hooks v6 compiler-alignment rules: the canvas/Three.js components
      // rely on mount-guard and render-time ref patterns these flag.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/use-memo": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/immutability": "warn"
    }
  }
]);

export default eslintConfig;

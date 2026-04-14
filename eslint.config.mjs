import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    extends: ["next/core-web-vitals"],
  },
]);

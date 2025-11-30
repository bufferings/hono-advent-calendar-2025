import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: "http://localhost:3000/doc",
    output: {
      mode: "single",
      target: "./src/api/generated.ts",
      client: "react-query",
      override: {
        mutator: {
          path: "./src/api/fetcher.ts",
          name: "customFetcher",
          extension: ".ts",
        },
      },
    },
  },
});

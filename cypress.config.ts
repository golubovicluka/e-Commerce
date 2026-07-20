import { defineConfig } from "cypress";

export default defineConfig({
  projectId: '4wfd7y',
  e2e: {
    setupNodeEvents(_on, config) {
      return config;
    },
  },

  component: {
    devServer: {
      framework: "angular",
      bundler: "webpack",
    },
    specPattern: "**/*.cy.ts",
  },
});

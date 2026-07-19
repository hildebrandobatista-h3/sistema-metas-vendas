import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: false,
    setupNodeEvents(on, config) {
      // Implementar task plugins aqui se necessário
    },
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 5000,
    requestTimeout: 5000,
    responseTimeout: 5000,
    // Retry failed tests
    retries: {
      runMode: 1,
      openMode: 0,
    },
    // Screenshot on failure
    screenshotOnRunFailure: true,
    video: true,
    videoCompression: 32,
    videosFolder: "cypress/videos",
    screenshotsFolder: "cypress/screenshots",
    downloadsFolder: "cypress/downloads",
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});
